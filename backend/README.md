# AllerSafe API

API REST con Node.js, Express y MongoDB/Mongoose para gestionar clases y talleres culinarios.

## Requisitos

- Node.js 18+
- MongoDB local o MongoDB Atlas

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` y configura `MONGODB_URI`.

## Arranque

```bash
npm run dev
```

o:

```bash
npm start
```

## Seed

Con MongoDB disponible:

```bash
npm run seed
```

Inserta 5 clases culinarias de prueba.

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/auth/me` (requiere cookie de sesión)
- `POST /api/auth/logout` (requiere cookie de sesión)
- `GET /api/profile` (requiere autenticación)
- `PATCH /api/profile` (requiere autenticación)
- `GET /api/users` (requiere rol Admin)
- `POST /api/users` (requiere rol Admin)
- `PATCH /api/users/:id` (requiere rol Admin)
- `DELETE /api/users/:id` (soft delete, requiere rol Admin)
- `GET /api/events`
- `GET /api/events?includeDeleted=true`
- `GET /api/events/:id`
- `GET /api/events/slug/:slug`
- `POST /api/events`
- `PATCH /api/events/:id`
- `PATCH /api/events/:id/activate`
- `PATCH /api/events/:id/deactivate`
- `DELETE /api/events/:id` (soft delete)
- `GET /api/health`

## Autenticación

El login establece el JWT en una cookie `HttpOnly`; el navegador la envía
automáticamente en las peticiones. El token no se devuelve en el cuerpo ni
debe guardarse en `localStorage`.

`GET /api/auth/me` devuelve el usuario y el rol de la sesión actual. El servidor
valida los permisos en cada petición; el rol devuelto al frontend solo se usa
para mostrar la interfaz.

El servidor guarda en la blacklist únicamente `sha256(JWT)`, nunca el token
completo. Los tokens revocados no se pueden reutilizar aunque no hayan
expirado.

La documentación completa está en `postman.md`.
