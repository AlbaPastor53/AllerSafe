const express = require("express");
const controller = require("../controllers/host.controller");
const validate = require("../middlewares/validate");
const {
  hostBodySchema,
  updateHostBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
} = require("../schemas/host.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/slug/:slug", validate(slugParamSchema, "params"), controller.getBySlug);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(hostBodySchema), controller.create);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateHostBodySchema),
  controller.update
);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
