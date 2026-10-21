require("dotenv").config();

const connectDB = require("./config/db");
const Event = require("./models/event.model");

const seedEvents = [
  {
    name: "Cocina segura para alergias",
    slug: "cocina-segura-para-alergias",
    description: "Taller práctico para prevenir contaminación cruzada y cocinar de forma segura.",
    date: new Date("2026-11-10T17:00:00Z"),
    price: 25,
    category: "alergias",
    capacity: 15,
    isActive: true,
    status: "published"
  },
  {
    name: "Repostería sin gluten",
    slug: "reposteria-sin-gluten",
    description: "Clase de repostería con recetas sencillas y técnicas para sustituir el gluten.",
    date: new Date("2026-11-14T10:00:00Z"),
    price: 30,
    category: "reposteria",
    capacity: 12,
    isActive: true,
    status: "published"
  },
  {
    name: "Cocina infantil segura",
    slug: "cocina-infantil-segura",
    description: "Actividad culinaria para aprender hábitos de higiene, seguridad y alimentación.",
    date: new Date("2026-11-21T11:00:00Z"),
    price: 20,
    category: "seguridad",
    capacity: 16,
    isActive: true,
    status: "published"
  },
  {
    name: "Nutrición y etiquetado de alimentos",
    slug: "nutricion-y-etiquetado-de-alimentos",
    description: "Aprende a interpretar etiquetas y detectar alérgenos habituales en productos.",
    date: new Date("2026-12-02T18:00:00Z"),
    price: 18,
    category: "nutricion",
    capacity: 25,
    isActive: true,
    status: "published"
  },
  {
    name: "Cocina mediterránea consciente",
    slug: "cocina-mediterranea-consciente",
    description: "Recetas mediterráneas adaptables a distintas necesidades alimentarias.",
    date: new Date("2026-12-12T10:30:00Z"),
    price: 28,
    category: "cocina",
    capacity: 14,
    isActive: true,
    status: "published"
  }
];

async function seed() {
  try {
    await connectDB();
    await Event.deleteMany({});
    await Event.insertMany(seedEvents);
    console.log("Seed completado: 5 eventos insertados.");
  } catch (error) {
    console.error("Error ejecutando seed:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seed();
