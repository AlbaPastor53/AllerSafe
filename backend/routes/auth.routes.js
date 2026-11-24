const express = require("express");
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { authentication } = require("../middlewares/authentication");
const { loginBodySchema, registerBodySchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerBodySchema), controller.register);
router.post("/login", validate(loginBodySchema), controller.login);
router.post("/refresh", controller.refresh);
router.get("/me", authentication, controller.me);
router.post("/logout", authentication, controller.logout);

module.exports = router;
