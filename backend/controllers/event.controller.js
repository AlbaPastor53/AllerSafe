const eventService = require("../services/event.service");

class EventController {
  async getAll(req, res, next) {
    try {
      const events = await eventService.getAll(req.query);
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const event = await eventService.getById(req.params.id);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const event = await eventService.getBySlug(req.params.slug);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const event = await eventService.create(req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const event = await eventService.update(req.params.id, req.body);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async updateHost(req, res, next) {
    try {
      const event = await eventService.updateHost(req.params.id, req.body.host);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req, res, next) {
    try {
      const event = await eventService.updateLocation(req.params.id, req.body.location);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async addCategories(req, res, next) {
    try {
      const event = await eventService.addCategories(req.params.id, req.body.categories);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async removeCategory(req, res, next) {
    try {
      const event = await eventService.removeCategory(req.params.id, req.params.categoryId);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      await eventService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();
