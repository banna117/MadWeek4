const mongoose = require('mongoose');
const config = require("./config/config");
const News = require("./models/newsModel");
const TopNews = require("./models/topNewsModel");

const bcrypt = require('bcryptjs');
const {Server} = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

const path = require('path');
app.use(bodyParser.json());


mongoose.connect(config.mongodbUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


mongoose.connection.once('open', ()=>{
    const changeStream = TopNews.watch();
    changeStream.on('change', (change)=>{
        console.log('change detected:', change);
        io.emit('top-news-update', change);
    })
})

//mongoDB에서 가져오기
const users = [
    // 예시 사용자 데이터 (보통은 데이터베이스에 저장)
    { id: 1, username: 'admin', password: bcrypt.hashSync('adminpass', 10) }
];
    
//기본 라우터 설정    
app.get("/", (req, res)=>{
    res.send("hello, this is the news server!");
});

app.post("/api/login", (req,res)=>{
    const {username, password} = req.body;
    const user = user.find(u => u.username === username);

    if(user && bcrypt.compareSync(password, user.password)){
        const token = jwt.sign({userId:user.id, username: user.username},"secretKey",{expires:"1h"});
            res.json({token});
    }else{
        res.status(401).json({message:"invalid credentials"});
    }
    

})


// socket.io 클라이언트 스크립트 제공
app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/socket.io/client-dist/socket.io.js'));
});

app.use(express.static(path.join(__dirname, 'login')));

app.listen(port, () =>{
    console.log(`server is running on ${port}`);
})