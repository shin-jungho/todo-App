import express from 'express';
import { postCollection, counterCollection } from '../server.js';
const router = express.Router();

router.get('/write', (req, res) => {
  res.render(`write.ejs`, { 사용자: req.user ? req.user.id : undefined });
});

router.post('/add', async (req, res) => {
  try {
    const { title, date } = req.body;
    // 총 게시물 갯수 가져오기
    let { totalPost } = await counterCollection.findOne({ name: '게시물갯수' });
    postCollection.insertOne({
      _id: totalPost + 1,
      작성자: req.user.id,
      제목: title,
      마감날짜: date,
      날짜: new Date()
    });
    // 연산자 종류: $set - 변경 / $inc - 증가 / $min - 기존값보다 적을 때만 변경 / $rename - key값 변경
    counterCollection.updateOne(
      { name: '게시물갯수' },
      { $inc: { totalPost: 1 } } // 총 게시물 갯수 1 증가
    );
    res.redirect('/list');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/list', async (req, res) => {
  const result = await postCollection.find().toArray();
  res.render('list.ejs', {
    posts: result,
    사용자: req.user ? req.user.id : undefined,
  }); // 서버 사이드 렌더링
});

router.get('/search', (req, res) => {
  //index만들어둔걸로 빠르게 검색하려면
  var searchOption = [
    {
      $search : {
        index : 'titleSearch',
        text : {
          query : req.query.value,
          path : 'title'
        }
      }
    },
    // 검색조건 더 주는 법 : - 결과 정렬하기
    { $sort : { _id : -1 } },
    { $limit : 10 }, // 갯수 제한 두기
    { $project : { title : 1, _id : 0, score : { $meta : "searchScore" } } } // 검색결과에서 필터주기
  ]

  postCollection.aggregate(searchOption).toArray((err, result) => {
    console.log(result);
    res.render('search.ejs', { posts : result });
  })

});

router.delete('/delete', async (req, res) => {
  const { deletedCount } = await postCollection.deleteOne({
    _id: +req.body._id,
    작성자: req.user.id,
  });
  if (deletedCount === 1) {
    res.status(200).json({ message: 'The post has been deleted' });
  } else {
    res.status(400).json({ message: 'The post is not found' });
  }
});

router.get('/detail/:id', async (req, res) => {
  const result = await postCollection.findOne({ _id: +req.params.id });
  if (result) {
    res.status(200).render('detail.ejs', {
      post: result,
      사용자: req.user ? req.user.id : undefined,
    });
  } else {
    res.status(400).render('detail.ejs', {
      error: 'The post is not found',
      사용자: req.user ? req.user.id : undefined,
    });
  }
});

router.get('/edit/:id', async (req, res) => {
  const result = await postCollection.findOne({ _id: +req.params.id });
  if (result) {
    res.status(200).render('edit.ejs', { post: result });
  } else {
    res.status(404).render('edit.ejs', { error: 'The post is not found' });
  }
});

router.put('/edit', async (req, res) => {
  // 폼에 담긴 제목, 날짜 데이터를 가지고
  // db.collection 에다가 업데이트함
  const { id, title, date } = req.body;
  const {
    result: { nModified },
  } = await postCollection.updateOne(
    { _id: +id },
    { $set: { 제목: title, 날짜: date } }
  );

  if (nModified === 1) {
    res.redirect('/list');
  } else {
    res.status(400).send('Fail to modify the post.');
  }
});

export default router;