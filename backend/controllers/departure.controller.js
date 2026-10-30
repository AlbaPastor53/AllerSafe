const departureService = require("../services/departure.service");

class DepartureController {
  async getAll(req, res, next) {
    try {
      const departures = await departureService.getAll({
        eventId: req.query.event ?? null,
        includeDeleted: req.query.includeDeleted === true
      });
      res.json({ success: true, data: departures });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const departure = await departureService.getById(req.params.id);
      res.json({ success: true, data: departure });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const departure = await departureService.getBySlug(req.params.slug);
      res.json({ success: true, data: departure });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const departure = await departureService.create(req.body);
      res.status(201).json({ success: true, data: departure });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const departure = await departureService.update(req.params.id, req.body);
      res.json({ success: true, data: departure });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      await departureService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartureController();
