require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/user.model");
const Profile = require("./models/profile.model");
const AccessToken = require("./models/accessToken.model");
const RefreshToken = require("./models/refreshToken.model");
const Host = require("./models/host.model");
const Category = require("./models/category.model");
const Location = require("./models/location.model");
const Event = require("./models/event.model");
const EventImage = require("./models/eventImage.model");
const Departure = require("./models/departure.model");
const Comment = require("./models/comment.model");
const { hashPassword } = require("./utils/password");

const DEFAULT_PASSWORD = "AllerSafe123!";

const seedUsers = [
  {
    name: "Admin AllerSafe",
    email: "admin@allersafe.com",
    role: "Admin",
    slug: "admin-allersafe",
    profile: {
      first_name: "Admin",
      last_name: "AllerSafe",
      phone: "+34 600 000 001",
      birth_date: new Date("1985-03-15"),
      address: "Carrer de la Cuina, 12",
      city: "Barcelona",
      postal_code: "08001",
      bio: "Administrador de la plataforma AllerSafe."
    }
  },
  {
    name: "Chef AllerSafe",
    email: "chef@allersafe.com",
    role: "Client",
    slug: "chef-allersafe",
    profile: {
      first_name: "Chef",
      last_name: "AllerSafe",
      phone: "+34 600 000 002",
      birth_date: new Date("1988-07-22"),
      address: "Avinguda del Portal, 45",
      city: "Girona",
      postal_code: "17001",
      bio: "Chef especializado en cocina segura para personas con alergias alimentarias.",
      avatar_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
    }
  },
  {
    name: "Marta Nutrición",
    email: "marta@allersafe.com",
    role: "Client",
    slug: "marta-nutricion",
    profile: {
      first_name: "Marta",
      last_name: "Nutrición",
      phone: "+34 600 000 003",
      birth_date: new Date("1990-11-05"),
      address: "Carrer de la Cuina, 12",
      city: "Barcelona",
      postal_code: "08001",
      bio: "Dietista-nutricionista experta en etiquetado y alimentación saludable.",
      avatar_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
    }
  },
  {
    name: "Cliente Demo",
    email: "cliente@allersafe.com",
    role: "Client",
    slug: "cliente-demo",
    profile: {
      first_name: "Cliente",
      last_name: "Demo",
      phone: "+34 600 000 004",
      birth_date: new Date("1995-05-30"),
      address: "Carrer de la Cuina, 12",
      city: "Barcelona",
      postal_code: "08001",
      bio: "Usuario de prueba para reservas.",
      allergies: ["frutos secos"],
      dietary_restrictions: ["sin lactosa"]
    }
  },
  {
    name: "Lucía Ferrer",
    email: "lucia-ferrer@allersafe.com",
    role: "Client",
    slug: "lucia-ferrer",
    profile: {
      first_name: "Lucía",
      last_name: "Ferrer",
      phone: "+34 600 000 005",
      birth_date: new Date("1991-04-12"),
      address: "Carrer del Forn, 4",
      city: "València",
      postal_code: "46001",
      bio: "Repostera especializada en repostería sin frutos secos y sin gluten.",
      avatar_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
    }
  },
  {
    name: "Diego Navarro",
    email: "diego-navarro@allersafe.com",
    role: "Client",
    slug: "diego-navarro",
    profile: {
      first_name: "Diego",
      last_name: "Navarro",
      phone: "+34 600 000 006",
      birth_date: new Date("1986-09-03"),
      address: "Carrer de la Pau, 18",
      city: "València",
      postal_code: "46002",
      bio: "Chef de cocina sin gluten y sin lactosa, experto en contaminación cruzada.",
      avatar_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
    }
  },
  {
    name: "Elena Vidal",
    email: "elena-vidal@allersafe.com",
    role: "Client",
    slug: "elena-vidal",
    profile: {
      first_name: "Elena",
      last_name: "Vidal",
      phone: "+34 600 000 007",
      birth_date: new Date("1993-02-20"),
      address: "Calle Feria, 12",
      city: "Sevilla",
      postal_code: "41003",
      bio: "Chef especializada en cocina sin lactosa y alimentación sensible.",
      avatar_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
    }
  },
  {
    name: "Javier Ortega",
    email: "javier-ortega@allersafe.com",
    role: "Client",
    slug: "javier-ortega",
    profile: {
      first_name: "Javier",
      last_name: "Ortega",
      phone: "+34 600 000 008",
      birth_date: new Date("1984-12-08"),
      address: "Gran Vía, 21",
      city: "Bilbao",
      postal_code: "48001",
      bio: "Chef vegano especializado en alergias al pescado y al marisco.",
      avatar_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
    }
  },
  {
    name: "Sara Puig",
    email: "sara-puig@allersafe.com",
    role: "Client",
    slug: "sara-puig",
    profile: {
      first_name: "Sara",
      last_name: "Puig",
      phone: "+34 600 000 009",
      birth_date: new Date("1989-06-17"),
      address: "Calle del Olivar, 9",
      city: "Madrid",
      postal_code: "28012",
      bio: "Dietista-nutricionista infantil y experta en diabetes y comida para bebés.",
      avatar_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
    }
  },
  {
    name: "Marta Ríos",
    email: "marta-rios@allersafe.com",
    role: "Client",
    slug: "marta-rios",
    profile: {
      first_name: "Marta",
      last_name: "Ríos",
      phone: "+34 600 000 010",
      birth_date: new Date("1992-08-25"),
      address: "Calle Larios, 14",
      city: "Málaga",
      postal_code: "29001",
      bio: "Chef de cocina segura y batch cooking sin alérgenos.",
      avatar_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
    }
  }
];

