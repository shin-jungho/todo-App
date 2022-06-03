require('dotenv').config();
const { PORT, MONGODB_URI } = process.env;

const express = require('express');
const MongoClient = require('mongodb/lib/mongo_client');
const app = express();

// mongodb 접속 후에 8080서버 열린다는 뜻
var db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true },function(err, client) {
  // 에러처리
  if(err) return console.log('err')
  
  db = client.db('todoApp'); 

  db.collection('post').insertOne( { 이름: 'John', _id: 1, 나이: 20 }, function(err, result) {
    console.log('save complete');
  });

  app.listen(PORT, function () {
    console.log(`running on ${PORT}...`);
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
  db.collection('post').insertOne({ 제목 : req.body.title, 날짜 : req.body.date }, function (err, result) {
    console.log('save complete');
  })
  console.log('전송완료');
})