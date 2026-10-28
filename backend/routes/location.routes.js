const express = require("express");
const controller = require("../controllers/location.controller");
const validate = require("../middlewares/validate");
const { locationBodySchema, updateLocationBodySchema, idParamSchema, querySchema } = require("../schemas/location.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(locationBodySchema), controller.create);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateLocationBodySchema), controller.update);
router.patch("/:id/activate", validate(idParamSchema, "params"), controller.activate);
router.patch("/:id/deactivate", validate(idParamSchema, "params"), controller.deactivate);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
