// Load environment variables from .env file
require('dotenv').config();

// POLYFILL: Add File API for older Node.js versions or undici compatibility
const { Blob, File } = require('buffer');
if (typeof globalThis.File === 'undefined') {
    globalThis.File = File;
}
if (typeof globalThis.Blob === 'undefined') {
    globalThis.Blob = Blob;
}

const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const rssParser = new Parser();

// Configuration
const CONFIG = {
    newsApiKey: process.env.NEWS_API_KEY || '',
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    competitors: [
        {
            name: 'Zeno',
            country: 'NL',
            website: 'https://zeno.legal',
            blog: 'https://zeno.legal/blog',
            twitter: 'zenolegal',
            changelog: 'https://zeno.legal/updates',
            pricing: 'https://zeno.legal/pricing'
        },
        {
            name: 'Harvey',
            country: 'UK',
            website: 'https://harvey.ai',
            blog: 'https://harvey.ai/blog',
            twitter: 'harvey_ai',
            changelog: 'https://harvey.ai/releases'
        },
        {
            name: 'Juro',
            country: 'UK',
            website: 'https://juro.com',
            blog: 'https://juro.com/blog',
            twitter: 'juroHQ',
            changelog: 'https://juro.com/changelog'
        },
        {
            name: 'Doctrine',
            country: 'FR',
            website: 'https://doctrine.fr',
            blog: 'https://doctrine.fr/blog',
            twitter: 'Doctrine_fr'
        },
        {
            name: 'LegalMike',
            country: 'NL',
            website: 'https://legalmike.ai',
            blog: 'https://legalmike.ai/news',
            twitter: 'legalmike_ai'
        },
        {
            name: 'Robin AI',
            country: 'UK',
            website: 'https://robinai.com',
            blog: 'https://robinai.com/blog',
            twitter: 'Robin_AI_'
        },
        {
            name: 'Luminance',
            country: 'UK',
            website: 'https://luminance.com',
            blog: 'https://luminance.com/blog',
            twitter: 'LuminanceTech'
        },
        {
            name: 'LegalFly',
            country: 'NL',
            website: 'https://legalfly.nl',
            blog: 'https://legalfly.nl/blog',
            twitter: 'legalfly_nl'
        },
        {
            name: 'LegalMind',
            country: 'NL',
            website: 'https://legalmind.io',
            blog: 'https://legalmind.io/blog',
            twitter: 'legalmind_io'
        },
        {
            name: 'Legaltree',
            country: 'NL',
            website: 'https://legaltree.nl',
            blog: 'https://legaltree.nl/blog',
            changelog: 'https://legaltree.nl/releases'
        },
        {
            name: 'Beele.ai',
            country: 'NL',
            website: 'https://beele.ai',
            blog: 'https://beele.ai/blog',
            twitter: 'beele_ai'
        },
        {
            name: 'LegalUp',
            country: 'NL',
            website: 'https://legalup.nl',
            blog: 'https://legalup.nl/blog',
            changelog: 'https://legalup.nl/updates'
        },
        {
            name: 'Precisely',
            country: 'SE',
            website: 'https://precisely.ai',
            blog: 'https://precisely.ai/blog',
            twitter: 'precisely_ai'
        },
        {
            name: 'LexMachina',
            country: 'DE',
            website: 'https://lexmachina.de',
            blog: 'https://lexmachina.de/blog'
        },
        {
            name: 'Legisway',
            country: 'BE',
            website: 'https://legisway.com',
            blog: 'https://legisway.com/blog',
            twitter: 'Legisway'
        },
        {
            name: 'Ironclad',
            country: 'US',
            website: 'https://ironcladapp.com',
            blog: 'https://ironcladapp.com/blog',
            twitter: 'IroncladHQ'
        },
        {
            name: 'LawGeex',
            country: 'IL',
            website: 'https://lawgeex.com',
            blog: 'https://lawgeex.com/blog',
            twitter: 'LawGeex'
        },
        {
            name: 'Conga',
            country: 'US',
            website: 'https://conga.com',
            blog: 'https://conga.com/blog',
            twitter: 'GetConga'
        },
        {
            name: 'Wolters Kluwer Legal',
            country: 'NL',
            website: 'https://wolterskluwer.com/legal',
            blog: 'https://wolterskluwer.com/news'
        },
        {
            name: 'Della',
            country: 'NL',
            website: 'https://della.ai',
            blog: 'https://della.ai/blog',
            twitter: 'della_ai'
        },
        {
            name: 'Litigate',
            country: 'ES',
            website: 'https://litigate.es',
            blog: 'https://litigate.es/blog',
            twitter: 'litigate_es'
        },
        {
            name: 'Everlaw',
            country: 'US',
            website: 'https://everlaw.com',
            blog: 'https://everlaw.com/blog',
            twitter: 'Everlaw'
        }
    ]
};

