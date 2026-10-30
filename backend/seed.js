require("dotenv").config();

const argon2 = require("argon2");

const connectDB = require("./config/db");
const User = require("./models/user.model");
const Host = require("./models/host.model");
const Category = require("./models/category.model");
const Location = require("./models/location.model");
const Event = require("./models/event.model");
const EventImage = require("./models/eventImage.model");
const Departure = require("./models/departure.model");

const DEFAULT_PASSWORD = "AllerSafe123!";

const seedUsers = [
  {
    name: "Admin AllerSafe",
    email: "admin@allersafe.com",
    role: "Admin",
    slug: "admin-allersafe"
  },
  {
    name: "Chef AllerSafe",
    email: "chef@allersafe.com",
    role: "Client",
    slug: "chef-allersafe"
  },
  {
    name: "Marta Nutrición",
    email: "marta@allersafe.com",
    role: "Client",
    slug: "marta-nutricion"
  },
  {
    name: "Cliente Demo",
    email: "cliente@allersafe.com",
    role: "Client",
    slug: "cliente-demo"
  }
];

const seedHosts = [
  {
    email: "chef@allersafe.com",
    biography: "Chef especializado en cocina segura para personas con alergias alimentarias.",
    slug: "chef-allersafe"
  },
  {
    email: "marta@allersafe.com",
    biography: "Dietista-nutricionista experta en etiquetado y alimentación saludable.",
    slug: "marta-nutricion"
  }
];

const seedCategories = [
  {
    name: "Alergias",
    slug: "alergias",
    description: "Prevención y gestión de alergias alimentarias."
  },
  {
    name: "Cocina",
    slug: "cocina",
    description: "Técnicas de cocina segura y saludable."
  },
  {
    name: "Repostería",
    slug: "reposteria",
    description: "Repostería adaptada a intolerancias y alergias."
  },
  {
    name: "Nutrición",
    slug: "nutricion",
    description: "Lectura de etiquetas y alimentación equilibrada."
  },
  {
    name: "Seguridad alimentaria",
    slug: "seguridad",
    description: "Higiene, conservación y prevención de la contaminación cruzada."
  }
];

const seedLocations = [
  {
    name: "Aula AllerSafe",
    address: "Carrer de la Cuina, 12, Barcelona",
    slug: "aula-allersafe"
  },
  {
    name: "Espai Gastronòmic",
    address: "Avinguda del Portal, 45, Girona",
    slug: "espai-gastronomic"
  }
];

