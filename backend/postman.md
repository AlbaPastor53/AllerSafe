# AllerSafe API - Guía de Postman

Base URL:

`http://localhost:3000/api`

## 1. Health

**GET** `/health`

No requiere body.

## 2. Listar eventos activos

**GET** `/events`

Por defecto no devuelve eventos con `deleted_at`.

## 3. Listar incluyendo eliminados

**GET** `/events?includeDeleted=true`

Permite comprobar el soft delete.

## 4. Obtener por ID

**GET** `/events/:id`

Ejemplo:

`GET /events/671234567890123456789012`

## 5. Obtener por slug

**GET** `/events/slug/cocina-segura-para-alergias`

Este endpoint usa el método `getBySlug` del servicio/repositorio.

## 6. Crear evento

**POST** `/events`

Headers:

`Content-Type: application/json`

Body:

```json
{
  "name": "Taller de cocina sin frutos secos",
  "description": "Aprende recetas seguras y técnicas para evitar contaminación cruzada.",
  "date": "2026-12-20T17:00:00.000Z",
  "price": 22,
  "category": "alergias",
  "capacity": 15
}
```

El `slug` es opcional: si no se envía, se genera a partir de `name`.

## 7. Actualizar evento

**PATCH** `/events/:id`

Body de ejemplo:

```json
{
  "name": "Taller actualizado",
  "price": 24,
  "capacity": 18
}
```

Todos los campos del body son opcionales en la actualización.

## 8. Activar

**PATCH** `/events/:id/activate`

Cambia:

`isActive = true`

## 9. Desactivar

**PATCH** `/events/:id/deactivate`

Cambia:

`isActive = false`

## 10. Soft delete

**DELETE** `/events/:id`

No elimina físicamente el documento.

Establece:

- `deleted_at` con la fecha actual
- `isActive = false`
- `status = cancelled`

## Flujo recomendado de prueba

1. Ejecutar `npm install`.
2. Configurar `.env`.
3. Ejecutar `npm run seed`.
4. Arrancar con `npm run dev`.
5. Probar `GET /api/health`.
6. Probar `GET /api/events`.
7. Copiar un `_id` y probar `GET /api/events/:id`.
8. Probar `GET /api/events/slug/:slug`.
9. Probar `POST /api/events`.
10. Probar `PATCH /activate` y `/deactivate`.
11. Probar `DELETE`.
12. Volver a probar `GET /api/events?includeDeleted=true`.

## Respuesta de error

Los errores tienen esta forma:

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Evento no encontrado."
  }
}
```

Las entradas inválidas devuelven HTTP 400.
