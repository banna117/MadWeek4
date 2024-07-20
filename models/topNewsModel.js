const mongoose = require('mongoose');

const topNewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const TopNews = mongoose.model("TopNews", topNewsSchema);
module.exports = TopNews;