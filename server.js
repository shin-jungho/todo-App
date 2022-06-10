const express = require('express');
const app = express();
const MongoClient = require('mongodb/lib/mongo_client');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const crypto = require('crypto');

require('dotenv').config();
const { PORT, MONGODB_URI } = process.env;
const port = PORT || 4000;

app.use('public', express.static('public'));
app.use(methodOverride('_method'));
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);

// mongodb 접속 후에 8080서버 열린다는 뜻
var db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true },function(err, client) {
  // 에러처리
  if(err) {return console.log('err')}

  db = client.db('todoApp'); 
  app.listen(port, function () {
    console.log(`running on ${port}...`);
  });
})

app.use(express.urlencoded({extended: true})) // body parser express에 다 저장되어있어서 따로 설치필요x


app.get('/', function (req, res) {
  res.render('index.ejs');
})

app.get('/write', function (req, res) {
  res.render('write.ejs');
})

app.post('/add', function (req, res) { // req에 post 보낸거 저장
  res.send('전송완료');
  db.collection('counter').findOne({ name : '게시물갯수' }, function(err, result) {
    console.log(result.totalPost);
    // 총 데이터 갯수
    var totalPostCount = result.totalPost

    db.collection('post').insertOne({ _id : totalPostCount + 1, 제목 : req.body.title, 날짜 : req.body.date }, function () {
      console.log('save complete');
      // $set 바꿀때 스는 연산자 $inc 더할때 쓰는 연산자 
      // name이 게시물 갯수인것 찾아서 1증가
      db.collection('counter').updateOne({ name : '게시물갯수' }, { $inc : { totalPost : 1 }}, function(err, result) {
        if (err) { return console.log(err)}
      })
    });
  });
});

// 모든 데이터 꺼내는 코드
app.get('/list', function (req, res) {
  db.collection('post').find().toArray(function (err, result) {
    console.log(result);
    res.render('list.ejs', { posts : result });
  });
})

app.delete('/delete', function(req, res) {
  // id가 문자로 나오므로 숫자로 변환해야된다 
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, function(err, result) {
    if (err) {
      res.status(400).send({ message: 'Fail' }); // 요청 실패 메세지 
    }
    console.log('삭제 완료');
    res.status(200).send({ message: 'Success' }); // 요청 성공 메세지 
  });
})

app.get('/detail/:id', function(req, res) {
  // _id가 request의 parameter들 중 id와 같은 데이터를 찾아와서 그 결과를 detail페이지에 render
  // 다만 아까처럼 type이 string이 되었기에, parseInt를 통해서 바꿔 찾아줘야한다.
  db.collection('post').findOne({ _id: parseInt(req.params.id) }, function(err, result) {
    // 없는 게시물 처리하기 에러처리
    if (err) {
      return console.log(err);
    }
    res.render('detail.ejs', { data: result });
  })
});

app.get('/edit/:id', function (req, res) {
  db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, result) {
    if (err) {
      return console.log(err) 
    }
    console.log(result)
    console.log(req.params.id)
    res.render('edit.ejs', { post: result });
  })
})

app.put('/edit', function (req, res) {
  db.collection('post').updateOne({ _id : parseInt(req.params.id) }, { $set : { 제목 : req.body.title, 날짜 : req.body.date }}, function (err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('수정 완료');
    res.redirect('/list');
  })
})

app.get('/login', function(req, res) {
  res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }),function(req, res) {
  res.redirect('/')
})

app.get('/mypage', isLogin, function(req, res) {
  console.log(req.user);
  res.render('mypage.ejs', { user : req.user })
})

// 마이페이지 미들웨어
function isLogin(req, res, next) {
  if(req.user) {
    next()
  } else {
    res.send('로그인이 필요합니다.')
  }
}

// 회원가입 코드
app.get('/join', (req, res) => {
  res.render('join.ejs')
})

app.post('/register', (req, res) => {
  db.collection('login').find({ id: req.body.id }).toArray((err, result) => {
    if(err) { 
      return console.log(err); 
    } else if(!result) { // id가 없을때 login콜렉션에 db 삽입
      db.collection('login').insertOne({
        id: req.body.id,
        pw: req.body.pw
      }, (err, result) => {
        res.redirect('/');
      });
    }
    else { // 이미 존재하는 아이디일때
      res.send ('이미 존재하는 아이디입니다.')
    }
  });
});

// 로그인 기능 코드
passport.use(new LocalStrategy({
  usernameField: 'id', // form의 name이 id 인 것이 username
  passwordField: 'pw', // form의 name이 pw 인 것이 password
  session: true, // session을 저장할 것인지
  passReqToCallback: false, // id/pw 외에 다른 정보 검증 시
}, function (inputId, inputPw, done) {
  // console.log(inputId, inputPw);
  db.collection('login').findOne({ id: inputId }, function (err, result) {
    if (err) return done(err)

    // done(서버에러, 성공시 사용자 db데이터, 에러메세지)
    if (!result) return done(null, false, { message: '존재하지않는 아이디입니다.' })
    crypto.pbkdf2(inputPw, result.buf, 100000, 64, 'sha512', (err, key) => {
      let newPw = key.toString('base64');
      console.log('new pw :', newPw);
      if (newPw === result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
    })
}));

// 세션 데이터 저장시키는 코드
passport.serializeUser(function(user, done) {
  done(null, user.id)
});

// 마이페이지 접속시 발동 -> 로그인한 유저의 개인정보 db에서 찾는 것
passport.deserializeUser(function(id, done) { // id = user.id
  db.collection('login').findOne({ id: id }, function(err, result) {
    if (err) { return console.log(err)}
    done(null, result)
  })
})