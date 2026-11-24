# Sistema de Reservas de Canchas Deportivas

Aplicación web para reservar canchas deportivas por horas exactas. Evita reservas duplicadas de la misma cancha, limita a dos las reservas activas por persona y día, y permite cancelar reservas. Está formada por una API en Node/Express y un front en React.

## Integrantes

- Andrés Mendoza: autor de la entrega final (API, front, pruebas, despliegue en AWS y documentación).
- Pedro Rodríguez: integrante inicial del equipo; su aporte a la primera versión (HTML, CSS y JavaScript) queda en el historial de Git. No participó en la entrega final.
- Revisión de Pull Requests: andresdavidbh2006-sudo.

## Tecnologías

- API: Node.js, Express y cors
- Front: React con Vite
- Pruebas: Vitest
- Infraestructura: AWS (S3 para el front, EC2 para la API)

## Cómo levantarlo en local

Requisitos: Node.js 18 o superior.

API:

```powershell
cd api
npm install
npm start
```

Escucha en `http://localhost:3000`. Variables de entorno (ver `api/.env.example`): `PORT` y `FRONT_URL`. Si `FRONT_URL` está definida, CORS solo acepta peticiones de esa dirección.

Front, en otra terminal:

```powershell
cd front
npm install
npm run dev
```

Abre `http://localhost:5173`. La dirección de la API sale de `VITE_API_URL` (ver `front/.env.example`); en desarrollo vale `http://localhost:3000`.

## Endpoints

| Método | Ruta | Qué hace | Respuestas |
|---|---|---|---|
| GET | `/reservas` | Lista todas las reservas | 200 |
| GET | `/reservas/resumen` | Total, activas y canceladas | 200 |
| POST | `/reservas` | Crea una reserva (nombre, cancha, fecha, hora) | 201 creada, 400 datos inválidos, 409 horario ocupado o límite diario |
| PATCH | `/reservas/:id/cancelar` | Cancela una reserva | 200, 404 si no existe |

Reglas: la hora debe ser exacta (HH:00), desde las 06:00 y antes de las 22:00; una cancha no se puede reservar dos veces en la misma fecha y hora; cada persona puede tener máximo 2 reservas activas por día.

## Cómo correr las pruebas

```powershell
cd api
npm test
```

Son 12 pruebas con Vitest sobre las reglas del negocio (`api/src/logica`), con casos límite como la hora de apertura exacta (06:00), la hora de cierre (22:00) y la segunda y tercera reserva del día.

## Despliegue

- Front: se compila con `npm run build` y el contenido de `front/dist` se sube a un bucket de S3 con hospedaje de sitio estático. La dirección de la API se fija en `front/.env.production` (fuera de Git).
- API: corre en una instancia EC2 (Amazon Linux 2023, t3.micro) creada con el script `deploy/user-data.sh`, que instala Node, clona el repositorio y deja la API como servicio de systemd.
- Un segundo bucket de S3, privado, responde 403 (AccessDenied) a cualquier acceso público.
- Al terminar las evidencias, la instancia se terminó y el Security Group se eliminó para no dejar recursos activos.

### Seguridad

- Validación en el servidor: el POST valida datos, fecha y hora, y responde 400 o 409 con un mensaje claro.
- Secretos fuera de Git: `.env`, `.env.local`, `.env.production`, `node_modules` y `dist` están en el `.gitignore`; solo se versionan los `.env.example`.
- CORS restringido: en el despliegue, `FRONT_URL` apunta al bucket del front.
- Security Group mínimo: una sola regla de entrada (HTTP 80) y SSH cerrado.
- Dependencias: `npm audit` en `api/` y en `front/` reporta 0 vulnerabilidades.

