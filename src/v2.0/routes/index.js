const router = require("express").Router();
const payment = require("../../v1.0/routes/payment");

router.use("/success", payment);
module.exports = router;
