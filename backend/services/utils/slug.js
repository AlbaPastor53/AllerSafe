function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function buildUniqueSlug(repository, base, excludeId = null) {
  const normalized = slugify(base);

  if (!normalized) return "";

  let slug = normalized;
  let counter = 2;

  while (true) {
    const existing = await repository.findBySlug(slug, { includeDeleted: true });

    if (!existing || (excludeId && String(existing._id) === String(excludeId))) {
      return slug;
    }

    slug = `${normalized}-${counter}`;
    counter += 1;
  }
}

module.exports = { slugify, buildUniqueSlug };
