# Reglas de Arquitectura

## Servicios del sistema
| Servicio        | Puerto | Responsabilidad                        |
|-----------------|--------|----------------------------------------|
| auth-service    | 3001   | Login, registro, emisión de JWT        |
| barber-service  | 3002   | Gestión de barberos                    |
| booking-service | 3003   | Citas, horarios, disponibilidad        |
| catalog-service | 3004   | Servicios/cortes y sus duraciones      |
| report-service  | 3005   | Ganancias diarias y porcentajes        |
| api-gateway     | 3000   | Proxy único que expone todo al cliente |

## Reglas estrictas
- Cada microservicio tiene su PROPIA base de datos SQLite. 
  NUNCA compartir un archivo .db entre servicios.
- Un servicio NO importa modelos de otro servicio.
  Si necesita datos de otro, hace una petición HTTP interna.
- Cada servicio tiene su propio package.json y puede desplegarse solo.
- El API Gateway es el ÚNICO punto de entrada desde React Native.
  React Native NUNCA llama directo a un microservicio.
- Las rutas del gateway siguen el patrón:
  /api/auth/*    → auth-service:3001
  /api/barbers/* → barber-service:3002
  /api/bookings/* → booking-service:3003
  /api/catalog/*  → catalog-service:3004
  /api/reports/*  → report-service:3005

## Estructura de cada servicio
  /auth-service
    /src
      /routes
      /controllers
      /services
      /db
        schema.ts      ← Drizzle schema
        index.ts       ← conexión SQLite
      /middlewares
      index.ts
    drizzle.config.ts
    package.json