const express = require("express");
const controller = require("../controllers/profile.controller");
const validate = require("../middlewares/validate");
const { profileBodySchema } = require("../schemas/profile.schema");

const router = express.Router();

router.get("/", controller.get);
router.patch("/", validate(profileBodySchema), controller.update);

module.exports = router;
