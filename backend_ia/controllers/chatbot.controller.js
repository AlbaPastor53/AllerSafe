const chatbotService = require("../services/chatbot.service");

class ChatbotController {
  async message(req, res, next) {
    try {
      const result = await chatbotService.sendMessage(req.body.messages);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatbotController();
