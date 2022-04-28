const Product = require('../models/product');
const {validationResult} = require('express-validator');

exports.getAddProduct = async (req, res, next) => {
   const mess = req.flash("error");
   const errorMess = mess.length > 0 ? mess[0] : null;
   const oldInputMess = req.flash("oldInput");
   const oldInput = oldInputMess.length > 0 ? oldInputMess[0] : {
      oldTitle: "",
      oldPrice: "",
      oldDescription: "",
      oldImageUrl: ""
   };
   res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMess,
      oldInput
   });
};

exports.postAddProduct = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      const {title, price, description} = req.body;
      const arrayPath = req.file?.path.split('/');
      const imageUrl = arrayPath.splice(1).join("/");
      console.log(req.file);
      if (!errors.isEmpty()) {
         req.flash("error", errors.array()[0].msg);
         req.flash("oldInput", {
            oldTitle: title,
            oldPrice: price,
            oldDescription: description,
            oldImageUrl: imageUrl
         });
         return res.status(422).redirect("/admin/add-product");
      }
      const user = req.user;
      // Automatically store user._id
      const product = new Product({
         title: title,
         price: price,
         description: description,
         imageUrl: imageUrl,
         userId: user
      });
      await product.save();
      res.redirect('/');
   } catch (err) {
      console.error(err);
   }
};

exports.getEditProduct = async (req, res, next) => {
   try {
      const mess = req.flash("error");
      const errorMess = mess.length > 0 ? mess[0] : null;
      const oldInputMess = req.flash("oldInput");
      const oldInput = oldInputMess.length > 0 ? oldInputMess[0] : {
         oldTitle: "",
         oldPrice: "",
         oldDescription: "",
         oldImageUrl: ""
      };
      const editMode = req.query.edit;
      if (!editMode) {
         return res.redirect('/');
      }
      const prodId = req.params.productId;
      const product = await Product.findById(prodId);
      if (!product) {
         return res.redirect('/');
      }
      res.render('admin/edit-product', {
         pageTitle: 'Edit Product',
         path: '/admin/edit-product',
         editing: editMode,
         product: product,
         isAuthenticated: true,
         errorMess,
         oldInput
      });
   } catch (err) {
      console.error(err);
   }
};

exports.postEditProduct = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      const {title, price, description, imageUrl, productId} = req.body;
      if (!errors.isEmpty()) {
         req.flash("error", errors.array()[0].msg);
         req.flash("oldInput", {
            oldTitle: title,
            oldPrice: price,
            oldDescription: description,
            oldImageUrl: imageUrl
         });
         return res.status(422).redirect(`/admin/edit-product/${productId}?edit=true`);
      }
      await Product.updateOne({_id: productId}, {title, price, description, imageUrl});
      res.redirect('/admin/products');
   } catch (err) {
      console.error(err);
   }
};

exports.getProducts = async (req, res, next) => {
   try {
      const products = await Product.find({userId: req.user._id});
      res.render('admin/products', {
         prods: products,
         pageTitle: 'Admin Products',
         path: '/admin/products',
         isAuthenticated: true
      });
   } catch (err) {
      console.error(err);
   }
};

exports.postDeleteProduct = async (req, res, next) => {
   const prodId = req.body.productId;
   try {
      await Product.deleteOne({_id: prodId});
      res.redirect('/admin/products');
   } catch (err) {
      console.error(err);
   }
};
