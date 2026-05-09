# Convenciones de código

## General
- TypeScript strict: true en todos los tsconfig.json
- Sin any. Usar unknown si el tipo es incierto.
- Funciones async/await. Sin callbacks ni .then/.catch anidados.
- Exports nombrados. Sin export default en servicios o controladores.

## Respuestas HTTP (todos los servicios deben seguir este formato)
{
  "success": true | false,
  "data": <payload> | null,
  "message": "descripción opcional"
}

## Errores
- Usar un middleware global de errores en cada servicio
- Los controladores usan try/catch y pasan el error a next(err)
- Códigos HTTP estándar: 200, 201, 400, 401, 403, 404, 500

## Base de datos (Drizzle)
- Los schemas van en /src/db/schema.ts
- Las queries van en /src/services/, nunca en los controladores
- Usar transacciones cuando se modifiquen 2 o más tablas

## Nombres
- Archivos: kebab-case (auth-controller.ts)
- Variables y funciones: camelCase
- Tipos e interfaces: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Tablas SQLite: snake_case (appointments, barber_services)

## React Native
- Un componente por archivo
- Los screens van en /src/screens/
- Los componentes reutilizables en /src/components/
- Las llamadas a la API van en /src/api/, nunca en los componentes
- Usar custom hooks para lógica de negocio (/src/hooks/)