const seedHosts = [
  {
    email: "chef@allersafe.com",
    biography: "Chef especializado en cocina segura para personas con alergias alimentarias.",
    slug: "chef-allersafe",
    image_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
  },
  {
    email: "marta@allersafe.com",
    biography: "Dietista-nutricionista experta en etiquetado y alimentación saludable.",
    slug: "marta-nutricion",
    image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
  },
  {
    email: "lucia-ferrer@allersafe.com",
    biography: "Repostera especializada en repostería sin frutos secos y sin gluten.",
    slug: "lucia-ferrer",
    image_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
  },
  {
    email: "diego-navarro@allersafe.com",
    biography: "Chef de cocina sin gluten y sin lactosa, experto en contaminación cruzada.",
    slug: "diego-navarro",
    image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
  },
  {
    email: "elena-vidal@allersafe.com",
    biography: "Chef especializada en cocina sin lactosa y alimentación sensible.",
    slug: "elena-vidal",
    image_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
  },
  {
    email: "javier-ortega@allersafe.com",
    biography: "Chef vegano especializado en alergias al pescado y al marisco.",
    slug: "javier-ortega",
    image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
  },
  {
    email: "sara-puig@allersafe.com",
    biography: "Dietista-nutricionista infantil y experta en diabetes y comida para bebés.",
    slug: "sara-puig",
    image_url: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80"
  },
  {
    email: "marta-rios@allersafe.com",
    biography: "Chef de cocina segura y batch cooking sin alérgenos.",
    slug: "marta-rios",
    image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80"
  }
];

const seedCategories = [
  {
    name: "Sin gluten",
    slug: "gluten",
    description: "Recetas sin gluten y prevención de la contaminación cruzada.",
    image_url: "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=1200&q=80"
  },
  {
    name: "Sin lactosa",
    slug: "lactosa",
    description: "Cocina y repostería sin lactosa con alternativas seguras.",
    image_url: "https://images.unsplash.com/photo-1566827886201-f23910ecf37e?w=1200&q=80"
  },
  {
    name: "Alergia al pescado",
    slug: "pescado",
    description: "Técnicas y sustitutos para cocinar sin pescado ni marisco.",
    image_url: "https://images.unsplash.com/photo-1622119843742-bd7afc4eac21?w=1200&q=80"
  },
  {
    name: "Alergia a frutos secos",
    slug: "frutos-secos",
    description: "Repostería y cocina sin frutos secos ni trazas.",
    image_url: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=1200&q=80"
  },
  {
    name: "Cocina vegana",
    slug: "veganos",
    description: "Recetas vegetales adaptadas a distintas alergias.",
    image_url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80"
  },
  {
    name: "Cocina para diabéticos",
    slug: "diabeticos",
    description: "Control de azúcares, raciones y etiquetado para diabetes.",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80"
  },
  {
    name: "Alimentación infantil",
    slug: "alimentacion-infantil",
    description: "Talleres de comida para bebés y niños con alergias.",
    image_url: "https://images.unsplash.com/photo-1616843778704-4eb1bff0b49b?w=1200&q=80"
  }
];

