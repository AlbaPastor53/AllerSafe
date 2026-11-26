const cartService = require("../services/cart.service");

class CartController {
  async get(req, res, next) {
    try {
      const cart = await cartService.getByUserId(req.user.id);
      res.json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const cart = await cartService.addItem(req.user.id, req.body.departure);
      res.json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
