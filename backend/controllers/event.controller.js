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

  async activate(req, res, next) {
    try {
      const event = await eventService.activate(req.params.id);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req, res, next) {
    try {
      const event = await eventService.deactivate(req.params.id);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const event = await eventService.softDelete(req.params.id);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();
