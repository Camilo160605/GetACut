# Sistema de Agendamiento

## Requisitos
- El cliente elige barbero, servicio, fecha y hora
- El sistema valida que la franja horaria esté libre
- Cada cita ocupa el tiempo exacto del servicio seleccionado
- El barbero ve su agenda del día: hora, cliente, servicio y duración
- Los estados de cita son: pending | confirmed | completed | cancelled

## Diseño
- POST /appointments            → cliente crea cita
- GET  /appointments/me         → cliente ve sus citas
- GET  /appointments/barber/:id → barbero ve su agenda
- PUT  /appointments/:id/status → barbero o admin cambia estado

## Lógica de disponibilidad
- Al agendar: buscar citas del barbero en esa fecha
- Verificar que [hora_inicio, hora_inicio + duracion] no choque con ninguna cita existente
- Rechazar si hay solapamiento

## Tareas
- [ ] Modelo Appointment { clientId, barberId, serviceId, startTime, endTime, status }
- [ ] Función checkAvailability(barberId, startTime, endTime)
- [ ] Endpoint de creación con validación de disponibilidad
- [ ] Endpoint de agenda por barbero (ordenada por hora)