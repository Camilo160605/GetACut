# Autenticación y Registro

## Requisitos
- Un cliente puede registrarse con nombre, email y contraseña
- Un barbero solo puede ser registrado por el administrador
- Hay 3 roles: client | barber | admin
- Login retorna un JWT con rol embebido
- Las rutas privadas validan el JWT y el rol

## Diseño
- POST /auth/register   → cliente se registra
- POST /auth/login      → todos los roles
- POST /admin/barbers   → admin crea barbero (ruta protegida)
- Middleware: verifyToken(req) + requireRole('admin')

## Tareas
- [ ] Modelo User { name, email, password, role, createdAt }
- [ ] Hash de contraseña con bcrypt
- [ ] Generación y validación de JWT
- [ ] Middleware de autenticación y autorización
- [ ] Endpoints de registro y login