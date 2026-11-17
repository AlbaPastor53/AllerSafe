const Event = require("../models/event.model");
const Category = require("../models/category.model");
const Host = require("../models/host.model");
const Location = require("../models/location.model");

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
}

module.exports = new ShopRepository();
