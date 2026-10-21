const EventEmitter = require("events");

const eventBus = new EventEmitter();

eventBus.on("event.created", (event) => {
  console.log(`[EVENT] Evento creado: ${event.slug}`);
});

eventBus.on("event.deleted", (event) => {
  console.log(`[EVENT] Evento eliminado lógicamente: ${event.slug}`);
});

module.exports = eventBus;
