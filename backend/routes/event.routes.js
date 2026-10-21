const express = require("express");
const controller = require("../controllers/event.controller");
const validate = require("../middlewares/validate");
const {
  eventBodySchema,
  updateEventBodySchema,
  idParamSchema,
  slugParamSchema,
  querySchema
} = require("../schemas/event.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/slug/:slug", validate(slugParamSchema, "params"), controller.getBySlug);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(eventBodySchema), controller.create);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateEventBodySchema), controller.update);
router.patch("/:id/activate", validate(idParamSchema, "params"), controller.activate);
router.patch("/:id/deactivate", validate(idParamSchema, "params"), controller.deactivate);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
