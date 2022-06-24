import express from 'express';
import { chatroomCollection } from '../server.js';
import { isLogin } from './account.js';
import pkg from 'mongodb';

const { ObjectId } = pkg;

const router = express.Router();

router.get('/chat', isLogin, (req, res) => {
  chatroomCollection.find({ member : req.user._id }).toArray().then((result) => {
    console.log(result);
    res.render('chatRoom.ejs', {data : result});
  })
})

router.post('/chatroom', isLogin, (req, res) => {
  
  let saveData = {
    title : '채팅방',
    member : [ObjectId(req.body.당한사람id), req.user._id],
    date : new Date()
  }
  console.log(saveData);
  chatroomCollection.insertOne(saveData).then((result) => {
    res.send('저장완료', { data : result });
  }).catch((err) => {
    res.send('저장이 안됬습니다.');
  })
})



// //* chatroom
// router.post('/chatroom', isLogin, function(req, res){

//   let saveData = {
//       post : parseInt(req.body.글번호),
//       title : req.body.할일,
//       members : [ObjectId(req.body.작성자), req.user._id], // 글작성자와 채팅요청자
//       date : new Date() // 현재 날짜
//   }

//   chatroomCollection.insertOne(saveData).then(()=>{
//       res.send('채팅방 개설 완료')
//   })
// })



// //* chat
// router.get('/chat', isLogin, function(req, res){

//   chatroomCollection.find({ members : req.user._id }).toArray().then((result)=>{
//       res.render('chatroom.ejs', {data : result})
//   })
// })



export default router;