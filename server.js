const express = require('express');
const app = express();
const MongoClient = require('mongodb/lib/mongo_client');
require('dotenv').config();
const { PORT, MONGODB_URI } = process.env;
const port = PORT || 4000;

app.use('public', express.static('public'));
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