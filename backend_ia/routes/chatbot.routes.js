const express = require("express");
const controller = require("../controllers/chatbot.controller");
const validate = require("../middlewares/validate");
const { chatBodySchema } = require("../schemas/chatbot.schema");

const router = express.Router();

router.post("/message", validate(chatBodySchema), controller.message);

module.exports = router;
