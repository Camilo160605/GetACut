# Reporte de Ganancias Diarias

## Requisitos
- Al final del día el admin ve cuánto generó cada barbero
- La barbería trabaja con un porcentaje fijo por servicio (ej. 40% para el barbero)
- El reporte muestra: barbero, citas completadas, total bruto y ganancia del barbero

## Diseño
- GET /reports/daily?date=2026-05-07  → admin obtiene el reporte del día

## Lógica
- Filtrar citas con status = 'completed' en esa fecha
- Agrupar por barbero
- Por cada cita: ganancia = service.price * (porcentaje / 100)
- Retornar array con resumen por barbero

## Tareas
- [ ] Endpoint /reports/daily protegido con requireRole('admin')
- [ ] Agregación MongoDB: group by barberId, sum de precios
- [ ] Aplicar porcentaje configurable (guardado en config o en el modelo de barbero)
- [ ] Formato de respuesta: [{ barber, appointmentsCount, grossTotal, barberEarnings }]