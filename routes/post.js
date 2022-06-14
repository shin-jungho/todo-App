import express from "express";

const router = express.Router();

router.get('/write', (req, res) => {
  res.render('write.ejs', { 사용자 : req.user ? req.user._id : undefined } );
})

router.post('/add', (req, res) => { // req에 post 보낸거 저장
  res.send('전송완료');
  db.collection('counter').findOne({ name : '게시물갯수' }, function(err, result) {
    console.log(result.totalPost);
    // 총 데이터 갯수
    let totalPostCount = result.totalPost
    let saveInfo = { _id : totalPostCount + 1, 작성자 : req.user._id, 제목 : req.body.title, 날짜 : req.body.date}
    db.collection('post').insertOne(saveInfo, function () {
      console.log('save complete');
      // $set 변경 연산자 $inc 증가 연산자 $min 기존값보다 적을 때만 변경 $rename key값 변경
      // name이 게시물 갯수인것 찾아서 1증가
      db.collection('counter').updateOne({ name : '게시물갯수' }, { $inc : { totalPost : 1 }}, function(err, result) {
        if (err) { return console.log(err)}
      })
    });
  });
});

router.get('/list', function (req, res) {
  db.collection('post').find().toArray();
  res.render('list.ejs', { posts : result });
})

router.delete('/delete', function(req, res) {
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

router.get('/detail/:id', function(req, res) {
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

router.get('/edit/:id', function (req, res) {
  db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, result) {
    if (err) {
      return console.log(err) 
    }
    res.render('edit.ejs', { post: result });
  })
})

router.put('/edit', function (req, res) {
  db.collection('post').updateOne({ _id : parseInt(req.params.id) }, { $set : { 제목 : req.body.title, 날짜 : req.body.date }}, function (err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('수정 완료');
    res.redirect('/list');
  })
})

export default router;