const seedEvents = [
  {
    name: "Cocina segura para alergias",
    slug: "cocina-segura-para-alergias",
    description: "Taller práctico para prevenir contaminación cruzada y cocinar de forma segura.",
    hostEmail: "chef@allersafe.com",
    categorySlugs: ["alergias", "seguridad"],
    locationName: "Aula AllerSafe",
    classNumber: 1,
    date: new Date("2026-11-10T17:00:00Z"),
    time: "17:00",
    price: 25,
    capacity: 15,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://picsum.photos/seed/cocina-segura-para-alergias-1/1200/800",
        alt: "Preparación de una receta sin alérgenos",
        isCover: true
      },
      {
        url: "https://picsum.photos/seed/cocina-segura-para-alergias-2/1200/800",
        alt: "Utensilios limpios para evitar la contaminación cruzada"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-11-10T17:00:00Z"),
        end_datetime: new Date("2026-11-10T19:00:00Z"),
        capacity: 15,
        price: 25,
        booked_participants: 3,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2026-11-17T17:00:00Z"),
        end_datetime: new Date("2026-11-17T19:00:00Z"),
        capacity: 15,
        price: 25,
        booked_participants: 0,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Repostería sin gluten",
    slug: "reposteria-sin-gluten",
    description: "Clase de repostería con recetas sencillas y técnicas para sustituir el gluten.",
    hostEmail: "chef@allersafe.com",
    categorySlugs: ["reposteria", "alergias"],
    locationName: "Aula AllerSafe",
    classNumber: 2,
    date: new Date("2026-11-14T10:00:00Z"),
    time: "10:00",
    price: 30,
    capacity: 12,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://picsum.photos/seed/reposteria-sin-gluten-1/1200/800",
        alt: "Bizcocho sin gluten recién horneado",
        isCover: true
      },
      {
        url: "https://picsum.photos/seed/reposteria-sin-gluten-2/1200/800",
        alt: "Ingredientes para repostería sin gluten"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-11-14T10:00:00Z"),
        end_datetime: new Date("2026-11-14T12:30:00Z"),
        capacity: 12,
        price: 30,
        booked_participants: 5,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Cocina infantil segura",
    slug: "cocina-infantil-segura",
    description: "Actividad culinaria para aprender hábitos de higiene, seguridad y alimentación.",
    hostEmail: "chef@allersafe.com",
    categorySlugs: ["seguridad", "cocina"],
    locationName: "Espai Gastronòmic",
    classNumber: 3,
    date: new Date("2026-11-21T11:00:00Z"),
    time: "11:00",
    price: 20,
    capacity: 16,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://picsum.photos/seed/cocina-infantil-segura-1/1200/800",
        alt: "Niños cocinando con supervisión",
        isCover: true
      },
      {
        url: "https://picsum.photos/seed/cocina-infantil-segura-2/1200/800",
        alt: "Materiales de cocina adaptados para niños"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-11-21T11:00:00Z"),
        end_datetime: new Date("2026-11-21T13:00:00Z"),
        capacity: 16,
        price: 20,
        booked_participants: 8,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Nutrición y etiquetado de alimentos",
    slug: "nutricion-y-etiquetado-de-alimentos",
    description: "Aprende a interpretar etiquetas y detectar alérgenos habituales en productos.",
    hostEmail: "marta@allersafe.com",
    categorySlugs: ["nutricion"],
    locationName: "Aula AllerSafe",
    classNumber: 4,
    date: new Date("2026-12-02T18:00:00Z"),
    time: "18:00",
    price: 18,
    capacity: 25,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://picsum.photos/seed/nutricion-etiquetado-1/1200/800",
        alt: "Lectura del etiquetado nutricional de un producto",
        isCover: true
      },
      {
        url: "https://picsum.photos/seed/nutricion-etiquetado-2/1200/800",
        alt: "Comparación de etiquetas de alimentos"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-12-02T18:00:00Z"),
        end_datetime: new Date("2026-12-02T20:00:00Z"),
        capacity: 25,
        price: 18,
        booked_participants: 10,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2026-12-09T18:00:00Z"),
        end_datetime: new Date("2026-12-09T20:00:00Z"),
        capacity: 25,
        price: 18,
        booked_participants: 25,
        status: "full"
      }
    ]
  },
  {
    name: "Cocina mediterránea consciente",
    slug: "cocina-mediterranea-consciente",
    description: "Recetas mediterráneas adaptables a distintas necesidades alimentarias.",
    hostEmail: "chef@allersafe.com",
    categorySlugs: ["cocina", "nutricion"],
    locationName: "Espai Gastronòmic",
    classNumber: 5,
    date: new Date("2026-12-12T10:30:00Z"),
    time: "10:30",
    price: 28,
    capacity: 14,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://picsum.photos/seed/cocina-mediterranea-1/1200/800",
        alt: "Plato mediterráneo con verduras y aceite de oliva",
        isCover: true
      },
      {
        url: "https://picsum.photos/seed/cocina-mediterranea-2/1200/800",
        alt: "Ingredientes frescos de la dieta mediterránea"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-12-12T10:30:00Z"),
        end_datetime: new Date("2026-12-12T13:00:00Z"),
        capacity: 14,
        price: 28,
        booked_participants: 2,
        status: "scheduled"
      }
    ]
  }
];

