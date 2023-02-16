const router = require("express").Router();
const messages = require("../../config/messages");
const makeCallback = require("../../utils/callback");
const orderController = require("../controllers/payment");

router.get("/", makeCallback(orderController.exicutePayment));

module.exports = router;