const legacyCategorySlugs = ["alergias", "cocina", "reposteria", "nutricion", "seguridad"];

const seedLocations = [
  {
    name: "Aula AllerSafe",
    address: "Carrer de la Cuina, 12, Barcelona",
    slug: "aula-allersafe",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"
  },
  {
    name: "Espai Gastronòmic",
    address: "Avinguda del Portal, 45, Girona",
    slug: "espai-gastronomic",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80"
  },
  {
    name: "Aula AllerSafe València",
    address: "Carrer de la Pau, 8, València",
    slug: "aula-allersafe-valencia",
    image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80"
  },
  {
    name: "Cocina Segura Sevilla",
    address: "Calle Feria, 22, Sevilla",
    slug: "cocina-segura-sevilla",
    image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=80"
  },
  {
    name: "Espai Vegan Madrid",
    address: "Calle del Olivar, 15, Madrid",
    slug: "espai-vegan-madrid",
    image_url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80"
  },
  {
    name: "Aula Nutrición Bilbao",
    address: "Gran Vía, 9, Bilbao",
    slug: "aula-nutricion-bilbao",
    image_url: "https://images.unsplash.com/photo-1604719312245-6d2c47114758?w=1200&q=80"
  },
  {
    name: "Taller AllerSafe Málaga",
    address: "Calle Larios, 30, Málaga",
    slug: "taller-allersafe-malaga",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80"
  }
];

