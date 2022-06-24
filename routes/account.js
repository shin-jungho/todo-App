// 유저 계정 관련 라우터
import express from 'express';
import passport from 'passport';

import bcrypt from 'bcrypt';
import { userCollection } from '../server.js';

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login.ejs', { user: req.user ? req.user.id : undefined });
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.save((err) => {
    res.redirect('/');
  });
});

router.get('/signup', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('signup.ejs', { user: req.user ? req.user.id : undefined });
  }
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: 'Fail to login!',
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/signup', async (req, res) => {
  let { id, pw, pwConfirm } = req.body;
  id = id ? id.trim() : null;
  pw = pw ? pw.trim() : null;
  pwConfirm = pwConfirm ? pwConfirm.trim() : null;
  let error = '';
  if (!id || !pw || !pwConfirm) {
    error = '빈칸이 있습니다.';
    return res.redirect('/signup') // 나중에 고칠것 페이지 리로딩으로되게끔
  } else if (pw !== pwConfirm) {
    error = '비밀번호가 동일하지 않습니다.';
    return res.redirect('/signup')
  } else {
    const sameIdUser = await userCollection.findOne({ id });
    if (sameIdUser) {
      error = '아이디가 이미 사용중입니다.';
      return res.redirect('/signup')
    }
  }
  if (error) {
    return res.status(400).json({ error });
  } else {
    pw = await bcrypt.hash(pw, +process.env.SALT_ROUNDS);
    userCollection.insertOne({ id, pw });
    res.status(200).json({ message: 'Registered successfully' });
    res.redirect('/')
  }
});

// 콜백 실행하기 전 로그인했니 미들웨어를 통해 했는지 필터링
router.get('/mypage', isLogin, (req, res) => {
  console.log('/mypage:', req.user);
  res.render('mypage.ejs', { user: req.user.id });
});

// 미들웨어의 일종
export function isLogin(req, res, next) {
  if (req.user) {
    next(); // 로그인 한 상태면 통과
  } else {
    // res.send('로그인이 필요합니다.');
    res.write("<script>alert('로그인이 필요합니다.')</script>")
    res.write("<script>window.location.replace('/login')</script>")
  }
}

export default router;