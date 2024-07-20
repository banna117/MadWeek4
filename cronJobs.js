const cron = require('node-cron');
const performCrawling = require('./crawler');

// 매일 아침 4시에 크롤링 작업 수행
cron.schedule('0 4 * * *', async () => {
    console.log('Running cron job at 4:00 AM');
    await performCrawling();
});
