import express from 'express';
import { chatRoomCollection } from '../server.js';
import { isLogin } from './account.js';
import pkg from 'mongodb';

const { ObjectId } = pkg;

const router = express.Router();

router.post('/chatroom', (req, res) => {
  const chatSave = {
    title: '채팅방',
    member: [req.body.당한사람id, req.user._id],
    date: new Date()
  }

  chatRoomCollection.insertOne(chatSave).then((result) => {
    res.send('저장완료')
  })
})

router.get('/chatroom', (req, res) => {
  chatRoomCollection.find({ member : req.user._id }).toArray().then((result) => {
    console.log(result);
    res.render('chatRoom.ejs', {data: result});
  })
  res.render('chatRoom.ejs')
})



export default router;