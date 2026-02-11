# 🎯 Competitive Intelligence Dashboard - Automatisch Systeem

**100% Gratis | Automatisch elke 3 uur | Geen laptop nodig**

Dit systeem scraped automatisch data van 22+ legal tech concurrenten via:
- 📰 NewsAPI (legal tech nieuws)
- 🐦 Twitter (social media updates)
- 📝 Company blogs (partnerships, funding, announcements)
- ✨ Changelog pages (nieuwe features)
- 💰 Pricing pages (prijswijzigingen)
- 📡 TechCrunch RSS (funding news)

## 🚀 Quick Start (15 minuten setup)

### Stap 1: GitHub Repository Setup

1. **Fork of download deze repository**
   - Download alle files naar je computer
   - Of fork deze repo naar je eigen GitHub account

2. **Maak een nieuwe GitHub repository**
   - Ga naar github.com
   - Klik rechtsboven op "+" → "New repository"
   - Naam: `competitive-intel-dashboard` (of wat je wilt)
   - Kies: **Public** (voor gratis GitHub Pages)
   - Klik "Create repository"

3. **Upload alle files naar GitHub**
   
   **Optie A: Via GitHub website (makkelijkst)**
   - Klik in je nieuwe repo op "uploading an existing file"
   - Sleep ALLE files uit deze folder naar GitHub
   - Klik "Commit changes"

   **Optie B: Via Git command line**
   ```bash
   cd competitive-intel-auto
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/JOUW-USERNAME/competitive-intel-dashboard.git
   git push -u origin main
   ```

### Stap 2: API Keys Configureren

1. **NewsAPI Key** (VERPLICHT - anders geen nieuws)
   - Ga naar: https://newsapi.org/register
   - Maak gratis account (100 requests/dag)
   - Kopieer je API key (bijv: `a1b2c3d4e5f6g7h8...`)

2. **Twitter API** (OPTIONEEL - maar aanbevolen)
   - Ga naar: https://developer.twitter.com/en/portal/petition/essential/basic-info
   - Log in met Twitter account (maak er een als je die niet hebt)
   - Vraag "Free Tier" access aan
   - Na approval: kopieer je Bearer Token

3. **API Keys toevoegen aan GitHub Secrets**
   - Ga naar je GitHub repository
   - Klik op "Settings" (bovenaan)
   - Klik in sidebar op "Secrets and variables" → "Actions"
   - Klik "New repository secret"
   
   **Voeg toe:**
   - Name: `NEWS_API_KEY`
   - Secret: [je NewsAPI key]
   - Klik "Add secret"
   
   **Als je Twitter hebt:**
   - Name: `TWITTER_BEARER_TOKEN`
   - Secret: [je Twitter Bearer token]
   - Klik "Add secret"

### Stap 3: GitHub Actions Activeren

1. **Ga naar "Actions" tab** (bovenaan je repo)
2. **Klik "I understand my workflows, go ahead and enable them"**
3. **Test de scraper handmatig:**
   - Klik op "Scrape Competitor Data" in de lijst
   - Klik rechts op "Run workflow" → "Run workflow"
   - Wacht 2-3 minuten
   - ✅ Als het groen wordt: SUCCES!
   - ❌ Als het rood wordt: check de error logs

### Stap 4: GitHub Pages Activeren

1. **Ga naar "Settings"** (bovenaan je repo)
2. **Klik in sidebar op "Pages"**
3. **Onder "Source":**
   - Selecteer: "Deploy from a branch"
   - Branch: **main** (of master)
   - Folder: **/ (root)**
4. **Klik "Save"**
5. **Wacht 2-3 minuten**
6. **Refresh de pagina** → je ziet een URL bovenaan:
   - `https://JOUW-USERNAME.github.io/competitive-intel-dashboard/`

### Stap 5: Dashboard Openen! 🎉

1. **Ga naar je GitHub Pages URL**
2. **Bookmark de pagina**
3. **KLAAR!** Dashboard update nu automatisch elke 3 uur

---

## ⚙️ Hoe het werkt

```
ELKE 3 UUR:
┌─────────────────────────────────────┐
│  GitHub Actions (gratis cloud)     │
│  1. Start scraping script           │
│  2. Scraped 22 bronnen:             │
│     - NewsAPI                        │
│     - Twitter API                    │
│     - Company blogs (RSS)           │
│     - Changelog pages               │
│     - Pricing pages                 │
│     - TechCrunch RSS                │
│  3. Opslaan in data/competitors.json│
│  4. Commit naar GitHub               │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  GitHub Pages (gratis hosting)      │
│  - Dashboard laadt JSON             │
│  - Toont nieuwste data              │
│  - 100% automatisch!                │
└─────────────────────────────────────┘
```

---

## 📊 Data Bronnen per Concurrent

| Concurrent | Twitter | Blog | Changelog | Pricing | News |
|------------|---------|------|-----------|---------|------|
| Zeno | ✅ | ✅ | ✅ | ✅ | ✅ |
| Harvey | ✅ | ✅ | ✅ | - | ✅ |
| Juro | ✅ | ✅ | ✅ | - | ✅ |
| Doctrine | ✅ | ✅ | - | - | ✅ |
| ... (22 totaal) | | | | | |

**Totaal: 100+ data points elke 3 uur!**

---

## 🔧 Aanpassen & Configureren

### Meer Concurrenten Toevoegen

Edit `scripts/scrape.js` → zoek `CONFIG.competitors` array:

```javascript
{
    name: 'Nieuwe Competitor',
    country: 'NL',
    website: 'https://example.com',
    blog: 'https://example.com/blog',  // optioneel
    twitter: 'twitterhandle',            // optioneel
    changelog: 'https://example.com/updates', // optioneel
    pricing: 'https://example.com/pricing'    // optioneel
}
```

