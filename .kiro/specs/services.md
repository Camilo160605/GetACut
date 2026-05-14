# Catálogo de Servicios

## Requisitos
- El admin puede crear, editar y eliminar servicios (cortes, tratamientos, etc.)
- Cada servicio tiene nombre, descripción, precio y duración en minutos
- Cualquier usuario autenticado puede listar y ver servicios
- Los servicios se usan como referencia en el booking-service para calcular disponibilidad

## Diseño
- GET    /catalog/services          → lista todos los servicios (autenticado)
- GET    /catalog/services/:id      → detalle de un servicio (autenticado)
- POST   /catalog/services          → admin crea un servicio
- PUT    /catalog/services/:id      → admin edita un servicio
- DELETE /catalog/services/:id      → admin elimina un servicio

## Modelo
- Service { id, name, description, price, durationMinutes, createdAt }

## Tareas
- [ ] Modelo Service { name, description, price, durationMinutes, createdAt }
- [ ] CRUD completo de servicios
- [ ] Rutas de escritura protegidas con requireRole('admin')
- [ ] Rutas de lectura protegidas con verifyToken
- [ ] Validación Zod en creación y edición
