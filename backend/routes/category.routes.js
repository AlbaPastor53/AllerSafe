const express = require("express");
const controller = require("../controllers/category.controller");
const validate = require("../middlewares/validate");
const {
  categoryBodySchema,
  updateCategoryBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
} = require("../schemas/category.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/slug/:slug", validate(slugParamSchema, "params"), controller.getBySlug);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(categoryBodySchema), controller.create);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateCategoryBodySchema),
  controller.update
);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
