const express = require("express");
const controller = require("../controllers/faq.controller");
const validate = require("../middlewares/validate");
const { faqBodySchema } = require("../schemas/faq.schema");

const router = express.Router();

router.post("/generate", validate(faqBodySchema), controller.generate);

module.exports = router;
