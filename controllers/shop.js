const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
   try {
      const products = await Product.find();
      // .select(["title", "price", "-_id"])
      // .populate("userId", "name");
      res.render('shop/product-list', {
         prods: products,
         pageTitle: 'All Products',
         path: '/products'
      });
   } catch (err) {
      console.error(err);
   }
};

exports.getProduct = async (req, res, next) => {
   try {
      const prodId = req.params.productId;
      const product = await Product.findById(prodId);
      res.render('shop/product-detail', {
         product: product,
         pageTitle: product.title,
         path: '/products',
      });
   } catch (err) {
      console.error(err);
   }
};

exports.getIndex = async (req, res, next) => {
   try {
      const products = await Product.find();
      res.render('shop/index', {
         prods: products,
         pageTitle: 'Shop',
         path: '/'
      });
   } catch (err) {
      console.error(err);
   }
};

exports.getCart = async (req, res, next) => {
   const {cart: {items: cartProducts}} = await req.user.populate({path: "cart.items.productId"});
   res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: cartProducts
   });
};

exports.postCart = async (req, res, next) => {
   try {
      const prodId = req.body.productId;
      const product = await Product.findById(prodId);
      await req.user.addToCArt(product);
      res.redirect('/cart');

   } catch (err) {
      console.error(err);
   }
};

exports.postCartDeleteProduct = async (req, res, next) => {
   try {
      const prodId = req.body.productId;
      await req.user.deleteFromCart(prodId);
      res.redirect('/cart');
   } catch (err) {
      console.error(err);
   }
};

exports.getOrders = async (req, res, next) => {
   const orders = await Order.find({userId: req.user._id}).populate({path: "items.productId"});
   res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders || []
   });
};

// exports.getCheckout = (req, res, next) => {
//    res.render('shop/checkout', {
//       path: '/checkout',
//       pageTitle: 'Checkout'
//    });
// };

exports.postOrders = async (req, res, next) => {
   const order = new Order({items: req.user.cart.items, userId: req.user._id});
   await order.addOrder(req.user);
   res.redirect("/cart");
}
