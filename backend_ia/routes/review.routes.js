const express = require("express");
const controller = require("../controllers/review.controller");
const validate = require("../middlewares/validate");
const { reviewBodySchema } = require("../schemas/review.schema");

const router = express.Router();

router.post("/analyze", validate(reviewBodySchema), controller.analyze);

module.exports = router;
