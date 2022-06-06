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
  console.log('전송완료');
  db.collection('post').insertOne({ 제목 : req.body.title, 날짜 : req.body.date }, function () {
    console.log('save complete');
  })
})

// 모든 데이터 꺼내는 코드
app.get('/list', function (req, res) {
  db.collection('post').find().toArray(function (err, result) {
    console.log(result);
    res.render('list.ejs', { posts : result });
  });
})