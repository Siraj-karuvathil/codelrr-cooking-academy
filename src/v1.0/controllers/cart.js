const messages = require("../../config/messages");
const { Cart } = require("../models");
const {
  getCartByUserId,
  deleteCartById,
  createCart,
  updateCart,
} = require("../services/internal/cart");
const { getCourseById } = require("../services/internal/course");

const addToCart = async (req) => {
  const data = { itemId: [] };
  data.userId = req?.user?._id;
  const cart = await getCartByUserId(req?.user?._id);
  const priceData = await getCourseById(req?.body?.itemId, "price");
  if (cart === null) {
    data.itemId.push(req?.body?.itemId);
    data.price = priceData.price;
    await createCart(data);
    return {
      message: messages.success,
    };
  }
  const isPresent = cart.itemId.includes(req?.body?.itemId);
  if (isPresent) {
    return {
      message: messages.allreadyIn,
    };
  } else {
    const price = cart.price + priceData.price;
    await updateCart(cart._id, price, req?.body?.itemId);
  }
  return {
    message: messages.success,
  };
};

const removeFromCart = async (req) => {
  const cart = await getCartByUserId(req?.user?._id);
  const priceData = await getCourseById(req?.body?.itemId, "price");
  if (cart) {
    const isPresent = cart.itemId.includes(req?.body?.itemId);
    if (isPresent) {
      const price = cart.price - priceData.price;
      await deleteCartById(cart._id, price, req?.body?.itemId);
      return { message: messages?.cartItemRemovedSuccessfully };
    }
  }
  return { message: messages?.cartNotExist };
};

const getAllFromCart = async (req) => {
  const cart = await getCartByUserId(req?.user?._id);
  return {
    message: messages?.success,
    data: cart,
  };
};

const deleteCartByUserId = async (userId) => {
  return await Cart.deleteOne({ userId });
};

module.exports = {
  addToCart,
  removeFromCart,
  getAllFromCart,
  deleteCartByUserId,
};
