const eventImageService = require("../services/eventImage.service");

class EventImageController {
  async getAll(req, res, next) {
    try {
      const images = await eventImageService.getAll({
        eventId: req.query.event ?? null,
        includeDeleted: req.query.includeDeleted === true
      });
      res.json({ success: true, data: images });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const image = await eventImageService.getById(req.params.id);
      res.json({ success: true, data: image });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const image = await eventImageService.getBySlug(req.params.slug);
      res.json({ success: true, data: image });
    } catch (error) {
      next(error);
    }
  }

  async getByEvent(req, res, next) {
    try {
      const images = await eventImageService.getByEventId(req.params.eventId);
      res.json({ success: true, data: images });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const image = await eventImageService.create(req.body);
      res.status(201).json({ success: true, data: image });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const image = await eventImageService.update(req.params.id, req.body);
      res.json({ success: true, data: image });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      await eventImageService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventImageController();
