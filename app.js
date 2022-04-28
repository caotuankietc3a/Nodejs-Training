const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const app = express();
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const multer = require('multer');
const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: false}));

const diskStorage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, './public/images')
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + "-" + file.originalname);
   }
});
app.use(multer({storage: diskStorage}).single("imageUrl"));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');


// Session
// const uri = "mongodb+srv://kietcao:hokgadau123@cluster0.ps9wx.mongodb.net/shop?retryWrites=true&w=majority";
const uri = "mongodb+srv://kietcao:hokgadau123@cluster0.ps9wx.mongodb.net/shop?";
const authRoutes = require('./routes/auth');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
   uri: uri,
   collection: "sessionStore"
});
app.use(session({
   secret: "my secret",
   resave: false,
   saveUninitialized: false,
   store
}));

// Security
const csrf = require('csurf');
const csrfProtection = csrf({});
// must behind creating session.
// <input type="hidden" name="_csrf" value="<%= csrfToken %>"> must be needed for all html form
app.use(csrfProtection);

// to create message
// must behind creating session.
const flash = require('connect-flash');
app.use(flash());

// Tell all pages which contain <form></form> csrfToken
app.use((req, res, next) => {
   res.locals.isAuthenticated = req.session.isLogin;
   res.locals.csrfToken = req.csrfToken();
   next();
});

// req.user store
app.use(async (req, res, next) => {
   try {
      if (!req.session.userId) return next();
      const user = await User.findById(req.session.userId);
      if (!user) throw new Error("User doesn't exist!!!");
      req.user = user;
      next();
   } catch (err) {
      return next(err);
   }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

app.use(errorController.get500);

// must have ; to all app.use() and other methods
(async function () {
   try {
      await mongoose.connect(uri);
      app.listen(3000);
   } catch (err) {
      console.error(err);
   }
})();

