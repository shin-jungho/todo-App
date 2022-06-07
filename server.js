const express = require('express');
const app = express();
const MongoClient = require('mongodb/lib/mongo_client');
require('dotenv').config();
const { PORT, MONGODB_URI } = process.env;
const port = PORT || 4000;

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
  res.sendFile(__dirname + '/index.html');
})

app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/write.html');
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
    console.log('삭제 완료');
    res.status(200).send({ message: 'Success' }); // 요청 성공 메세지 
    // res.status(400).send({ message: 'Fail' }); // 요청 실패 메세지 
  });
})