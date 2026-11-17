const shopService = require("../services/shop.service");

class ShopController {
  async getHome(req, res, next) {
    try {
      const data = await shopService.getHome(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(req, res, next) {
    try {
      const result = await shopService.getEvents(req.query);
      res.json({
        success: true,
        data: result.events,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventBySlug(req, res, next) {
    try {
      const event = await shopService.getEventBySlug(req.params.slug);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShopController();
