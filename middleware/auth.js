const User = require('../models/user');
const {check, body} = require('express-validator');
const bcryptjs = require('bcryptjs');
exports.isAuth = (req, res, next) => {
   if (!req.session.isLogin) {
      return res.redirect("/login");
   }
   next();
}

exports.checkEmail = (method) => {
   switch (method) {
      case 'login': {
         return check("email")
            .isEmail()
            .withMessage("Invalid Email!")
            .custom(async (_value, {req}) => {
               const {password, email} = req.body;
               const user = await User.findOne({email: email});
               if (!user) {
                  req.flash("oldInput", {
                     oldEmail: email,
                     oldPassword: password,
                  });
                  return Promise.reject("User didn't exist !!!");
               }
               const matchPass = await bcryptjs.compare(password, user.password);
               if (!matchPass) {
                  req.flash("oldInput", {
                     oldEmail: email,
                     oldPassword: password,
                  });
                  return Promise.reject("Password does not match!!!");
               }
               return true;
            });
      }
      case 'signup': {
         return [
            check("email")
               .isEmail()
               .withMessage("Invalid Email!")
               .normalizeEmail()
               .custom(async (value) => {
                  const user = await User.findOne({email: value});
                  if (user) {
                     return Promise.reject("Email already in use!!!");
                  }
               }),
            body("password",
               "The password must be 5+ chars long and contain a number")
               .isLength({min: 5})
               .isAlphanumeric()
               .trim(),
            body("confirmPass")
               .trim()
               .custom((value, {req}) => {
                  if (value !== req.body.password) throw new Error("Password confirmation does not match password!!!");
                  return true;
               })
         ]
      }
      default: {
         return [];
      }

   }
}

exports.checkAddProduct = () => {
   // Must provide not().isEmpty() to check empty string in express-validator
   return [
      body("title")
         .trim()
         .not().isEmpty()
         .withMessage("You must provide title for a book!!!"),
      // body("imageUrl")
      // .trim()
      // .not().isEmpty().withMessage("Please provide a valid image url!!!"),
      // .isURL().withMessage("Invalid image Url!!! Please try another one..."),
      body("price", "You must provide price for a book!!!")
         .not().isEmpty()
         .isNumeric().withMessage("Price must be a number!!!")
         .isLength({min: 1, max: 6}).withMessage("Price must be greater than 1$ and less than 999999$!!!"),
      body("description")
         .trim()
         .not().isEmpty().withMessage("You must provide some descriptions for a book!!!")
   ]
}
