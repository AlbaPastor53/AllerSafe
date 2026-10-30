const express = require("express");
const controller = require("../controllers/eventImage.controller");
const validate = require("../middlewares/validate");
const {
  eventImageBodySchema,
  updateEventImageBodySchema,
  idParamSchema,
  slugParamSchema,
  eventIdParamSchema,
  querySchema
} = require("../schemas/eventImage.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/slug/:slug", validate(slugParamSchema, "params"), controller.getBySlug);
router.get(
  "/event/:eventId",
  validate(eventIdParamSchema, "params"),
  controller.getByEvent
);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(eventImageBodySchema), controller.create);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateEventImageBodySchema),
  controller.update
);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
