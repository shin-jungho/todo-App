import express from 'express';
import { isLogin } from 'account';

const router= express.Router();

router.get('/chatroom', (req, res) => {
  res.render('chat.ejs');
})

router.get('/chatroom', isLogin, function(req, res){ 

  db.collection('chatroom').find({ member : req.user._id }).toArray().then((result)=>{
    console.log(result);
    응답.render('chat.ejs', {data : result})
  })

}); 

router.post('/chatroom', function(req, res){

  var chatSave = {
    title : '무슨무슨채팅방',
    member : [ObjectId(req.body.당한사람id), req.user._id],
    date : new Date()
  }

  db.collection('chatroom').insertOne(chatSave).then((result) => {
    res.send('저장완료')
  });
});

export default router;