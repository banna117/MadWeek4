
const { performCrawling } = require('./crawler');

(async () => {
    await performCrawling()
  // 결과 출력
//   console.log(JSON.stringify(articles, null, 2));

  // 브라우저 종료

})();