// Helper: Calculate time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        jaar: 31536000,
        maand: 2592000,
        week: 604800,
        dag: 86400,
        uur: 3600
    };
    
    for (let [name, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value);
        if (interval >= 1) {
            return interval === 1 ? `1 ${name} geleden` : `${interval} ${name}en geleden`;
        }
    }
    return 'Net nu';
}

// 1. NEWS API SCRAPER
async function scrapeNews() {
    console.log('📰 Scraping legal tech news...');
    if (!CONFIG.newsApiKey) {
        console.log('⚠️  No NewsAPI key configured');
        return [];
    }

    try {
        const keywords = 'legal tech OR legal AI OR legaltech OR Harvey AI OR Juro OR contract automation';
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: keywords,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 20,
                apiKey: CONFIG.newsApiKey
            }
        });

        const newsItems = response.data.articles.map(article => ({
            title: article.title,
            description: article.description || '',
            date: timeAgo(new Date(article.publishedAt)),
            source: article.source.name,
            url: article.url,
            type: 'news'
        }));

        console.log(`✅ Found ${newsItems.length} news articles`);
        return newsItems;
    } catch (error) {
        console.error('❌ News API error:', error.message);
        return [];
    }
}

// 2. TWITTER SCRAPER
async function scrapeTwitter(username) {
    if (!CONFIG.twitterBearerToken || !username) return [];

    try {
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.twitterBearerToken}`
            }
        });

        const userId = response.data.data.id;

        const tweets = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
            params: {
                max_results: 5,
                'tweet.fields': 'created_at'
            },
            headers: {
                'Authorization': `Bearer ${CONFIG.twitterBearerToken}`
            }
        });

        return tweets.data.data.map(tweet => ({
            title: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
            description: tweet.text,
            date: timeAgo(new Date(tweet.created_at)),
            source: 'Twitter',
            url: `https://twitter.com/${username}/status/${tweet.id}`,
            type: 'twitter'
        }));
    } catch (error) {
        console.log(`⚠️  Twitter error for @${username}:`, error.message);
        return [];
    }
}

// 3. BLOG RSS SCRAPER
async function scrapeBlog(blogUrl) {
    if (!blogUrl) return [];

    try {
        // Try RSS first
        const feed = await rssParser.parseURL(blogUrl + '/rss');
        return feed.items.slice(0, 3).map(item => ({
            title: item.title,
            description: item.contentSnippet || item.content?.substring(0, 200) || '',
            date: timeAgo(new Date(item.pubDate || item.isoDate)),
            source: 'Blog',
            url: item.link,
            type: 'blog'
        }));
    } catch (error) {
        // If RSS fails, try scraping HTML
        try {
            const response = await axios.get(blogUrl, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                }
            });
            const $ = cheerio.load(response.data);
            
            // Generic blog post selectors
            const posts = [];
            $('article, .post, .blog-post').slice(0, 3).each((i, elem) => {
                const title = $(elem).find('h1, h2, h3, .title').first().text().trim();
                const link = $(elem).find('a').first().attr('href');
                if (title && link) {
                    posts.push({
                        title: title,
                        description: $(elem).text().substring(0, 200).trim(),
                        date: 'Recent',
                        source: 'Blog',
                        url: link.startsWith('http') ? link : blogUrl + link,
                        type: 'blog'
                    });
                }
            });
            
            return posts;
        } catch (htmlError) {
            console.log(`⚠️  Could not scrape blog: ${blogUrl}`);
            return [];
        }
    }
}

