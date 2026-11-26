const express = require("express");
const controller = require("../controllers/cart.controller");
const validate = require("../middlewares/validate");
const { addItemBodySchema } = require("../schemas/cart.schema");

const router = express.Router();

router.get("/", controller.get);
router.post("/items", validate(addItemBodySchema), controller.addItem);

module.exports = router;
