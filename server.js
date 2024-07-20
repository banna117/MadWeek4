const mongoose = require('mongoose');
const config = require("./config/config");
const News = require("./models/newsModel");
const TopNews = require("./models/topNewsModel");

const express = require('express');
const app = express();
const port = procdss.env.PORT || 3000;



mongoose.connect(config.mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

//기본 라우터 설정    
app.get("/", (req, res)=>{
    res.send("hello, this is the news server!");
});

app.removeListener(port, () =>{
    console.log(`server is running on ${port}`);
})