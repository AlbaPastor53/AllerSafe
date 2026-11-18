const shopRepository = require("../repository/shop.repository");
const AppError = require("./utils/appError");

const PUBLIC_EVENT_FILTER = {
  deleted_at: null,
  status: "published",
  is_active: true
};

const PUBLIC_CATALOG_FILTER = {
  deleted_at: null,
  status: "active",
  is_active: true
};

const EVENT_POPULATE = [
  {
    path: "host",
    populate: { path: "user_id", select: "name email role status is_active" }
  },
  { path: "categories", select: "name slug status is_active" },
  { path: "location", select: "name address slug status is_active" },
  {
    path: "images",
    match: { deleted_at: null },
    options: { sort: { position: 1, created_at: 1 } }
  }
];

const HOST_POPULATE = {
  path: "user_id",
  select: "name email role status is_active"
};

const SORT_MAP = {
  date_asc: { date: 1, _id: 1 },
  date_desc: { date: -1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: 1 }
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class ShopService {
  async getHome({ eventsLimit = 8, filterLimit = 50 } = {}) {
    const [events, categories, hosts, locations] = await Promise.all([
      shopRepository.searchEvents({
        filter: await this.buildEventFilter({}),
        sort: SORT_MAP.date_asc,
        skip: 0,
        limit: eventsLimit
      }),
      shopRepository.findCategories({
        filter: { ...PUBLIC_CATALOG_FILTER },
        sort: { name: 1 },
        limit: filterLimit
      }),
      shopRepository.findHosts({
        filter: {
          deleted_at: null,
          status: "active",
          is_active: true
        },
        sort: { created_at: 1 },
        limit: filterLimit
      }),
      shopRepository.findLocations({
        filter: { ...PUBLIC_CATALOG_FILTER },
        sort: { name: 1 },
        limit: filterLimit
      })
    ]);

    await Promise.all(events.map((event) => event.populate(EVENT_POPULATE)));
    const activeHosts = await this.populateActiveHosts(hosts);

    return {
      events,
      categories,
      hosts: activeHosts,
      locations
    };
  }

  async getEvents({
    search = null,
    category = [],
    host = [],
    location = [],
    minPrice = undefined,
    maxPrice = undefined,
    sort = "date_asc",
    limit = 4,
    offset = 0
  } = {}) {
    const filter = await this.buildEventFilter({
      search,
      category,
      host,
      location,
      minPrice,
      maxPrice
    });

    const safeLimit = Number(limit) > 0 ? Math.floor(Number(limit)) : 4;
    const safeOffset =
      Number(offset) > 0 ? Math.floor(Number(offset)) : 0;
    const sortSpec = SORT_MAP[sort] ?? SORT_MAP.date_asc;

    const [events, total] = await Promise.all([
      shopRepository.searchEvents({
        filter,
        sort: sortSpec,
        skip: safeOffset,
        limit: safeLimit
      }),
      shopRepository.countEvents(filter)
    ]);

    await Promise.all(events.map((event) => event.populate(EVENT_POPULATE)));

    const count = events.length;
    const nextOffset = safeOffset + count;
    const hasMore = nextOffset < total;
    const totalPages = Math.ceil(total / safeLimit);

    return {
      events,
      meta: {
        limit: safeLimit,
        offset: safeOffset,
        total,
        count,
        hasMore,
        nextOffset: hasMore ? nextOffset : null,
        prevOffset:
          safeOffset > 0 ? Math.max(0, safeOffset - safeLimit) : null,
        page: Math.floor(safeOffset / safeLimit) + 1,
        totalPages
      }
    };
  }

  async getEventBySlug(slug) {
    const event = await shopRepository.findEventBySlug(slug);

    if (
      !event ||
      event.status !== "published" ||
      !event.is_active ||
      event.deleted_at
    ) {
      throw new AppError(
        "Experiencia no encontrada.",
        404,
        "EVENT_NOT_FOUND"
      );
    }

    const unavailable = await this.getUnavailableCatalogSets();
    const hasUnavailableCatalog =
      unavailable.hosts.has(String(event.host)) ||
      unavailable.locations.has(String(event.location)) ||
      (event.categories ?? []).some((id) =>
        unavailable.categories.has(String(id))
      );

    if (hasUnavailableCatalog) {
      throw new AppError(
        "Experiencia no encontrada.",
        404,
        "EVENT_NOT_FOUND"
      );
    }

    await event.populate(EVENT_POPULATE);
    return event;
  }

  async getUnavailableCatalogSets() {
    const unavailable = await shopRepository.findUnavailableCatalogIds();

    return {
      categories: new Set(unavailable.categories.map(String)),
      locations: new Set(unavailable.locations.map(String)),
      hosts: new Set(unavailable.hosts.map(String))
    };
  }

  async buildEventFilter({
    search,
    category = [],
    host = [],
    location = [],
    minPrice,
    maxPrice
  } = {}) {
    const unavailable = await this.getUnavailableCatalogSets();
    const filter = { ...PUBLIC_EVENT_FILTER };

    filter.categories = {
      ...(category?.length > 0 ? { $in: category } : {}),
      $nin: [...unavailable.categories]
    };
    filter.host = {
      ...(host?.length > 0 ? { $in: host } : {}),
      $nin: [...unavailable.hosts]
    };
    filter.location = {
      ...(location?.length > 0 ? { $in: location } : {}),
      $nin: [...unavailable.locations]
    };
    if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    return filter;
  }

  async populateActiveHosts(hosts) {
    await Promise.all(hosts.map((host) => host.populate(HOST_POPULATE)));

    return hosts.filter((host) => {
      const user = host.user_id;
      return (
        user &&
        typeof user === "object" &&
        user.is_active === true &&
        user.status === "active"
      );
    });
  }
}

module.exports = new ShopService();
