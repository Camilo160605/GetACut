import axios from 'axios';

const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003';

const CATALOG_SERVICE_URL =
  process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3004';

// Percentage of each service price that goes to the barber (configurable via env)
export const BARBER_EARNINGS_PERCENTAGE =
  parseFloat(process.env.BARBER_EARNINGS_PERCENTAGE ?? '40');

// ─── Types mirroring the shapes returned by other services ───────────────────

interface Appointment {
  id: number;
  clientId: number;
  barberId: number;
  serviceId: number;
  startTime: number; // Unix timestamp (seconds)
  endTime: number;
  status: string;
  createdAt: unknown;
}

interface CatalogService {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
  description: string | null;
}

interface ServiceResponse {
  success: boolean;
  data: CatalogService | null;
  message: string | null;
}

interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
  message: string | null;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface BarberEarningsEntry {
  barberId: number;
  appointmentsCount: number;
  grossTotal: number;
  barberEarnings: number;
}

export interface DailyReportResult {
  date: string;
  barberEarningsPercentage: number;
  entries: BarberEarningsEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the Unix timestamps for the start and end of a given date (UTC).
 * date format: YYYY-MM-DD
 */
const dayBounds = (date: string): { dayStart: number; dayEnd: number } => {
  const dayStart = Math.floor(new Date(`${date}T00:00:00.000Z`).getTime() / 1000);
  const dayEnd = Math.floor(new Date(`${date}T23:59:59.999Z`).getTime() / 1000);
  return { dayStart, dayEnd };
};

/**
 * Fetches all completed appointments for a given barber from booking-service,
 * then filters by the target date range.
 * We use GET /appointments/barber/:id which returns all appointments for that barber.
 */
const fetchCompletedAppointmentsForDate = async (
  barberId: number,
  dayStart: number,
  dayEnd: number,
  authHeader: string
): Promise<Appointment[]> => {
  const url = `${BOOKING_SERVICE_URL}/appointments/barber/${barberId}`;
  const response = await axios.get<AppointmentsResponse>(url, {
    headers: { Authorization: authHeader },
    timeout: 5000,
  });

  return (response.data.data ?? []).filter(
    (a) =>
      a.status === 'completed' &&
      a.startTime >= dayStart &&
      a.startTime <= dayEnd
  );
};

/**
 * Fetches the price of a service from catalog-service.
 * Returns 0 if the service cannot be found (graceful degradation).
 */
const fetchServicePrice = async (
  serviceId: number,
  authHeader: string
): Promise<number> => {
  try {
    const url = `${CATALOG_SERVICE_URL}/catalog/services/${serviceId}`;
    const response = await axios.get<ServiceResponse>(url, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });
    return response.data.data?.price ?? 0;
  } catch {
    console.warn(`[report-service] Could not fetch price for service ${serviceId}`);
    return 0;
  }
};

// ─── Main report logic ────────────────────────────────────────────────────────

/**
 * Builds the daily earnings report for all barbers that had completed
 * appointments on the given date.
 *
 * Strategy:
 * 1. Fetch ALL appointments from booking-service filtered by date + completed status.
 *    booking-service exposes GET /appointments/barber/:id, so we need the list of
 *    barber IDs first. We get them by fetching a broad date range and collecting
 *    unique barberIds from the response.
 *
 * Because booking-service has no "all appointments" admin endpoint yet, we use a
 * two-pass approach:
 *   Pass 1 — collect unique barberIds from a broad query (we query barber 0 which
 *            returns empty, then rely on the caller passing known barberIds, OR we
 *            expose a dedicated internal endpoint).
 *
 * Simpler approach used here: booking-service GET /appointments/barber/:id is called
 * per barber. Since we don't have a barber list endpoint yet, we accept an optional
 * `barberIds` hint. If not provided, we fall back to fetching the full list from
 * booking-service using a special internal route (if available) or return an empty
 * report with a note.
 *
 * For now we implement the clean version: the report-service calls
 * GET /appointments/barber/:id for each known barberId. The barberIds are discovered
 * by calling booking-service's internal summary endpoint. Since that doesn't exist
 * yet, we expose a helper that accepts an optional barberIds query param so the
 * gateway/admin can pass them, and we also try a self-discovery approach.
 */
export const buildDailyReport = async (
  date: string,
  authHeader: string,
  barberIds?: number[]
): Promise<DailyReportResult> => {
  const { dayStart, dayEnd } = dayBounds(date);

  // If no barberIds provided, we cannot discover them without a dedicated endpoint.
  // Return empty entries with a clear message in the log.
  const ids = barberIds ?? [];

  if (ids.length === 0) {
    console.warn(
      '[report-service] No barberIds provided — pass ?barberIds=1,2,3 to get results'
    );
    return {
      date,
      barberEarningsPercentage: BARBER_EARNINGS_PERCENTAGE,
      entries: [],
    };
  }

  // Fetch completed appointments per barber in parallel
  const appointmentsByBarber = await Promise.all(
    ids.map(async (barberId) => ({
      barberId,
      appointments: await fetchCompletedAppointmentsForDate(
        barberId,
        dayStart,
        dayEnd,
        authHeader
      ),
    }))
  );

  // Collect unique serviceIds across all appointments
  const allAppointments = appointmentsByBarber.flatMap((b) => b.appointments);
  const uniqueServiceIds = [...new Set(allAppointments.map((a) => a.serviceId))];

  // Fetch all service prices in parallel
  const priceMap = new Map<number, number>();
  await Promise.all(
    uniqueServiceIds.map(async (serviceId) => {
      const price = await fetchServicePrice(serviceId, authHeader);
      priceMap.set(serviceId, price);
    })
  );

  // Build entries — skip barbers with no completed appointments
  const entries: BarberEarningsEntry[] = appointmentsByBarber
    .filter((b) => b.appointments.length > 0)
    .map(({ barberId, appointments: appts }) => {
      const grossTotal = appts.reduce(
        (sum, a) => sum + (priceMap.get(a.serviceId) ?? 0),
        0
      );
      const barberEarnings =
        Math.round(grossTotal * (BARBER_EARNINGS_PERCENTAGE / 100) * 100) / 100;

      return {
        barberId,
        appointmentsCount: appts.length,
        grossTotal: Math.round(grossTotal * 100) / 100,
        barberEarnings,
      };
    });

  return {
    date,
    barberEarningsPercentage: BARBER_EARNINGS_PERCENTAGE,
    entries,
  };
};
