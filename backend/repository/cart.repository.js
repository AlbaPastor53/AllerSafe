const Cart = require("../models/cart.model");

class CartRepository {
  async findByUserId(userId) {
    return Cart.findOne({ user: userId });
  }

  async create(data, { session = null } = {}) {
    if (session) {
      const [cart] = await Cart.create([data], { session });
      return cart;
    }

    return Cart.create(data);
  }

  async addProduct(id, price, { session = null } = {}) {
    const options = session
      ? { new: true, runValidators: true, session }
      : { new: true, runValidators: true };

    return Cart.findOneAndUpdate(
      { _id: id },
      { $inc: { total_products: 1, total_price: price } },
      options
    );
  }
}

module.exports = new CartRepository();