const seedEvents = [
  {
    name: "Cocina sin gluten: menús seguros",
    slug: "cocina-sin-gluten-menus-seguros",
    description: "Aprende a diseñar menús sin gluten y a evitar la contaminación cruzada en la cocina.",
    hostEmail: "diego-navarro@allersafe.com",
    categorySlugs: ["gluten"],
    locationName: "Aula AllerSafe València",
    classNumber: 1,
    date: new Date("2026-12-05T10:00:00Z"),
    time: "10:00",
    price: 32,
    capacity: 12,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=1200&q=80",
        alt: "Elaboración de un menú sin gluten",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=80",
        alt: "Utensilios separados para cocinar sin gluten"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-12-05T10:00:00Z"),
        end_datetime: new Date("2026-12-05T13:00:00Z"),
        capacity: 12,
        price: 32,
        booked_participants: 4,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2026-12-12T10:00:00Z"),
        end_datetime: new Date("2026-12-12T13:00:00Z"),
        capacity: 12,
        price: 32,
        booked_participants: 2,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-01-16T10:00:00Z"),
        end_datetime: new Date("2027-01-16T13:00:00Z"),
        capacity: 12,
        price: 32,
        booked_participants: 0,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Cocina sin lactosa desde cero",
    slug: "cocina-sin-lactosa-desde-cero",
    description: "Técnicas e ingredientes alternativos para cocinar y hornear sin lactosa.",
    hostEmail: "elena-vidal@allersafe.com",
    categorySlugs: ["lactosa"],
    locationName: "Cocina Segura Sevilla",
    classNumber: 2,
    date: new Date("2026-12-08T17:00:00Z"),
    time: "17:00",
    price: 28,
    capacity: 14,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1566827886201-f23910ecf37e?w=1200&q=80",
        alt: "Receta sin lactosa en preparación",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1604719312245-6d2c47114758?w=1200&q=80",
        alt: "Alternativas vegetales a la leche"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-12-08T17:00:00Z"),
        end_datetime: new Date("2026-12-08T19:30:00Z"),
        capacity: 14,
        price: 28,
        booked_participants: 6,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2026-12-15T17:00:00Z"),
        end_datetime: new Date("2026-12-15T19:30:00Z"),
        capacity: 14,
        price: 28,
        booked_participants: 1,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Taller de comida para bebés",
    slug: "taller-de-comida-para-bebes",
    description: "Prepara papillas y primeros sólidos seguros, con introducción progresiva de alérgenos.",
    hostEmail: "sara-puig@allersafe.com",
    categorySlugs: ["alimentacion-infantil"],
    locationName: "Aula AllerSafe",
    classNumber: 3,
    date: new Date("2026-12-11T11:00:00Z"),
    time: "11:00",
    price: 24,
    capacity: 10,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616843778704-4eb1bff0b49b?w=1200&q=80",
        alt: "Papillas caseras para bebés",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",
        alt: "Ingredientes frescos para alimentación infantil"
      },
      {
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",
        alt: "Utensilios de cocina para bebés"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-12-11T11:00:00Z"),
        end_datetime: new Date("2026-12-11T13:00:00Z"),
        capacity: 10,
        price: 24,
        booked_participants: 7,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2026-12-18T11:00:00Z"),
        end_datetime: new Date("2026-12-18T13:00:00Z"),
        capacity: 10,
        price: 24,
        booked_participants: 3,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-01-08T11:00:00Z"),
        end_datetime: new Date("2027-01-08T13:00:00Z"),
        capacity: 10,
        price: 24,
        booked_participants: 0,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Repostería para alérgicos a frutos secos",
    slug: "reposteria-para-alergicos-a-frutos-secos",
    description: "Bizcochos, galletas y cremas sin frutos secos ni riesgo de trazas.",
    hostEmail: "lucia-ferrer@allersafe.com",
    categorySlugs: ["frutos-secos"],
    locationName: "Espai Gastronòmic",
    classNumber: 4,
    date: new Date("2026-12-15T10:30:00Z"),
    time: "10:30",
    price: 35,
    capacity: 12,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=1200&q=80",
        alt: "Bizcocho sin frutos secos recién horneado",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1573851552153-816785fecf4a?w=1200&q=80",
        alt: "Ingredientes de repostería sin frutos secos"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2026-12-15T10:30:00Z"),
        end_datetime: new Date("2026-12-15T13:30:00Z"),
        capacity: 12,
        price: 35,
        booked_participants: 5,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2026-12-22T10:30:00Z"),
        end_datetime: new Date("2026-12-22T13:30:00Z"),
        capacity: 12,
        price: 35,
        booked_participants: 2,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Cocina segura sin pescado",
    slug: "cocina-segura-sin-pescado",
    description: "Sustitutos y técnicas para platos seguros cuando se es alérgico al pescado y al marisco.",
    hostEmail: "javier-ortega@allersafe.com",
    categorySlugs: ["pescado"],
    locationName: "Aula Nutrición Bilbao",
    classNumber: 5,
    date: new Date("2027-01-09T18:00:00Z"),
    time: "18:00",
    price: 29,
    capacity: 15,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1622119843742-bd7afc4eac21?w=1200&q=80",
        alt: "Plato seguro sin pescado",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1572862905000-c5b6244027a5?w=1200&q=80",
        alt: "Ingredientes alternativos al pescado"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2027-01-09T18:00:00Z"),
        end_datetime: new Date("2027-01-09T20:30:00Z"),
        capacity: 15,
        price: 29,
        booked_participants: 3,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-01-16T18:00:00Z"),
        end_datetime: new Date("2027-01-16T20:30:00Z"),
        capacity: 15,
        price: 29,
        booked_participants: 0,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Repostería vegana sin alérgenos",
    slug: "reposteria-vegana-sin-alergenos",
    description: "Dulces 100 % vegetales sin frutos secos, gluten ni lactosa.",
    hostEmail: "lucia-ferrer@allersafe.com",
    categorySlugs: ["veganos", "frutos-secos"],
    locationName: "Espai Vegan Madrid",
    classNumber: 6,
    date: new Date("2027-01-14T10:00:00Z"),
    time: "10:00",
    price: 33,
    capacity: 12,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",
        alt: "Repostería vegana sin alérgenos",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1590174709246-f95754d54cc1?w=1200&q=80",
        alt: "Ingredientes vegetales para hornear"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2027-01-14T10:00:00Z"),
        end_datetime: new Date("2027-01-14T13:00:00Z"),
        capacity: 12,
        price: 33,
        booked_participants: 4,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-01-21T10:00:00Z"),
        end_datetime: new Date("2027-01-21T13:00:00Z"),
        capacity: 12,
        price: 33,
        booked_participants: 1,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Cocina para personas con diabetes",
    slug: "cocina-para-personas-con-diabetes",
    description: "Menús equilibrados, conteo de hidratos y etiquetado para una diabetes controlada.",
    hostEmail: "sara-puig@allersafe.com",
    categorySlugs: ["diabeticos"],
    locationName: "Taller AllerSafe Málaga",
    classNumber: 7,
    date: new Date("2027-01-20T17:30:00Z"),
    time: "17:30",
    price: 26,
    capacity: 18,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
        alt: "Menú equilibrado para personas con diabetes",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1565569753899-bce952b68958?w=1200&q=80",
        alt: "Lectura de etiquetas para controlar azúcares"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2027-01-20T17:30:00Z"),
        end_datetime: new Date("2027-01-20T20:00:00Z"),
        capacity: 18,
        price: 26,
        booked_participants: 9,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-01-27T17:30:00Z"),
        end_datetime: new Date("2027-01-27T20:00:00Z"),
        capacity: 18,
        price: 26,
        booked_participants: 0,
        status: "scheduled"
      }
    ]
  },
  {
    name: "Batch cooking infantil sin gluten ni lactosa",
    slug: "batch-cooking-infantil-sin-gluten-ni-lactosa",
    description: "Organiza y prepara comidas infantiles seguras para toda la semana sin gluten ni lactosa.",
    hostEmail: "marta-rios@allersafe.com",
    categorySlugs: ["alimentacion-infantil", "gluten", "lactosa"],
    locationName: "Aula AllerSafe",
    classNumber: 8,
    date: new Date("2027-02-03T10:00:00Z"),
    time: "10:00",
    price: 30,
    capacity: 14,
    is_active: true,
    status: "published",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616843778704-4eb1bff0b49b?w=1200&q=80",
        alt: "Tuppers con comidas infantiles sin gluten ni lactosa",
        isCover: true
      },
      {
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",
        alt: "Preparación semanal de comidas seguras"
      },
      {
        url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",
        alt: "Etiquetado de comidas caseras para bebés"
      }
    ],
    departures: [
      {
        start_datetime: new Date("2027-02-03T10:00:00Z"),
        end_datetime: new Date("2027-02-03T13:00:00Z"),
        capacity: 14,
        price: 30,
        booked_participants: 6,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-02-10T10:00:00Z"),
        end_datetime: new Date("2027-02-10T13:00:00Z"),
        capacity: 14,
        price: 30,
        booked_participants: 0,
        status: "scheduled"
      },
      {
        start_datetime: new Date("2027-02-17T10:00:00Z"),
        end_datetime: new Date("2027-02-17T13:00:00Z"),
        capacity: 14,
        price: 30,
        booked_participants: 0,
        status: "scheduled"
      }
    ]
  }
];

