const faqService = require("../services/faq.service");

class FaqController {
  async generate(req, res, next) {
    try {
      const result = await faqService.generate(req.body.event);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FaqController();
