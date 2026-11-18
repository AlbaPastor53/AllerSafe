const Event = require("../models/event.model");
const Category = require("../models/category.model");
const Host = require("../models/host.model");
const Location = require("../models/location.model");
const User = require("../models/user.model");

class ShopRepository {
  async searchEvents({
    filter = {},
    sort = { date: 1, _id: 1 },
    skip = 0,
    limit = 0
  } = {}) {
    const query = Event.find(filter).sort(sort);

    if (skip > 0) query.skip(skip);
    if (limit > 0) query.limit(limit);

    return query;
  }

  async countEvents(filter = {}) {
    return Event.countDocuments(filter);
  }

  async findEventBySlug(slug) {
    return Event.findOne({
      slug: String(slug).toLowerCase(),
      deleted_at: null
    });
  }

  async findCategories({ filter = {}, sort = { name: 1 }, limit = 0 } = {}) {
    const query = Category.find(filter).sort(sort);
    if (limit > 0) query.limit(limit);
    return query;
  }

  async findHosts({ filter = {}, sort = { created_at: 1 }, limit = 0 } = {}) {
    const query = Host.find(filter).sort(sort);
    if (limit > 0) query.limit(limit);
    return query;
  }

  async findLocations({ filter = {}, sort = { name: 1 }, limit = 0 } = {}) {
    const query = Location.find(filter).sort(sort);
    if (limit > 0) query.limit(limit);
    return query;
  }

  /** IDs de catálogo que no deben mostrarse en la tienda pública. */
  async findUnavailableCatalogIds() {
    const unavailable = {
      $or: [
        { deleted_at: { $ne: null } },
        { status: { $ne: "active" } },
        { is_active: false }
      ]
    };

    const [categories, locations, hosts, allHosts, users] = await Promise.all([
      Category.find(unavailable).select("_id").lean(),
      Location.find(unavailable).select("_id").lean(),
      Host.find(unavailable).select("_id").lean(),
      Host.find({ deleted_at: null }).select("_id user_id").lean(),
      User.find(unavailable).select("_id").lean()
    ]);

    const inactiveUserIds = new Set(users.map((user) => String(user._id)));
    const hostsFromInactiveUsers = allHosts.filter((host) =>
      inactiveUserIds.has(String(host.user_id))
    );
    const hostIds = new Set(
      [...hosts, ...hostsFromInactiveUsers].map((host) => String(host._id))
    );

    return {
      categories: categories.map((item) => item._id),
      locations: locations.map((item) => item._id),
      hosts: [...hostIds]
    };
  }
}

module.exports = new ShopRepository();
