const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const TopNews = require('./models/topNewsModel');
const config = require('./config/config');

const sitemapUrls = [
    'https://www.yna.co.kr/news-sitemap3.xml',
    'https://www.yna.co.kr/news-sitemap4.xml',
    'https://www.yna.co.kr/news-sitemap5.xml',
    'https://www.yna.co.kr/news-sitemap6.xml',
    'https://www.yna.co.kr/photo-sitemap.xml',
    'https://www.yna.co.kr/graphic-sitemap.xml'
];

const fetchSitemap = async (sitemapUrl) => {
    try {
        const response = await axios.get(sitemapUrl, { timeout: 10000 });
        return response.data;
    } catch (error) {
        console.error('Error fetching sitemap:', error.message);
        return null;
    }
};

const extractUrlsFromSitemap = (sitemapContent) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(sitemapContent, (err, result) => {
            if (err) {
                reject('Error parsing XML: ' + err.message);
            } else {
                const urls = result.urlset.url.map(urlElement => urlElement.loc[0]);
                resolve(urls);
            }
        });
    });
};

const fetchAndFilterNews = async (urls, keyword) => {
    const newsArticles = [];
    for (const url of urls) {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            const title = $('title').text();
            let content = '';

            $('p').each((i, elem) => {
                content += $(elem).text() + '\n';
            });

            if (title.includes(keyword) || content.includes(keyword)) {
                newsArticles.push({ title, url, content });
            }
        } catch (error) {
            console.error(`Error fetching news at ${url}:`, error.message);
        }
    }
    return newsArticles;
};

//NaverNews API 사용




const saveTopNews = async (newsArticles)=>{
    try{
        await TopNews.deleteMany({}); //기존 데이터 삭제
        //TODO: topnews들을 뽑는 로직을 따로
        // replace newsArticles.slice(0,5)
        await TopNews.insertMany(newsArticles.slice(0,5));
        console.log("top news articles saved to DB");

    } catch (error){
        console.error("Error saving top news to DB:", error.message);
    }
}


const performCrawling = async () => {
    let allUrls = [];
    for (const sitemapUrl of sitemapUrls) {
        const sitemapContent = await fetchSitemap(sitemapUrl);
        if (sitemapContent) {
            try {
                const parsedSitemap = await extractUrlsFromSitemap(sitemapContent);
                allUrls = allUrls.concat(parsedSitemap);
            } catch (error) {
                console.error('Error extracting URLs:', error);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
    }

    const keyword = '환경';
    const filteredNews = await fetchAndFilterNews(allUrls, keyword);

    // filteredNews.forEach(news => {
    //     console.log('Title:', news.title);
    //     console.log('URL:', news.url);
    //     console.log('Content:', news.content);
    // });

    const naverNews = await fetchNaverNews(keyword);
    const combinedNews = [...filteredNews, ...naverNews.map(item => ({
        title: item.title,
        url: item.link,
        content: item.description
    }))];

    console.log(combinedNews);

    await saveTopNews(combinedNews);

};

const fetchNaverNews = async (query) => {
    const url = 'https://openapi.naver.com/v1/search/news.json';
    const options = {
        headers: {
            'X-Naver-Client-Id': config.naverClientId,
            'X-Naver-Client-Secret': config.naverClientSecret
        },
        params: {
            query: query,
            display: 10,
            start: 1,
            sort: 'date'
        }
    };

    try {
        const response = await axios.get(url, options);
        return response.data.items;
    } catch (error) {
        console.error('Error fetching Naver News:', error.message);
        return [];
    }
};

module.exports = {
    fetchNaverNews,
    performCrawling
};