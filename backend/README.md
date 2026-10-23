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

La documentación completa está en `postman.md`.
