const categoryRepository = require("../repository/category.repository");
const AppError = require("./utils/appError");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    const normalizedSlug = slugify(slug);
    const category = await categoryRepository.findBySlug(normalizedSlug);
    if (!category) {
      throw new AppError("Categoría no encontrada para ese slug.", 404, "CATEGORY_NOT_FOUND");
    }
    return category;
  }

  async create(data) {
    const slug = slugify(data.slug || data.name);
    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }
    const existing = await categoryRepository.findBySlug(slug, { includeDeleted: true });
    if (existing) {
      throw new AppError("Ya existe una categoría con ese slug.", 409, "SLUG_EXISTS");
    }
    return categoryRepository.create({ ...data, slug });
  }

  async update(id, data) {
    await this.getById(id);
    const updateData = { ...data };
    if (data.name && !data.slug) {
      updateData.slug = slugify(data.name);
    } else if (data.slug) {
      updateData.slug = slugify(data.slug);
    }
    if (updateData.slug) {
      const existing = await categoryRepository.findBySlug(updateData.slug, { includeDeleted: true });
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError("Ya existe otra categoría con ese slug.", 409, "SLUG_EXISTS");
      }
    }
    return categoryRepository.updateById(id, updateData);
  }

  async activate(id) {
    await this.getById(id);
    return categoryRepository.setActive(id, true);
  }

  async deactivate(id) {
    await this.getById(id);
    return categoryRepository.setActive(id, false);
  }

  async softDelete(id) {
    await this.getById(id);
    const deleted = await categoryRepository.softDelete(id);
    if (!deleted) {
      throw new AppError("No se pudo eliminar categoría.", 500, "DELETE_FAILED");
    }
    return deleted;
  }
}

module.exports = new CategoryService();
