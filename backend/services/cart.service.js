const cartRepository = require("../repository/cart.repository");
const cartItemRepository = require("../repository/cartItem.repository");
const departureRepository = require("../repository/departure.repository");
const AppError = require("./utils/appError");

const CART_ITEMS_POPULATE = {
  path: "items",
  populate: {
    path: "departure",
    select: "start_datetime end_datetime price capacity booked_participants status",
    populate: {
      path: "event",
      select: "name slug date time",
      populate: {
        path: "images",
        select: "url alt isCover position"
      }
    }
  }
};

class CartService {
  async getByUserId(userId) {
    const cart = await this.getOrCreateCart(userId);
    return this.populate(cart);
  }

  async addItem(userId, departureId) {
    const cart = await this.getOrCreateCart(userId);
    const departure = await this.findDeparture(departureId);

    if (
      departure.deleted_at ||
      !departure.is_active ||
      departure.status !== "scheduled"
    ) {
      throw new AppError(
        "La salida no está disponible para reservas.",
        409,
        "DEPARTURE_NOT_AVAILABLE"
      );
    }

    if (departure.booked_participants >= departure.capacity) {
      throw new AppError(
        "No quedan plazas disponibles en esta salida.",
        409,
        "DEPARTURE_FULL"
      );
    }

    // El filtro del repositorio vuelve a comprobar las plazas de forma atómica
    // para que dos reservas simultáneas no puedan superar la capacidad.
    const reserved = await departureRepository.reserveSpot(departureId);
    if (!reserved) {
      throw new AppError(
        "No quedan plazas disponibles en esta salida.",
        409,
        "DEPARTURE_FULL"
      );
    }

    const item = await cartItemRepository.findByCartAndDeparture(
      cart._id,
      departureId
    );

    if (item) {
      await cartItemRepository.incrementQuantity(item._id);
    } else {
      await this.createItem(cart._id, departureId, departure.capacity);
    }

    const updated = await cartRepository.addProduct(cart._id, reserved.price);
    return this.populate(updated);
  }

  async getOrCreateCart(userId) {
    const existing = await cartRepository.findByUserId(userId);
    if (existing) return existing;

    try {
      return await cartRepository.create({
        user: userId,
        total_products: 0,
        total_price: 0
      });
    } catch (error) {
      // Dos peticiones concurrentes pueden intentar crear el carrito a la vez.
      if (error?.code === 11000) {
        const createdByOther = await cartRepository.findByUserId(userId);
        if (createdByOther) return createdByOther;
      }

      throw error;
    }
  }

  async createItem(cartId, departureId, capacity) {
    try {
      return await cartItemRepository.create({
        cart: cartId,
        departure: departureId,
        capacity,
        quantity: 1
      });
    } catch (error) {
      if (error?.code === 11000) {
        const existing = await cartItemRepository.findByCartAndDeparture(
          cartId,
          departureId
        );
        if (existing) {
          return cartItemRepository.incrementQuantity(existing._id);
        }
      }

      throw error;
    }
  }

  async findDeparture(id) {
    try {
      const departure = await departureRepository.findById(id);
      if (!departure) {
        throw new AppError("Salida no encontrada.", 404, "DEPARTURE_NOT_FOUND");
      }
      return departure;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de salida no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async populate(cart) {
    if (!cart) return null;
    await cart.populate(CART_ITEMS_POPULATE);
    return cart;
  }
}

module.exports = new CartService();