const seedComments = [
  {
    eventSlug: "cocina-sin-gluten-menus-seguros",
    userEmail: "marta@allersafe.com",
    rating: 5,
    comment: "Excelente taller: explicaron muy bien cómo separar utensilios y evitar la contaminación cruzada. Salí con menús seguros para toda la semana.",
    created_at: new Date("2026-11-20T10:15:00Z")
  },
  {
    eventSlug: "cocina-sin-gluten-menus-seguros",
    userEmail: "cliente@allersafe.com",
    rating: 3,
    comment: "El contenido sobre el gluten estuvo bien, aunque el ritmo fue rápido y me costó seguir las recetas sin gluten al principio.",
    created_at: new Date("2026-11-19T16:40:00Z")
  },
  {
    eventSlug: "cocina-sin-gluten-menus-seguros",
    userEmail: "javier-ortega@allersafe.com",
    rating: 2,
    comment: "Me esperaba más práctica con contaminación cruzada. Solo vimos una demo y apenas hubo tiempo para cocinar por nuestra cuenta.",
    created_at: new Date("2026-11-18T09:05:00Z")
  },
  {
    eventSlug: "cocina-sin-lactosa-desde-cero",
    userEmail: "sara-puig@allersafe.com",
    rating: 5,
    comment: "Las alternativas vegetales a la leche quedaron clarísimas y las recetas salieron riquísimas. Repetiría sin dudarlo.",
    created_at: new Date("2026-11-20T12:30:00Z")
  },
  {
    eventSlug: "cocina-sin-lactosa-desde-cero",
    userEmail: "marta@allersafe.com",
    rating: 3,
    comment: "Aprendí bastante sobre etiquetado sin lactosa, pero echo en falta una lista de productos concretos para comprar en el supermercado.",
    created_at: new Date("2026-11-18T18:20:00Z")
  },
  {
    eventSlug: "cocina-sin-lactosa-desde-cero",
    userEmail: "cliente@allersafe.com",
    rating: 2,
    comment: "La clase se quedó corta de tiempo y no pudimos hornear nada. Para ser un taller práctico, casi todo fue teoría.",
    created_at: new Date("2026-11-17T11:10:00Z")
  },
  {
    eventSlug: "taller-de-comida-para-bebes",
    userEmail: "marta-rios@allersafe.com",
    rating: 5,
    comment: "Muy útil la introducción progresiva de alérgenos. Las papillas son sencillas y mi hija se las comió encantada.",
    created_at: new Date("2026-11-21T08:45:00Z")
  },
  {
    eventSlug: "taller-de-comida-para-bebes",
    userEmail: "lucia-ferrer@allersafe.com",
    rating: 3,
    comment: "Las recetas para bebés están bien explicadas, aunque me gustaría que se profundizara más en las porciones según la edad.",
    created_at: new Date("2026-11-19T13:25:00Z")
  },
  {
    eventSlug: "taller-de-comida-para-bebes",
    userEmail: "diego-navarro@allersafe.com",
    rating: 2,
    comment: "La documentación sobre primeros sólidos fue interesante, pero el aula se quedó pequeña y no veía bien las demostraciones.",
    created_at: new Date("2026-11-16T17:00:00Z")
  },
  {
    eventSlug: "reposteria-para-alergicos-a-frutos-secos",
    userEmail: "chef@allersafe.com",
    rating: 5,
    comment: "Bizcochos y cremas sin frutos secos con riesgo de trazas cero. La explicación de los sustitutos fue excelente y todo salió perfecto.",
    created_at: new Date("2026-11-21T14:10:00Z")
  },
  {
    eventSlug: "reposteria-para-alergicos-a-frutos-secos",
    userEmail: "marta@allersafe.com",
    rating: 3,
    comment: "Las galletas quedaron muy bien, pero el taller asumió que ya sabíamos manejar la mantequilla de semillas y yo iba perdida.",
    created_at: new Date("2026-11-20T09:30:00Z")
  },
  {
    eventSlug: "reposteria-para-alergicos-a-frutos-secos",
    userEmail: "cliente@allersafe.com",
    rating: 1,
    comment: "Decepcionante: no trabajamos el tema de las trazas en profundidad y los ingredientes no estaban etiquetados en la mesa.",
    created_at: new Date("2026-11-15T19:55:00Z")
  },
  {
    eventSlug: "cocina-segura-sin-pescado",
    userEmail: "elena-vidal@allersafe.com",
    rating: 5,
    comment: "Los sustitutos del pescado y del marisco funcionan mejor de lo que esperaba. Muy bien explicado el tema de la contaminación cruzada.",
    created_at: new Date("2026-11-21T16:05:00Z")
  },
  {
    eventSlug: "cocina-segura-sin-pescado",
    userEmail: "diego-navarro@allersafe.com",
    rating: 3,
    comment: "Aprendí técnicas nuevas, aunque faltó tiempo para probar los sustitutos en casa durante la sesión.",
    created_at: new Date("2026-11-19T10:50:00Z")
  },
  {
    eventSlug: "cocina-segura-sin-pescado",
    userEmail: "sara-puig@allersafe.com",
    rating: 2,
    comment: "Me gustó la teoría, pero la clase se centró demasiado en el marisco y casi no vimos alternativas para el pescado.",
    created_at: new Date("2026-11-14T12:15:00Z")
  },
  {
    eventSlug: "reposteria-vegana-sin-alergenos",
    userEmail: "javier-ortega@allersafe.com",
    rating: 5,
    comment: "Dulces vegetales sin frutos secos, gluten ni lactosa y con un sabor increíble. La mejor clase de repostería vegana que he hecho.",
    created_at: new Date("2026-11-22T09:20:00Z")
  },
  {
    eventSlug: "reposteria-vegana-sin-alergenos",
    userEmail: "elena-vidal@allersafe.com",
    rating: 3,
    comment: "Los ingredientes vegetales estuvieron muy bien seleccionados, pero las recetas eran algo básicas para el precio del taller.",
    created_at: new Date("2026-11-20T15:35:00Z")
  },
  {
    eventSlug: "reposteria-vegana-sin-alergenos",
    userEmail: "marta-rios@allersafe.com",
    rating: 2,
    comment: "El resultado fue correcto, pero no se explicó cómo evitar la contaminación cruzada con el gluten en el horno compartido.",
    created_at: new Date("2026-11-17T20:00:00Z")
  },
  {
    eventSlug: "cocina-para-personas-con-diabetes",
    userEmail: "cliente@allersafe.com",
    rating: 5,
    comment: "El conteo de hidratos y la lectura de etiquetas me han resultado clarísimos. Menús equilibrados y fáciles de aplicar cada día.",
    created_at: new Date("2026-11-22T11:45:00Z")
  },
  {
    eventSlug: "cocina-para-personas-con-diabetes",
    userEmail: "marta@allersafe.com",
    rating: 3,
    comment: "La parte de etiquetado estuvo muy bien, aunque me habría gustado más tiempo para calcular las raciones de cada plato.",
    created_at: new Date("2026-11-21T18:10:00Z")
  },
  {
    eventSlug: "cocina-para-personas-con-diabetes",
    userEmail: "javier-ortega@allersafe.com",
    rating: 2,
    comment: "Buenos ejemplos de menús, pero las tablas de hidratos pasaron muy rápido y no nos dieron material para llevárnoslo.",
    created_at: new Date("2026-11-16T13:40:00Z")
  },
  {
    eventSlug: "batch-cooking-infantil-sin-gluten-ni-lactosa",
    userEmail: "sara-puig@allersafe.com",
    rating: 5,
    comment: "Organizamos la comida infantil de toda la semana sin gluten ni lactosa. Las recetas son prácticas y el etiquetado de los tuppers, una idea genial.",
    created_at: new Date("2026-11-23T10:00:00Z")
  },
  {
    eventSlug: "batch-cooking-infantil-sin-gluten-ni-lactosa",
    userEmail: "elena-vidal@allersafe.com",
    rating: 3,
    comment: "El batch cooking quedó claro, pero echo en falta ideas para variar más los menús infantiles de una semana a otra.",
    created_at: new Date("2026-11-21T19:25:00Z")
  },
  {
    eventSlug: "batch-cooking-infantil-sin-gluten-ni-lactosa",
    userEmail: "lucia-ferrer@allersafe.com",
    rating: 2,
    comment: "Preparar comidas sin gluten ni lactosa estuvo bien, pero el precio me pareció alto para solo tres recetas y dos horas de clase.",
    created_at: new Date("2026-11-18T08:55:00Z")
  }
];