async function upsertUser(data, passwordHash) {
  return User.findOneAndUpdate(
    { email: data.email },
    {
      $set: {
        name: data.name,
        email: data.email,
        role: data.role,
        slug: data.slug,
        status: "active",
        is_active: true,
        deleted_at: null,
        password_hash: passwordHash
      },
      $unset: { isActive: "" }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertCategory(data) {
  return Category.findOneAndUpdate(
    { slug: data.slug },
    {
      $set: {
        ...data,
        status: "active",
        is_active: true,
        deleted_at: null
      },
      $unset: { isActive: "" }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertLocation(data) {
  return Location.findOneAndUpdate(
    { slug: data.slug },
    {
      $set: {
        ...data,
        status: "active",
        is_active: true,
        deleted_at: null
      },
      $unset: { isActive: "" }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  try {
    await connectDB();

    await EventImage.deleteMany({});
    await Departure.deleteMany({});
    await Event.deleteMany({});
    await Host.deleteMany({});
    await User.updateMany({}, { $set: { host_id: null } });

    const passwordHash = await argon2.hash(DEFAULT_PASSWORD);

    const users = await Promise.all(
      seedUsers.map((user) => upsertUser(user, passwordHash))
    );

    const userByEmail = new Map(users.map((user) => [user.email, user]));

    const hosts = await Promise.all(
      seedHosts.map(async (data) => {
        const user = userByEmail.get(data.email);

        if (!user) throw new Error(`Usuario anfitrión no encontrado: ${data.email}`);

        const host = await Host.create({
          user_id: user._id,
          biography: data.biography,
          slug: data.slug,
          status: "active",
          is_active: true
        });

        await User.findByIdAndUpdate(user._id, { host_id: host._id });

        return host;
      })
    );

    const hostByEmail = new Map(
      seedHosts.map((data, index) => [data.email, hosts[index]])
    );

    const categories = await Promise.all(seedCategories.map(upsertCategory));
    const locations = await Promise.all(seedLocations.map(upsertLocation));

    const categoryBySlug = new Map(
      categories.map((category) => [category.slug, category._id])
    );
    const locationByName = new Map(
      locations.map((location) => [location.name, location._id])
    );

    const events = await Event.insertMany(
      seedEvents.map(({ hostEmail, categorySlugs, locationName, images, departures, ...event }) => {
        const host = hostByEmail.get(hostEmail);

        if (!host) throw new Error(`Anfitrión no encontrado: ${hostEmail}`);

        return {
          ...event,
          host: host._id,
          categories: categorySlugs.map((slug) => {
            const categoryId = categoryBySlug.get(slug);

            if (!categoryId) throw new Error(`Categoría no encontrada: ${slug}`);

            return categoryId;
          }),
          location: locationByName.get(locationName)
        };
      })
    );

    const images = [];
    const departures = [];

    events.forEach((event, index) => {
      const seedEvent = seedEvents[index];

      seedEvent.images.forEach((image, position) => {
        images.push({
          event: event._id,
          url: image.url,
          alt: image.alt,
          position,
          isCover: image.isCover ?? position === 0,
          slug: `${event.slug}-imagen-${position + 1}`,
          status: "active",
          is_active: true
        });
      });

      seedEvent.departures.forEach((departure, position) => {
        const start = departure.start_datetime;
        const datePart = start
          .toISOString()
          .slice(0, 16)
          .replace("T", "-")
          .replace(":", "");

        departures.push({
          ...departure,
          event: event._id,
          slug: `${event.slug}-${datePart}-${position + 1}`,
          is_active: true
        });
      });
    });

    await EventImage.insertMany(images);
    await Departure.insertMany(departures);

    console.log(
      `Seed completado: ${events.length} eventos, ${images.length} imágenes, ` +
        `${departures.length} salidas, ${categories.length} categorías, ` +
        `${seedUsers.length} usuarios, ${hosts.length} anfitriones y ` +
        `${locations.length} ubicaciones.`
    );
    console.log(`Contraseña de los usuarios de prueba: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error("Error ejecutando seed:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seed();
