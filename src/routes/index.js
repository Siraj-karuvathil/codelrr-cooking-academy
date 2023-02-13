const router = require("express").Router();
const v1 = require("../v1.0/routes");

// api version 1.0 routes
router.use("/1.0", v1);

module.exports = router;
