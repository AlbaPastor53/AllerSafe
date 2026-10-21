# AllerSafe — Frontend

Aplicación Angular 18 para consultar y administrar eventos de AllerSafe. Consume la API Express del backend incluido (`http://localhost:3000/api`).

## Requisitos

- Node.js 18 o superior con npm
- El backend de AllerSafe y MongoDB levantados en `http://localhost:3000` (consulta el README del backend incluido).

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

Arranca `ng serve` en `http://localhost:4200/` y recarga al guardar cambios. Las llamadas a la API
salen desde el navegador hacia `http://localhost:3000` (CORS habilitado en la API para el puerto 4200).

## Build de producción

```bash
npm run build
```

Los artefactos quedan en `dist/AllerSafe/`.

## Scripts

| Comando         | Descripción                              |
| --------------- | ---------------------------------------- |
| `npm start`     | Servidor de desarrollo (`ng serve`)      |
| `npm run build` | Build de producción (`ng build`)         |

No hay suite de tests configurada. Ejecuta `npm run build` para comprobar la compilación.

## Estructura

```text
src/
├── environments/            environment.ts (producción) y environment.development.ts
├── styles.css               Tailwind + helpers (.form-*, .button-*, .badge*)
└── app/
    ├── core/
    │   ├── interceptors/    loading + error (SweetAlert2 en español)
    │   ├── models/          interfaces de evento, filtros y ApiResponse
    │   ├── services/        ApiService (HTTP + timeout) y servicio de eventos y ApiService (URL centralizada)
    │   └── stores/          store de eventos (signals; evento seleccionado, loading, error y stale)
    ├── features/routes/
    │   ├── components/      fila de evento y filtros, route-form (compartido)
    │   ├── pages/           route-list, route-detail, route-create, route-edit
    │   └── routes.routes.ts eventos: '' (lista), create, :id/edit, :id
    ├── layouts/main-layout/ navbar + <router-outlet>
    └── shared/              navbar, loader, skeleton, empty/error states, utils (validators, format, error.util)
```

Flujo de datos: página → store → `CoursesService` → `ApiService` → `HttpClient`; los componentes
hijos solo reciben inputs/emiten outputs.

## Variables de entorno

`src/environments/environment.ts` (producción) y `environment.development.ts`, intercambiadas con
`fileReplacements` en `angular.json`:

| Clave            | Valor                              | Uso                                        |
| ---------------- | ---------------------------------- | ------------------------------------------ |
| `production`     | `true` / `false`                   | Modo de compilación                        |
| `API_URL`        | `http://localhost:3000/api`     | Base de todos los endpoints                |
| `requestTimeout` | `10000` (ms)                       | Timeout de cada petición en `ApiService`   |

## Funcionalidades

- Listado con filtros (dificultad, país, región, distancia, estado de publicación) y búsqueda por
  ID hexadecimal de 24 caracteres (validada con Reactive Forms).
- Alta y edición de eventos con validación en cliente y mensajes
  accesibles (`role="alert"`, `aria-invalid`/`aria-describedby`).
- Detalle con caché: si el store ya tiene ese evento y no está desactualizada, no repite la petición.
- Borrado lógico (soft delete), con confirmación SweetAlert2 y refresco de la lista.
- Manejo de errores centralizado: el interceptor traduce los códigos de la API a mensajes en
  español (incluye el desglose `details` de Zod en los 400) y `error.util` cubre errores no HTTP
  (respuestas inválidas, timeouts).
- Todos los componentes usan `ChangeDetectionStrategy.OnPush` y signals.


## Campos y API de eventos

El formulario utiliza los campos admitidos por el backend: `name`, `slug` (opcional), `description`, `date`, `price`, `category`, `capacity` y `status` en edición. Las categorías válidas son `alergias`, `cocina`, `reposteria`, `nutricion` y `seguridad`; los estados son `draft`, `published`, `cancelled` y `completed`.

La base de API configurada en `src/environments/environment.ts` y `environment.development.ts` es `http://localhost:3000/api`. Las operaciones usan `GET/POST /events`, `GET/PATCH/DELETE /events/:id` y `PATCH /events/:id/activate` o `/deactivate`. El backend realiza borrado lógico, pero no ofrece una operación de restauración; por eso los eventos eliminados dejan de aparecer en la lista normal.
