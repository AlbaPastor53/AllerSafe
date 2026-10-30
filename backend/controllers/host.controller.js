const hostService = require("../services/host.service");

class HostController {
  async getAll(req, res, next) {
    try {
      const hosts = await hostService.getAll(req.query);
      res.json({ success: true, data: hosts });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const host = await hostService.getById(req.params.id);
      res.json({ success: true, data: host });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const host = await hostService.getBySlug(req.params.slug);
      res.json({ success: true, data: host });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const host = await hostService.create(req.body);
      res.status(201).json({ success: true, data: host });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const host = await hostService.update(req.params.id, req.body);
      res.json({ success: true, data: host });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      await hostService.softDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HostController();
