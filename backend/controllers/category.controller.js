const categoryService = require("../services/category.service");

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAll(req.query);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const category = await categoryService.getBySlug(req.params.slug);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const category = await categoryService.activate(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req, res, next) {
    try {
      const category = await categoryService.deactivate(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const category = await categoryService.softDelete(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
