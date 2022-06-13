import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/login', function(req, res) {
  res.render('login.ejs');
})

router.post('/login', passport.authenticate('local', { 
  failureRedirect: '/fail',
  failureMessage: 'Fail to login',
  }), (req, res) => {
  res.redirect('/')
});


router.get('/mypage', isLogin, function(req, res) {
  console.log('/mypage', req.user);
  res.render('mypage.ejs', { user : req.user._id })
})


// 마이페이지 미들웨어
function isLogin(req, res, next) {
  if(req.user) {
    next()
  } else {
    res.redirect('/login');
  }
}