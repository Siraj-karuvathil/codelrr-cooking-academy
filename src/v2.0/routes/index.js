const router = require("express").Router();
var paypal = require("paypal-rest-sdk");
const { addOrder } = require("../../v1.0/controllers/order");
const { getCartByUserId } = require("../../v1.0/services/internal/cart");
paypal.configure({
  mode: process.env.PAYPAL_MODE, // or 'live'
  client_id: process.env.PAYPAL_CLEINT_ID,
  client_secret: process.env.PAYPAL_CLEINT_SECRETE,
});

router.get("/success", async (req, res) => {
  const paymentId = req.query.paymentId;
  const payerId = req.query.PayerID;
  const userId = req?.query?.UID;
  const cart = await getCartByUserId(userId);
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: cart?.price,
        },
      },
    ],
  };
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      if (error) {
        return { error };
      } else {
        addOrder(cart?.itemId, userId).then((order) => {
          res.redirect("http://localhost:3001/payment-success");
        });
      }
    }
  );
});
module.exports = router;
