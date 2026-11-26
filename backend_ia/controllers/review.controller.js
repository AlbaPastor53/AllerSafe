const reviewService = require("../services/review.service");

class ReviewController {
  async analyze(req, res, next) {
    try {
      const result = await reviewService.analyze(req.body.comments);
      res.json({ success: true, data: result.analysis });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