Commit & push → volgende run includeert deze!

### Scraping Frequentie Aanpassen

Edit `.github/workflows/scrape.yml` → regel 5:

```yaml
- cron: '0 */3 * * *'  # Elke 3 uur
- cron: '0 */1 * * *'  # Elke 1 uur
- cron: '0 */6 * * *'  # Elke 6 uur
- cron: '0 9 * * *'    # Dagelijks om 9:00
```

**LET OP:** NewsAPI free tier = 100 requests/dag. Met 22 concurrenten:
- Elke 3 uur = 8 runs/dag = ~60 requests ✅
- Elke 1 uur = 24 runs/dag = ~180 requests ❌ Te veel!

---

## 🐛 Troubleshooting

### ❌ "Actions workflow failed"

**Check de logs:**
1. Ga naar "Actions" tab
2. Klik op de gefaalde run
3. Klik op "scrape" job
4. Bekijk error messages

**Meest voorkomende errors:**

**1. "News API error: 401"**
- Je NewsAPI key is fout of niet geconfigureerd
- Check GitHub Secrets → `NEWS_API_KEY`

**2. "Twitter error: 403"**
- Twitter Bearer Token is fout
- Of Twitter API is niet approved
- Check GitHub Secrets → `TWITTER_BEARER_TOKEN`

**3. "Permission denied"**
- GitHub Actions heeft geen write permissions
- Ga naar Settings → Actions → General
- Scroll naar "Workflow permissions"
- Selecteer "Read and write permissions"
- Save!

### 🔍 Dashboard toont geen data

**Check:**
1. Is de scraper succesvol gedraaid? (groen vinkje in Actions)
2. Bestaat `data/competitors.json` in je repo?
3. Open browser console (F12) → zie je errors?
4. Is GitHub Pages actief? (Settings → Pages)

### 🚫 "Some websites block scraping"

Sommige sites blokkeren scrapers. Dat is normaal! De scraper:
- ✅ Probeert RSS feeds eerst (meestal niet geblokkeerd)
- ✅ Gebruikt user-agent headers
- ⏱️ Heeft 1 sec delay tussen requests
- ✅ Catcht errors gracefully (1 fail = rest werkt nog)

**Als een site altijd failt:**
- Verwijder die URL uit `CONFIG.competitors`
- Of comment uit: `// blog: 'https://...',`

---

## 💡 Tips & Tricks

### Handmatige Run Triggeren

Je hoeft NIET 3 uur te wachten!

1. Ga naar "Actions" tab
2. Klik "Scrape Competitor Data"
3. Klik rechts: "Run workflow" → "Run workflow"
4. Wacht 2-3 min → nieuwe data!

### Data Downloaden

Alle data is in: `data/competitors.json`
- Open in GitHub
- Klik "Raw"
- Save as JSON
- Analyseer in Excel/Python/etc.

### Dashboard Lokaal Testen

```bash
cd competitive-intel-auto
python3 -m http.server 8000
# Open: http://localhost:8000
```

### RSS Feeds Toevoegen

Voor blogs zonder RSS, probeer:
- `/feed`
- `/rss`
- `/blog/feed`
- `/atom.xml`

Test in browser: plak URL + `/feed`

---

## 📈 Roadmap & Ideeën

**v2.0 mogelijkheden:**
- [ ] Email alerts bij belangrijke updates
- [ ] Slack/Discord webhook notificaties
- [ ] Export naar CSV/Excel
- [ ] Trending analysis (wat is hot deze week?)
- [ ] Sentiment analysis op updates
- [ ] Product Hunt scraping
- [ ] Crunchbase funding data
- [ ] Historical data charts
- [ ] AI summary van updates (via Claude API!)

---

## ❓ FAQ

**Q: Kost dit echt niks?**
A: 100% gratis! GitHub Actions = 2000 min/maand gratis. Scraper draait ~2 min per run = 240 runs/maand mogelijk. Wij gebruiken 8/dag × 30 = 240/maand. Perfect!

**Q: Kan iedereen mijn data zien?**
A: Als je repo public is: ja, iedereen kan de JSON zien. Maar het is publieke competitor data, niet gevoelig. Wil je het privé? → betaal $4/maand voor GitHub Pro → private repo.

**Q: Waarom geen LinkedIn?**
A: LinkedIn blokkeert scraping agressief. Alternatieven:
- Betaalde tools: Phantombuster (~€50/maand)
- Handmatig: Check 1x/week LinkedIn, voeg updates toe
- Workaround: Veel LinkedIn posts komen ook op Twitter/blogs!

**Q: De scraper mist sommige updates**
A: Dat klopt! Dit is "best effort" scraping:
- Niet elke site heeft RSS
- Sommige sites blokkeren scraping
- Changelog/pricing scraping is "fuzzy"
→ Zie dit als 80% automated, 20% manual check

**Q: Kan ik Claude API gebruiken voor betere scraping?**
A: JA! Goed idee:
```javascript
// In scrape.js, gebruik Claude API om blog posts te analyseren
const summary = await claudeAPI.summarize(blogPost);
```

---

## 🤝 Credits

Gebouwd voor **Andri.ai** door Claude (Anthropic)
- Legal Tech Competitive Intelligence
- Automated competitor monitoring
- 100% open source

**Vragen? Issues?**
Open een GitHub Issue of DM op Twitter!

---

## 📄 Licentie

MIT License - gebruik vrij, pas aan, deel!

**Let op:** Respecteer de robots.txt en Terms of Service van websites die je scraped. Deze tool is voor competitor research, niet voor spam of misbruik.

---

**🎉 Succes met je Competitive Intelligence Dashboard!**

Elke 3 uur verse data over 22 concurrenten. Volledig automatisch. Gratis. 🚀
