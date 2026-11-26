const express = require("express");
const controller = require("../controllers/comment.controller");
const validate = require("../middlewares/validate");
const { authentication } = require("../middlewares/authentication");
const { admin } = require("../middlewares/admin");
const commentOwner = require("../middlewares/commentOwner");
const {
  commentBodySchema,
  updateCommentBodySchema,
  eventQuerySchema,
  idParamSchema,
  statusSchema
} = require("../schemas/comment.schema");

const router = express.Router();

router.get("/", validate(eventQuerySchema, "query"), controller.getAll);
router.get("/summary", validate(eventQuerySchema, "query"), controller.summary);
router.get(
  "/sentiment",
  authentication,
  admin,
  validate(eventQuerySchema, "query"),
  controller.sentiment
);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);

router.post(
  "/",
  authentication,
  validate(commentBodySchema),
  controller.create
);
router.patch(
  "/:id/status",
  authentication,
  admin,
  validate(idParamSchema, "params"),
  validate(statusSchema),
  controller.setActive
);
router.patch(
  "/:id",
  authentication,
  validate(idParamSchema, "params"),
  commentOwner,
  validate(updateCommentBodySchema),
  controller.update
);
router.delete(
  "/:id",
  authentication,
  validate(idParamSchema, "params"),
  commentOwner,
  controller.remove
);

module.exports = router;
