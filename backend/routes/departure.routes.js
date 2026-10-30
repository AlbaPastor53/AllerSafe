const express = require("express");
const controller = require("../controllers/departure.controller");
const validate = require("../middlewares/validate");
const {
  departureBodySchema,
  updateDepartureBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
} = require("../schemas/departure.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/slug/:slug", validate(slugParamSchema, "params"), controller.getBySlug);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(departureBodySchema), controller.create);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateDepartureBodySchema),
  controller.update
);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
