const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true})) // body parser express에 다 저장되어있어서 따로 설치필요x

app.listen(8080, function () {
  console.log('running on 8080...');
});

// app.get('/pet', function (req, res) {
//   res.send('펫용품 쇼핑할 수 있는 페이지 입니다.');
// })

// app.get('/beauty', function (req, res) {
//   res.send('뷰티용품을 쇼핑할 수 있는 페이지입니다.');
// })

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/write.html');
})

app.post('/add', function (req, res) { // req에 post 보낸거 저장
  res.send('전송완료')
  console.log(req.body.date);
  console.log(req.body.title);
  console.log(req.body);
})