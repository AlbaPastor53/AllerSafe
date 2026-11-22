# AllerSafe IA API

API independiente del asistente IA de AllerSafe. Sugiere sustituciones de
ingredientes en recetas teniendo en cuenta alergias, intolerancias y celiaquía.
Usa Node.js, Express y la API de Groq. No se conecta a MongoDB ni al backend
principal.

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` y configura `GROQ_API_KEY` con tu clave de
[Groq](https://console.groq.com/keys). No subas `.env` al repositorio.

## Arranque

```bash
npm run dev
```

o:

```bash
npm start
```

El servidor escucha en `http://localhost:3001` y se detiene al arrancar si
falta `GROQ_API_KEY`.

## Endpoints

- `GET /api/health`
- `POST /api/chatbot/message`

Ejemplo de petición:

```bash
curl -X POST http://localhost:3001/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Soy celíaca, ¿puedo usar avena en un pan?"}]}'
```

La respuesta tiene la forma `{ "success": true, "data": { "reply": "..." } }`.
El historial se envía en cada petición; el servidor no guarda conversaciones.
