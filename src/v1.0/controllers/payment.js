const messages = require("../../config/messages");
var paypal = require("paypal-rest-sdk");
const { addOrder } = require("./order");
const { getCourseById } = require("../services/internal/course");
paypal.configure({
    mode: "sandbox", // or 'live'
    client_id: process.env.PAYPAL_CLEINT_ID,
    client_secret: process.env.PAYPAL_CLEINT_SECRETE,
});

const createPayment = async (req) => {
    try {
        const { productIds, total } = req.body;
        const courses = new Map();
        await Promise.all(
            productIds.map(async (item) => {
                const course = await getCourseById(item.id);
                courses.set(item.id, course);
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
                        items: productIds.map((item) => {
                            const storeItem = courses.get(item.id);
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
                        total: total,
                    },
                    description: "Your purchase of products",
                },
            ],
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error(error);
                res.status(500).send({ error });
            } else {
                return { data: payment.id };
            }
        });
    } catch (error) {
        console.log(error);
    }
};
const exicutePayment = (req) => {
    const { paymentId, payerId, total } = req.body;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: total,
                },
            },
        ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.error(error);
            return { error };
        } else {
            await addOrder(req.body.productIds);
            return { data: payment };
        }
    });
};
module.exports = {
    createPayment,
    exicutePayment,
};