async function upsertUser(data, passwordHash) {
  const { profile, ...userData } = data;

  const user = await User.findOneAndUpdate(
    { email: userData.email },
    {
      $set: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        slug: userData.slug,
        status: "active",
        is_active: true,
        deleted_at: null,
        password_hash: passwordHash,
        token_version: 0
      },
      $unset: { isActive: "" }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (profile) {
    await Profile.findOneAndUpdate(
      { user_id: user._id },
      {
        $set: {
          user_id: user._id,
          ...profile,
          deleted_at: null
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return user;
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
    await Promise.all([
      User.init(),
      Profile.init(),
      AccessToken.init(),
      RefreshToken.init(),
      Comment.init()
    ]);

    await Comment.deleteMany({});
    await EventImage.deleteMany({});
    await Departure.deleteMany({});
    await Event.deleteMany({});
    await Host.deleteMany({});
    await AccessToken.deleteMany({});
    await RefreshToken.deleteMany({});
    await User.updateMany({}, { $set: { host_id: null } });

    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

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
          image_url: data.image_url,
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

    await Category.deleteMany({ slug: { $in: legacyCategorySlugs } });
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

    const eventBySlug = new Map(events.map((event) => [event.slug, event._id]));

    const comments = seedComments.map(({ eventSlug, userEmail, ...comment }) => {
      const eventId = eventBySlug.get(eventSlug);
      const user = userByEmail.get(userEmail);

      if (!eventId) throw new Error(`Evento no encontrado: ${eventSlug}`);
      if (!user) throw new Error(`Usuario no encontrado: ${userEmail}`);

      return {
        ...comment,
        event_id: eventId,
        user_id: user._id
      };
    });

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
    await Comment.insertMany(comments);

    console.log(
      `Seed completado: ${events.length} eventos, ${images.length} imágenes, ` +
        `${departures.length} salidas, ${comments.length} comentarios, ` +
        `${categories.length} categorías, ${seedUsers.length} usuarios, ` +
        `${hosts.length} anfitriones y ${locations.length} ubicaciones.`
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
