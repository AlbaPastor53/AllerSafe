const categoryRepository = require("../repository/category.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

class CategoryService {
  async getAll(options = {}) {
    return categoryRepository.findAll(options);
  }

  async getById(id) {
    try {
      const category = await categoryRepository.findById(id);
      if (!category) throw new AppError("Categoría no encontrada.", 404, "CATEGORY_NOT_FOUND");
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
    const current = await this.getById(id);
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

    await categoryRepository.softDelete(id);
    return true;
  }
}

module.exports = new CategoryService();