// 4. CHANGELOG SCRAPER
async function scrapeChangelog(changelogUrl) {
    if (!changelogUrl) return [];

    try {
        const response = await axios.get(changelogUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        
        const updates = [];
        $('.changelog-item, .release, .update, article').slice(0, 3).each((i, elem) => {
            const title = $(elem).find('h2, h3, .title').first().text().trim();
            const description = $(elem).find('p, .description').first().text().trim();
            if (title) {
                updates.push({
                    title: title,
                    description: description.substring(0, 200),
                    date: 'Recent',
                    source: 'Changelog',
                    url: changelogUrl,
                    type: 'feature'
                });
            }
        });
        
        return updates;
    } catch (error) {
        console.log(`⚠️  Could not scrape changelog: ${changelogUrl}`);
        return [];
    }
}

// 5. PRICING PAGE SCRAPER
async function scrapePricing(pricingUrl) {
    if (!pricingUrl) return [];

    try {
        const response = await axios.get(pricingUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        
        // Look for pricing changes or announcements
        const pricing = [];
        $('.price, .pricing-card, .plan').each((i, elem) => {
            const planName = $(elem).find('.plan-name, h3, h4').first().text().trim();
            const price = $(elem).find('.amount, .price').first().text().trim();
            
            if (planName && price) {
                pricing.push({
                    title: `${planName}: ${price}`,
                    description: `Current pricing for ${planName}`,
                    date: 'Current',
                    source: 'Pricing',
                    url: pricingUrl,
                    type: 'pricing'
                });
            }
        });
        
        return pricing.slice(0, 2);
    } catch (error) {
        console.log(`⚠️  Could not scrape pricing: ${pricingUrl}`);
        return [];
    }
}

// 6. TECHCRUNCH SCRAPER FOR FUNDING NEWS
async function scrapeTechCrunchFunding() {
    console.log('💰 Scraping TechCrunch for funding news...');
    try {
        const response = await axios.get('https://techcrunch.com/tag/legal-tech/feed/', {
            timeout: 5000
        });
        
        const feed = await rssParser.parseString(response.data);
        const fundingNews = feed.items
            .filter(item => 
                item.title.toLowerCase().includes('raises') || 
                item.title.toLowerCase().includes('funding') ||
                item.title.toLowerCase().includes('series')
            )
            .slice(0, 5)
            .map(item => ({
                title: item.title,
                description: item.contentSnippet || '',
                date: timeAgo(new Date(item.pubDate)),
                source: 'TechCrunch',
                url: item.link,
                type: 'funding'
            }));

        console.log(`✅ Found ${fundingNews.length} funding news items`);
        return fundingNews;
    } catch (error) {
        console.log('⚠️  TechCrunch scraping failed:', error.message);
        return [];
    }
}

// MAIN SCRAPER
async function scrapeAll() {
    console.log('🚀 Starting competitive intelligence scraper...\n');
    
    const results = {
        lastUpdated: new Date().toISOString(),
        competitors: []
    };

    // Get general news first
    const generalNews = await scrapeNews();
    const fundingNews = await scrapeTechCrunchFunding();

    // Scrape each competitor
    for (const competitor of CONFIG.competitors) {
        console.log(`\n📊 Scraping ${competitor.name}...`);
        
        const competitorData = {
            name: competitor.name,
            country: competitor.country,
            website: competitor.website,
            liveUpdates: {
                twitter: [],
                blog: [],
                features: [],
                pricing: [],
                news: []
            },
            roadmap: []
        };

        // Twitter
        if (competitor.twitter) {
            const tweets = await scrapeTwitter(competitor.twitter);
            competitorData.liveUpdates.twitter = tweets.slice(0, 2);
            console.log(`  🐦 Twitter: ${tweets.length} tweets`);
        }

        // Blog
        if (competitor.blog) {
            const blogPosts = await scrapeBlog(competitor.blog);
            competitorData.liveUpdates.blog = blogPosts;
            console.log(`  📝 Blog: ${blogPosts.length} posts`);
        }

        // Changelog
        if (competitor.changelog) {
            const changelog = await scrapeChangelog(competitor.changelog);
            competitorData.liveUpdates.features = changelog;
            console.log(`  ✨ Features: ${changelog.length} updates`);
        }

        // Pricing
        if (competitor.pricing) {
            const pricing = await scrapePricing(competitor.pricing);
            competitorData.liveUpdates.pricing = pricing;
            console.log(`  💰 Pricing: ${pricing.length} items`);
        }

        // Filter relevant news for this competitor
        const relevantNews = [...generalNews, ...fundingNews].filter(item =>
            item.title.toLowerCase().includes(competitor.name.toLowerCase()) ||
            item.description.toLowerCase().includes(competitor.name.toLowerCase())
        );
        competitorData.liveUpdates.news = relevantNews.slice(0, 3);

        results.competitors.push(competitorData);
        
        // Be nice to servers
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save results
    const dataPath = path.join(__dirname, '../data/competitors.json');
    fs.writeFileSync(dataPath, JSON.stringify(results, null, 2));
    
    console.log('\n✅ Scraping complete!');
    console.log(`📁 Data saved to: ${dataPath}`);
    console.log(`🕐 Last updated: ${new Date().toLocaleString('nl-NL')}`);
    
    return results;
}

// Run scraper
if (require.main === module) {
    scrapeAll().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { scrapeAll };
