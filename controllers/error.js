exports.get404 = (req, res, next) => {
   res.status(404).render('404', {
      pageTitle: 'Page Not Found',
      path: '/404',
      isAuthenticated: req.session.isLogin
   });
};

exports.get500 = (error, req, res, next) => {
   console.log(error);
   console.log("heheheh");
   res.status(500).render('500', {
      pageTitle: 'Page Not Found',
      path: '/500',
      isAuthenticated: req.session.isLogin
   });
};
