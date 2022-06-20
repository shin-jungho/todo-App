import express from 'express';
import multer from 'multer';
import path from 'path';

const __dirname = path.resolve();


const router = express.Router();
//* 저장하는 법
// memoryStorage => ram에 휘발성있게 저장하는 것
const storage = multer.diskStorage({
  destination : function(req, file, cb) {
    cb(null, './public/image')
  },
  filename : function(req, file, cb) {
    cb(null, file.originalname + '날짜' + new Date())
  }
});

let upload = multer({ storage: storage });


router.get('/upload', (req, res) => {
  res.render('upload.ejs');
});

// 이미지 업로드시 multer를 미들웨어로 동작
// input file name이랑 single('name')과 같아야함
router.post('/upload', upload.single('profile'),  (req, res) => {
  res.send('업로드 완료')
});

// 유저한테 이미지페이지 보여주는것
router.get('/image/:imageName', (req, res) => {
  res.sendFile( __dirname + 'public/image/' + req.params.imageName )
})

export default router;