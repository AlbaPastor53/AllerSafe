const express = require("express");
const controller = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const {
  userBodySchema,
  updateUserBodySchema,
  idParamSchema,
  querySchema,
  statusSchema
} = require("../schemas/user.schema");

const router = express.Router();

router.get("/", validate(querySchema, "query"), controller.getAll);
router.get("/:id/profile",
  validate(idParamSchema, "params"),
  controller.getProfile
);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);

router.patch(
  "/:id/restore",
  validate(idParamSchema, "params"),
  controller.restore
);

router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(statusSchema),
  controller.changeStatus
);

router.post("/", validate(userBodySchema), controller.create);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateUserBodySchema),
  controller.update
);
router.delete("/:id", validate(idParamSchema, "params"), controller.softDelete);

module.exports = router;
