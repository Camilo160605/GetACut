# Tech Stack — Barbershop App

## Frontend
- Framework: React Native (Expo)
- Lenguaje: TypeScript strict mode
- Navegación: React Navigation v6
- Estado global: Zustand
- HTTP client: Axios con interceptores JWT
- Estilos: StyleSheet nativo (sin librerías externas)

## Backend
- Runtime: Node.js 20+
- Framework: Express.js
- Lenguaje: TypeScript strict mode
- Validación: Zod
- Auth: JWT (jsonwebtoken) + bcrypt
- ORM: Drizzle ORM (compatible con SQLite)

## Base de datos
- Motor: SQLite (mejor-sqlite3)
- Migraciones: Drizzle Kit
- Una base de datos por microservicio (patrón DB-per-service)

## Arquitectura
- Patrón: Microservicios
- Comunicación: REST entre servicios (HTTP interno)
- Cada servicio corre en su propio puerto y tiene su propio SQLite
- NO usar librerías de mensajería por ahora (sin RabbitMQ, sin Kafka)