const locationService = require("../services/location.service");

class LocationController {
  async getAll(req, res, next) {
    try {
      const locations = await locationService.getAll(req.query);
      res.json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const location = await locationService.getById(req.params.id);
      res.json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const location = await locationService.getBySlug(req.params.slug);
      res.json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const location = await locationService.create(req.body);
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const location = await locationService.update(req.params.id, req.body);
      res.json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      await locationService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();
