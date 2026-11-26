const CartItem = require("../models/cartItem.model");

class CartItemRepository {
  async findByCartAndDeparture(cartId, departureId) {
    return CartItem.findOne({ cart: cartId, departure: departureId });
  }

  async create(data, { session = null } = {}) {
    if (session) {
      const [item] = await CartItem.create([data], { session });
      return item;
    }

    return CartItem.create(data);
  }

  async incrementQuantity(id, { session = null } = {}) {
    const options = session
      ? { new: true, runValidators: true, session }
      : { new: true, runValidators: true };

    return CartItem.findOneAndUpdate(
      { _id: id },
      { $inc: { quantity: 1 } },
      options
    );
  }
}

module.exports = new CartItemRepository();
