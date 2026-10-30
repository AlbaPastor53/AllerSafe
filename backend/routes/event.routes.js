const express = require("express");
const controller = require("../controllers/event.controller");
const validate = require("../middlewares/validate");
const {
  eventBodySchema,
  updateEventBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema,
  hostBodySchema,
  locationBodySchema,
  categoriesBodySchema,
  categoryParamSchema
} = require("../schemas/event.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/slug/:slug", validate(slugParamSchema, "params"), controller.getBySlug);

router.patch(
  "/:id/host",
  validate(idParamSchema, "params"),
  validate(hostBodySchema),
  controller.updateHost
);

router.patch(
  "/:id/location",
  validate(idParamSchema, "params"),
  validate(locationBodySchema),
  controller.updateLocation
);

router.post(
  "/:id/categories",
  validate(idParamSchema, "params"),
  validate(categoriesBodySchema),
  controller.addCategories
);

router.delete(
  "/:id/categories/:categoryId",
  validate(categoryParamSchema, "params"),
  controller.removeCategory
);

router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(eventBodySchema), controller.create);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateEventBodySchema),
  controller.update
);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
