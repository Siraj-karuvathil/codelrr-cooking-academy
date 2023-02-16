const router = require("express").Router();
const makeCallback = require("../../../utils/callback");
const orderController = require("../../controllers/payment");

//POST : create payment
router.post("/", makeCallback(orderController.createPayment));

module.exports = router;
