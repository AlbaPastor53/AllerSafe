const express = require("express");
const controller = require("../controllers/shop.controller");
const validate = require("../middlewares/validate");
const {
  shopEventsQuerySchema,
  shopHomeQuerySchema,
  shopSlugParamSchema
} = require("../schemas/shop.schema");

const router = express.Router();

router.get("/", validate(shopHomeQuerySchema, "query"), controller.getHome);
router.get(
  "/events",
  validate(shopEventsQuerySchema, "query"),
  controller.getEvents
);
router.get(
  "/events/slug/:slug",
  validate(shopSlugParamSchema, "params"),
  controller.getEventBySlug
);

module.exports = router;
