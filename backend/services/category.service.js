const categoryRepository = require("../repository/category.repository");
const eventRepository = require("../repository/event.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

class CategoryService {
  async getAll(options = {}) {
    return categoryRepository.findAll(options);
  }

  async getById(id, { includeDeleted = false } = {}) {
    try {
      const category = await categoryRepository.findById(id, { includeDeleted });
      if (!category) throw new AppError("Categoría no encontrada.", 404, "CATEGORY_NOT_FOUND");
      if (category.deleted_at) {
        throw new AppError(
          "No se puede modificar una categoría eliminada.",
          409,
          "RECORD_DELETED"
        );
      }
      return category;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de categoría no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async getBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new AppError("Categoría no encontrada para ese slug.", 404, "CATEGORY_NOT_FOUND");
    }
    return category;
  }

  async create(data) {
    const slug = await buildUniqueSlug(categoryRepository, data.slug || data.name);
    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    return categoryRepository.create({
      ...data,
      slug,
      status: data.status ?? "active",
      is_active: data.is_active ?? true
    });
  }

  async update(id, data) {
    const current = await this.getById(id, { includeDeleted: true });
    const updateData = { ...data };

    if (data.name || data.slug) {
      updateData.slug = await buildUniqueSlug(
        categoryRepository,
        data.slug || data.name,
        current._id
      );
    }

    return categoryRepository.updateById(id, updateData);
  }

  async softDelete(id) {
    const category = await categoryRepository.findById(id, { includeDeleted: true });

    if (!category) {
      throw new AppError("Categoría no encontrada.", 404, "CATEGORY_NOT_FOUND");
    }

    if (category.deleted_at) return false;

    const eventCount = await eventRepository.countByCategoryId(id);
    if (eventCount > 0) {
      throw new AppError(
        "No se puede eliminar una categoría asociada a eventos.",
        409,
        "CATEGORY_IN_USE"
      );
    }

    await categoryRepository.softDelete(id);
    return true;
  }

  async restore(id) {
    const category = await categoryRepository.findById(id, { includeDeleted: true });

    if (!category) {
      throw new AppError("Categoría no encontrada.", 404, "CATEGORY_NOT_FOUND");
    }

    if (!category.deleted_at) {
      throw new AppError("La categoría no está eliminada.", 409, "ALREADY_ACTIVE");
    }

    const [slugConflict, nameConflict] = await Promise.all([
      categoryRepository.findBySlug(category.slug),
      categoryRepository.findByName(category.name)
    ]);

    if (slugConflict || nameConflict) {
      throw new AppError(
        "Ya existe una categoría activa con ese nombre o slug.",
        409,
        "RESTORE_CONFLICT"
      );
    }

    return categoryRepository.restoreById(id);
  }

  async changeStatus(id, status) {
    const category = await categoryRepository.findById(id, { includeDeleted: true });

    if (!category) {
      throw new AppError("Categoría no encontrada.", 404, "CATEGORY_NOT_FOUND");
    }

    if (category.deleted_at) {
      throw new AppError(
        "No se puede cambiar el estado de una categoría eliminada.",
        409,
        "RECORD_DELETED"
      );
    }

    return categoryRepository.updateStatusById(id, status);
  }
}

module.exports = new CategoryService();
