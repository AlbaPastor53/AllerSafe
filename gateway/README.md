# AllerSafe API Gateway

Punto de entrada único para las APIs de AllerSafe. No sustituye a los
microservicios: reenvía las peticiones a los puertos que ya existen.

## Requisitos

- Node.js 18+
- `backend` en marcha (por defecto `http://127.0.0.1:3000`)
- `backend_ia` en marcha (por defecto `http://127.0.0.1:3001`)

## Configuración

Opcional: copia `.env.example` a `.env`. El gateway funciona sin `.env` porque
todos los valores tienen un valor por defecto.

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `4000` | Puerto del gateway |
| `BACKEND_URL` | `http://127.0.0.1:3000` | API REST principal |
| `IA_URL` | `http://127.0.0.1:3001` | API del asistente IA |
| `CORS_ORIGIN` | `http://localhost:4200,http://127.0.0.1:4200` | Orígenes permitidos (con credenciales) |
| `IA_TIMEOUT` | `60000` | Timeout en ms para las peticiones a Groq |
| `LOG_LEVEL` | `dev` | Formato de `morgan` |

## Arranque

```bash
npm install
npm start
```

Para arrancar toda la aplicación (backend, IA, gateway y frontend) con un solo
comando, desde la raíz del repositorio:

```bash
npm install
npm run dev
```

## Rutas

| Ruta del gateway | Destino |
| --- | --- |
| `/api/auth/*`, `/api/events/*`, `/api/shop/*`, ... | `BACKEND_URL` (mismo path) |
| `/api/chatbot/*` | `IA_URL/api/chatbot/*` |
| `/api/faq/*` | `IA_URL/api/faq/*` |
| `/api/ia/health` | `IA_URL/api/health` |
| `/api/health` | `BACKEND_URL/api/health` |
| `/health` | Comprueba ambos servicios y devuelve su estado |

Las cookies `HttpOnly` se reenvían sin reescribir su dominio ni su `path`, por lo
que el login sigue funcionando igual que antes.
