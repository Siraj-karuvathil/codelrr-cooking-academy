const messages = require("../../config/messages");
var paypal = require("paypal-rest-sdk");
const { addOrder } = require("./order");
const { getCourseById } = require("../services/internal/course");
const { getCartByUserId } = require("../services/internal/cart");
paypal.configure({
  mode: "sandbox", // or 'live'
  client_id: process.env.PAYPAL_CLEINT_ID,
  client_secret: process.env.PAYPAL_CLEINT_SECRETE,
});

const createPayment = async (req) => {
  try {
    // const { productIds, total } = req.body;
    const userId = req?.user?._id;
    const cart = await getCartByUserId(userId);
    const courses = new Map();
    await Promise.all(
      cart.itemId.map(async (courseId) => {
        const course = await getCourseById(courseId);
        courses.set(courseId, course);
      })
    );
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      },
      transactions: [
        {
          item_list: {
            items: cart.itemId.map((courseId) => {
              const storeItem = courses.get(courseId);
              return {
                name: storeItem.name,
                sku: `product-${storeItem._id}`,
                price: storeItem.price,
                currency: "USD",
                quantity: 1,
              };
            }),
          },
          amount: {
            currency: "USD",
            total: cart?.price,
          },
          description: "Your purchase of products",
        },
      ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        return { error };
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            return { data: payment.links[i].href };
          }
        }
      }
    });
  } catch (error) {
    return { error };
  }
};
const exicutePayment = async (req) => {
  const paymentId = req.query.paymentId;
  const payerId = req.query.PayerID;
  const userId = req?.user?._id;
  const cart = await getCartByUserId(userId);
  console.log(cart);
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
        console.error(error);
        return { error };
      } else {
        await addOrder(cart?.itemId);
        return { data: payment };
      }
    }
  );
};
module.exports = {
  createPayment,
  exicutePayment,
};
