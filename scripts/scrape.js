// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');
const { chromium } = require('playwright');
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

// 3. BLOG RSS SCRAPER WITH PLAYWRIGHT FALLBACK
async function scrapeBlog(blogUrl, browser) {
    if (!blogUrl) return [];

    // Phase 1: Try multiple RSS variants
    const rssVariants = ['/rss', '/feed', '/rss.xml', '/atom.xml', '/blog/feed', '/index.xml'];
    for (const variant of rssVariants) {
        try {
            const feed = await rssParser.parseURL(blogUrl + variant);
            return feed.items.slice(0, 3).map(item => ({
                title: item.title,
                description: item.contentSnippet?.substring(0, 200) || item.content?.substring(0, 200) || '',
                date: timeAgo(new Date(item.pubDate || item.isoDate)),
                source: 'Blog',
                url: item.link,
                type: 'blog'
            }));
        } catch (e) {
            continue;
        }
    }

    // Phase 2: Playwright fallback
    const page = await browser.newPage();
    try {
        await page.goto(blogUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);

        const posts = await page.evaluate(() => {
            const selectors = [
                'article[class*="post"]', '[class*="BlogPost"]', '[class*="ArticleCard"]',
                'article', '.post', '.blog-post'
            ];
            let foundPosts = [];
            for (const sel of selectors) {
                const elements = document.querySelectorAll(sel);
                if (elements.length >= 2) {
                    foundPosts = Array.from(elements).slice(0, 3);
                    break;
                }
            }
            return foundPosts.map(post => {
                const title = post.querySelector('h1, h2, h3, [class*="title"]')?.textContent?.trim() || '';
                const link = post.querySelector('a')?.href || '';
                const desc = post.querySelector('p')?.textContent?.trim() || '';
                return { title, link, description: desc };
            }).filter(p => p.title && p.link);
        });

        return posts.map(p => ({
            title: p.title,
            description: p.description.substring(0, 200),
            date: 'Recent',
            source: 'Blog',
            url: p.link,
            type: 'blog'
        }));
    } catch (error) {
        console.log(`⚠️  Blog scraping failed: ${blogUrl}`);
        return [];
    } finally {
        await page.close();
    }
}

// 4. CHANGELOG SCRAPER WITH PLAYWRIGHT
async function scrapeChangelog(changelogUrl, browser) {
    if (!changelogUrl) return [];

    const page = await browser.newPage();
    try {
        await page.goto(changelogUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1500);

        const updates = await page.evaluate(() => {
            const selectors = [
                '[data-changelog-item]', '[class*="ChangelogItem"]', '[class*="ReleaseNote"]',
                '.hw-item', '.changelog-item', '.release', 'article'
            ];
            let items = [];
            for (const sel of selectors) {
                const elements = document.querySelectorAll(sel);
                if (elements.length >= 2) {
                    items = Array.from(elements).slice(0, 3);
                    break;
                }
            }
            return items.map(item => {
                const title = item.querySelector('h1, h2, h3, h4, [class*="title"]')?.textContent?.trim() || '';
                const desc = item.querySelector('p, [class*="description"]')?.textContent?.trim() || '';
                return { title, description: desc };
            }).filter(u => u.title);
        });

        return updates.map(u => ({
            title: u.title,
            description: u.description.substring(0, 200),
            date: 'Recent',
            source: 'Changelog',
            url: changelogUrl,
            type: 'feature'
        }));
    } catch (error) {
        console.log(`⚠️  Changelog scraping failed: ${changelogUrl}`);
        return [];
    } finally {
        await page.close();
    }
}

// 5. PRICING PAGE SCRAPER WITH PLAYWRIGHT
async function scrapePricing(pricingUrl, browser) {
    if (!pricingUrl) return [];

    const page = await browser.newPage();
    try {
        await page.goto(pricingUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        await page.waitForTimeout(2000);

        const pricingData = await page.evaluate(() => {
            const selectors = [
                '[data-testid*="pricing"]', '[class*="PricingCard"]', '[class*="PriceCard"]',
                '.pricing-card', '.plan'
            ];
            let cards = [];
            for (const sel of selectors) {
                const elements = document.querySelectorAll(sel);
                if (elements.length >= 1) {
                    cards = Array.from(elements).slice(0, 3);
                    break;
                }
            }
            return cards.map(card => {
                const plan = card.querySelector('[class*="plan-name"], h2, h3')?.textContent?.trim() || '';
                const price = card.querySelector('[class*="price"], [class*="Price"]')?.textContent?.trim() || '';
                const features = Array.from(card.querySelectorAll('li')).map(li => li.textContent.trim()).slice(0, 3);
                return { plan, price, features };
            }).filter(p => p.plan && p.price);
        });

        return pricingData.map(p => ({
            title: `${p.plan}: ${p.price}`,
            description: p.features.join(', ') || `Pricing for ${p.plan}`,
            date: 'Current',
            source: 'Pricing',
            url: pricingUrl,
            type: 'pricing'
        }));
    } catch (error) {
        console.log(`⚠️  Pricing scraping failed: ${pricingUrl}`);
        return [];
    } finally {
        await page.close();
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

// MAIN SCRAPER WITH PLAYWRIGHT
async function scrapeAll() {
    console.log('🚀 Starting Playwright-powered scraper...\n');

    // Launch browser ONCE for all competitors
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--disable-gpu'
        ]
    });

    try {
        const results = {
            lastUpdated: new Date().toISOString(),
            competitors: []
        };

        // Get general news (no Playwright needed)
        const generalNews = await scrapeNews();
        const fundingNews = await scrapeTechCrunchFunding();

        // Scrape competitors with shared browser
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

            // Twitter (API - no browser)
            if (competitor.twitter) {
                const tweets = await scrapeTwitter(competitor.twitter);
                competitorData.liveUpdates.twitter = tweets.slice(0, 2);
                console.log(`  🐦 Twitter: ${tweets.length} tweets`);
            }

            // Blog (RSS first, Playwright fallback)
            if (competitor.blog) {
                const blogPosts = await scrapeBlog(competitor.blog, browser);
                competitorData.liveUpdates.blog = blogPosts;
                console.log(`  📝 Blog: ${blogPosts.length} posts`);
            }

            // Changelog (Playwright)
            if (competitor.changelog) {
                const changelog = await scrapeChangelog(competitor.changelog, browser);
                competitorData.liveUpdates.features = changelog;
                console.log(`  ✨ Features: ${changelog.length} updates`);
            }

            // Pricing (Playwright)
            if (competitor.pricing) {
                const pricing = await scrapePricing(competitor.pricing, browser);
                competitorData.liveUpdates.pricing = pricing;
                console.log(`  💰 Pricing: ${pricing.length} items`);
            }

            // Filter relevant news
            const relevantNews = [...generalNews, ...fundingNews].filter(item =>
                item.title.toLowerCase().includes(competitor.name.toLowerCase()) ||
                item.description.toLowerCase().includes(competitor.name.toLowerCase())
            );
            competitorData.liveUpdates.news = relevantNews.slice(0, 3);

            results.competitors.push(competitorData);

            // Delay between competitors (be nice)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Save results
        const dataPath = path.join(__dirname, '../data/competitors.json');
        fs.writeFileSync(dataPath, JSON.stringify(results, null, 2));

        console.log('\n✅ Scraping complete!');
        console.log(`📁 Data saved to: ${dataPath}`);
        console.log(`🕐 Last updated: ${new Date().toLocaleString('nl-NL')}`);

        return results;

    } finally {
        await browser.close();
    }
}

// Run scraper
if (require.main === module) {
    scrapeAll().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { scrapeAll };
