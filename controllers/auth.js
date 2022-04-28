const {randomBytes} = require('crypto');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

// get Errors result from check().isEmail()...
const {validationResult} = require('express-validator');

const options = {
   auth: {
      api_key: "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"
   }
}
const mailer = nodemailer.createTransport(sgTransport(options));


exports.getLogin = (req, res, next) => {
   // const isLogin = req.get("Cookie").split("=")[1].trim();
   // console.log(req.headers);
   // console.log(req.session);

   // use req.flash() will clear errorMess automatically
   const mess = req.flash("error");
   const errorMess = mess.length > 0 ? mess[0] : null;
   const oldInputMess = req.flash("oldInput");
   const oldInput = oldInputMess.length > 0 ? oldInputMess[0] : {
      oldEmail: "",
      oldPassword: ""
   };
   res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuthenticated: false,
      errorMess,
      oldInput
   })
};

exports.postLogin = async (req, res, next) => {
   // res.setHeader("Set-Cookie", "loggedIn=true");
   const errors = validationResult(req);
   const {password, email} = req.body;
   if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      req.flash("oldInput", {
         oldEmail: email,
         oldPassword: password,
      });
      return res.status(422).redirect('/login');
   }

   const user = await User.findOne({email: email});
   req.session.isLogin = true;
   req.session.userId = user._id;

   // to ensure that redirect will perform task before session is stored!!!
   req.session.save((err) => {
      if (err) console.log(err);
      res.redirect("/");
   });
};

exports.postLogout = (req, res, next) => {
   req.session.destroy((err) => {
      if (err) console.log(err);
      res.redirect("/");
   });
}

exports.getSignup = (req, res, next) => {
   const mess = req.flash("error");
   const errorMess = mess.length > 0 ? mess[0] : null;
   const oldInputMess = req.flash("oldInput");
   const oldInput = oldInputMess.length > 0 ? oldInputMess[0] : {
      oldEmail: "",
      oldPassword: "",
      oldConfirmPass: ""
   };
   res.render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      isAuthenticated: false,
      errorMess,
      oldInput
   });
}

exports.postSignup = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      const {email, password, confirmPass} = req.body;
      if (!errors.isEmpty()) {
         req.flash("error", errors.array()[0].msg);
         req.flash("oldInput", {
            oldEmail: email,
            oldPassword: password,
            oldConfirmPass: confirmPass
         });
         return res.status(422).redirect('/signup');
      }
      const name = email.split("@")[0];
      const hashPass = await bcryptjs.hash(password, 12);
      const newUser = new User({
         name,
         email,
         password: hashPass,
         cart: {
            items: []
         }
      });
      await newUser.save();
      // Need to create sigle sender in https://app.sendgrid.com/settings/sender_auth/sendershttps://app.sendgrid.com/settings/sender_auth/senders
      const message = {
         from: "caotuankietc3a@gmail.com",
         to: email,
         subject: "Signup succeeded!!",
         html: "<h1>Signup succeeded!!</h1>"
      };
      await mailer.sendMail(message);
      res.redirect("/login");
   } catch (err) {
      console.error(err);
   }
}

exports.getReset = (req, res, next) => {
   const mess = req.flash("error");
   const errorMess = mess.length > 0 ? mess[0] : null;
   res.render("auth/reset", {
      path: "/reset",
      pageTitle: "Reset password",
      isAuthenticated: false,
      errorMess
   });
}

exports.postReset = (req, res, next) => {
   randomBytes(32, async (err, buf) => {
      if (err) {
         console.error(err);
         return res.redirect("/reset");
      }
      const token = buf.toString("hex");
      try {
         const user = await User.findOne({email: req.body.email});
         if (!user) {
            req.flash("error", "Email does not exist!!!");
            return res.redirect("/reset");
         }
         user.resetToken = token;
         user.resetTokenExpiration = Date.now() + 36000000; // miliseconds
         user.save();
         res.redirect("/login");
         const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
         await mailer.sendMail({
            from: "caotuankietc3a@gmail.com",
            to: req.body.email,
            subject: "Reset password succeed!!!",
            html: `
               <h1>Signup succeeded!!</h1>
               If you want to set password again please click here...
               <a href="${fullUrl}/${token}">Reset Password</a>
            `
         });
      } catch (err) {
         console.error(err);
      }
   })
}

// reset/:token
exports.getNewPassword = async (req, res, next) => {
   try {
      const token = req.params.token;
      const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
      const mess = req.flash("error");
      const errorMess = mess.length > 0 ? mess[0] : null;
      res.render("auth/new-password", {
         path: "/new-password",
         pageTitle: "Update password",
         isAuthenticated: false,
         errorMess,
         userId: user._id.toString(),
         passwordToken: token
      });
   } catch (err) {
      console.error(err);
   }
}

exports.postNewPassword = async (req, res, next) => {

   try {
      const {userId, password, passwordToken} = req.body;
      const user = await User.findOne({
         resetTokenExpiration: {$gt: Date.now()},
         resetToken: passwordToken,
         _id: userId
      });
      const newHashPass = await bcryptjs.hash(password, 12);
      user.resetToken = null;
      user.resetTokenExpiration = null;
      user.password = newHashPass;
      await user.save();
      res.redirect("/login");
   } catch (err) {
      console.error(err);
   }
}
