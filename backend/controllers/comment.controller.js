const commentService = require("../services/comment.service");

class CommentController {
  async getAll(req, res, next) {
    try {
      const comments = await commentService.listByEvent(req.query.event);
      res.json({ success: true, data: comments });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const comment = await commentService.getById(req.params.id);
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async summary(req, res, next) {
    try {
      const summary = await commentService.getSummary(req.query.event);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async sentiment(req, res, next) {
    try {
      const sentiment = await commentService.getSentiment(req.query.event);
      res.json({ success: true, data: sentiment });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const comment = await commentService.create(req.user.id, req.body);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const comment = await commentService.update(req.params.id, req.body);
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await commentService.remove(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async setActive(req, res, next) {
    try {
      const comment = await commentService.setActive(req.params.id, req.body.isActive);
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
