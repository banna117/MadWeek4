const crawler = require('./crawler');

// 네이버 뉴스 API 테스트
(async () => {
    const keyword = '환경'; // 테스트 키워드
    // const newsItems = await crawler.fetchNaverNews(keyword);
    const ynaNewsItems = await crawler.performCrawling();
    console.log(ynaNewsItems);
})();
