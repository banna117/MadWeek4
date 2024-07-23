const TopNews = require('./models/topNewsModel');
const News = require("./models/newsModel");
const config = require('./config/config');
const mongoose = require('mongoose');
const puppeteer = require("puppeteer");

const fetchArticles = async () => {
    // 브라우저 실행
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 대상 URL로 이동
    const url = 'https://www.hani.co.kr/arti/society/environment';
    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    // 필요한 정보 추출
    const articles = await page.evaluate(() => {
        const articleNodes = document.querySelectorAll('div.BaseArticleCard_content__tYkEA');
        const articleData = [];

        articleNodes.forEach(node => {
            const linkElement = node.querySelector('a.BaseArticleCard_link__Q3YFK');
            const titleElement = node.querySelector('div.BaseArticleCard_title__TVFqt');
            const prologueElement = node.querySelector('p.BaseArticleCard_prologue__vToX3');
            const dateElement = node.querySelector('div.BaseArticleCard_date__4R8Ru');

            if (linkElement && titleElement && prologueElement && dateElement) {
                articleData.push({
                    url: linkElement.href,
                    title: titleElement.innerText,
                    content: prologueElement.innerText,
                    date: dateElement.innerText
                });
            }
        });

        return articleData;
    });

    await browser.close();
    return articles;
};

const saveNews = async (newsArticles) => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(config.mongoUri);
        }

        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB is not connected. Please ensure that the server is running and connected to MongoDB.');
            return;
        }

        await News.deleteMany({})
            .then(result => console.log(`Deleted ${result.deletedCount} items`))
            .catch(err => console.error('Error deleting news:', err));

        await News.insertMany(newsArticles);
        console.log("News articles saved to DB");

    } catch (error) {
        console.error("Error saving news to DB:", error.message);
    }
};

const performCrawling = async () => {
    const newsArticles = await fetchArticles();  // articles()는 올바른 함수명이 아님
    await saveNews(newsArticles);
};

module.exports = {
    performCrawling
};
