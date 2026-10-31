const express = require("express");
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { authentication } = require("../middlewares/authentication");
const { loginBodySchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/login", validate(loginBodySchema), controller.login);
router.post("/logout", authentication, controller.logout);

module.exports = router;
