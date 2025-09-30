/**
 * Mass Page Generator for Muslim Google SEO
 * Generates 20k+ SEO-optimized pages for global Islamic business dominance
 */

const fs = require('fs');
const path = require('path');
const MuslimGoogleSEO = require('./muslim-google-seo-system');

class PageGenerator {
  constructor() {
    this.seoSystem = new MuslimGoogleSEO();
    this.outputDir = './generated-pages';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateAllPages() {
    console.log('🚀 Starting Muslim Google SEO page generation...');
    
    const allPages = this.seoSystem.generateAllPages();
    console.log(`📊 Total pages to generate: ${allPages.length}`);
    
    let generated = 0;
    const batchSize = 100;
    
    for (let i = 0; i < allPages.length; i += batchSize) {
      const batch = allPages.slice(i, i + batchSize);
      await this.generateBatch(batch);
      generated += batch.length;
      console.log(`✅ Generated ${generated}/${allPages.length} pages`);
    }
    
    await this.generateSitemaps();
    await this.generateRobotsTxt();
    console.log('🎉 All pages generated successfully!');
  }

  async generateBatch(pages) {
    const promises = pages.map(page => this.generatePage(page));
    await Promise.all(promises);
  }

  async generatePage(pageData) {
    const html = this.createPageHTML(pageData);
    const filePath = this.getFilePath(pageData.url);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, html);
  }

  createPageHTML(pageData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.title}</title>
    <meta name="description" content="${pageData.metaDescription}">
    <meta name="keywords" content="${pageData.keywords.join(', ')}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://ummah-connects.com${pageData.url}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${pageData.title}">
    <meta property="og:description" content="${pageData.metaDescription}">
    <meta property="og:url" content="https://ummah-connects.com${pageData.url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Ummah Connects">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageData.title}">
    <meta name="twitter:description" content="${pageData.metaDescription}">
    
    <!-- Schema.org JSON-LD -->
    ${pageData.schema}
    
    <!-- CSS -->
    <link rel="stylesheet" href="/css/seo-pages.css">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="/" class="nav-logo">Ummah Connects</a>
            <div class="nav-menu">
                <a href="/businesses" class="nav-link">Businesses</a>
                <a href="/mosques" class="nav-link">Mosques</a>
                <a href="/community" class="nav-link">Community</a>
                <a href="/prayer-times" class="nav-link">Prayer Times</a>
            </div>
        </div>
    </nav>

    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
            ${pageData.breadcrumbs.map((crumb, index) => 
              `<li class="breadcrumb-item">
                ${index === pageData.breadcrumbs.length - 1 
                  ? `<span class="breadcrumb-current">${crumb.text}</span>`
                  : `<a href="${crumb.url}" class="breadcrumb-link">${crumb.text}</a>`
                }
              </li>`
            ).join('')}
        </ol>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        ${pageData.content}
    </main>

    <!-- Internal Links Section -->
    <section class="internal-links">
        <h2>Related Pages</h2>
        <div class="internal-links-grid">
            ${pageData.internalLinks.map(link => 
              `<a href="${link.url}" class="internal-link">${link.text}</a>`
            ).join('')}
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-section">
                <h3>Ummah Connects</h3>
                <p>Connecting the Muslim community worldwide</p>
            </div>
            <div class="footer-section">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="/businesses">Businesses</a></li>
                    <li><a href="/mosques">Mosques</a></li>
                    <li><a href="/community">Community</a></li>
                    <li><a href="/prayer-times">Prayer Times</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Categories</h3>
                <ul>
                    <li><a href="/businesses/halal-restaurants">Halal Restaurants</a></li>
                    <li><a href="/businesses/islamic-clothing">Islamic Clothing</a></li>
                    <li><a href="/businesses/islamic-finance">Islamic Finance</a></li>
                    <li><a href="/businesses/islamic-education">Islamic Education</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Ummah Connects. All rights reserved.</p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="/js/seo-pages.js"></script>
    
    <!-- Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    </script>
</body>
</html>`;
  }

  getFilePath(url) {
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const pathParts = cleanUrl.split('/');
    
    if (pathParts.length === 1 && pathParts[0] === '') {
      return path.join(this.outputDir, 'index.html');
    }
    
    const fileName = pathParts[pathParts.length - 1] || 'index';
    const dirPath = pathParts.slice(0, -1).join('/');
    
    return path.join(this.outputDir, dirPath, `${fileName}.html`);
  }

  async generateSitemaps() {
    console.log('🗺️ Generating sitemaps...');
    
    const allPages = this.seoSystem.generateAllPages();
    const sitemapUrls = allPages.map(page => ({
      loc: `https://ummah-connects.com${page.url}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: this.getPriority(page.url)
    }));

    // Generate main sitemap
    const mainSitemap = this.generateSitemapXML(sitemapUrls);
    fs.writeFileSync(path.join(this.outputDir, 'sitemap.xml'), mainSitemap);

    // Generate country-specific sitemaps
    await this.generateCountrySitemaps();
    
    // Generate category-specific sitemaps
    await this.generateCategorySitemaps();
    
    // Generate sitemap index
    await this.generateSitemapIndex();
  }

  generateSitemapXML(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  }

  async generateCountrySitemaps() {
    const countries = this.seoSystem.countries;
    
    for (const country of countries) {
      const countryPages = this.seoSystem.generateAllPages()
        .filter(page => page.url.startsWith(`/${country}`));
      
      const sitemapUrls = countryPages.map(page => ({
        loc: `https://ummah-connects.com${page.url}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8'
      }));

      const sitemap = this.generateSitemapXML(sitemapUrls);
      const sitemapPath = path.join(this.outputDir, `sitemap-${country}.xml`);
      fs.writeFileSync(sitemapPath, sitemap);
    }
  }

  async generateCategorySitemaps() {
    const categories = Object.keys(this.seoSystem.categories);
    
    for (const category of categories) {
      const categoryPages = this.seoSystem.generateAllPages()
        .filter(page => page.url.includes(`/${category}`));
      
      const sitemapUrls = categoryPages.map(page => ({
        loc: `https://ummah-connects.com${page.url}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8'
      }));

      const sitemap = this.generateSitemapXML(sitemapUrls);
      const sitemapPath = path.join(this.outputDir, `sitemap-${category}.xml`);
      fs.writeFileSync(sitemapPath, sitemap);
    }
  }

  async generateSitemapIndex() {
    const sitemaps = [
      { loc: 'https://ummah-connects.com/sitemap.xml', lastmod: new Date().toISOString().split('T')[0] }
    ];

    // Add country sitemaps
    for (const country of this.seoSystem.countries) {
      sitemaps.push({
        loc: `https://ummah-connects.com/sitemap-${country}.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      });
    }

    // Add category sitemaps
    for (const category of Object.keys(this.seoSystem.categories)) {
      sitemaps.push({
        loc: `https://ummah-connects.com/sitemap-${category}.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      });
    }

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    fs.writeFileSync(path.join(this.outputDir, 'sitemap-index.xml'), sitemapIndex);
  }

  async generateRobotsTxt() {
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://ummah-connects.com/sitemap-index.xml

# Important pages for SEO
Allow: /businesses/
Allow: /mosques/
Allow: /community/
Allow: /prayer-times/
Allow: /ramadan/
Allow: /hajj-umrah/

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/
Disallow: /auth/
Disallow: /login/
Disallow: /register/
Disallow: /user/
Disallow: /profile/
Disallow: /settings/

# Disallow temporary and development files
Disallow: /tmp/
Disallow: /temp/
Disallow: /.env
Disallow: /config/
Disallow: /logs/
Disallow: /backup/
Disallow: /test/

# Allow specific file types for better SEO
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.webp
Allow: /*.ico

# Crawl delay for respectful crawling
Crawl-delay: 1

# Host directive for canonical domain
Host: https://ummah-connects.com`;

    fs.writeFileSync(path.join(this.outputDir, 'robots.txt'), robotsTxt);
  }

  getPriority(url) {
    if (url === '/') return '1.0';
    if (url.includes('/businesses') || url.includes('/mosques')) return '0.9';
    if (url.includes('/community')) return '0.8';
    if (url.includes('/prayer-times')) return '0.9';
    return '0.7';
  }

  // Generate performance-optimized pages
  async generateOptimizedPages() {
    console.log('⚡ Generating performance-optimized pages...');
    
    const allPages = this.seoSystem.generateAllPages();
    const optimizedPages = allPages.map(page => this.optimizePage(page));
    
    // Generate critical CSS
    await this.generateCriticalCSS();
    
    // Generate service worker
    await this.generateServiceWorker();
    
    // Generate manifest
    await this.generateManifest();
    
    return optimizedPages;
  }

  optimizePage(page) {
    return {
      ...page,
      // Add performance optimizations
      criticalCSS: this.extractCriticalCSS(),
      preloadResources: this.getPreloadResources(),
      lazyLoadImages: true,
      minifyHTML: true,
      compressAssets: true
    };
  }

  extractCriticalCSS() {
    return `
      .navbar { display: flex; justify-content: space-between; align-items: center; }
      .main-content { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .business-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
      .footer { background: #333; color: white; padding: 40px 0; }
    `;
  }

  getPreloadResources() {
    return [
      '/fonts/inter-var.woff2',
      '/css/critical.css',
      '/js/main.js'
    ];
  }

  async generateCriticalCSS() {
    const criticalCSS = this.extractCriticalCSS();
    fs.writeFileSync(path.join(this.outputDir, 'css', 'critical.css'), criticalCSS);
  }

  async generateServiceWorker() {
    const serviceWorker = `
      const CACHE_NAME = 'ummah-connects-v1';
      const urlsToCache = [
        '/',
        '/css/main.css',
        '/js/main.js',
        '/fonts/inter-var.woff2'
      ];

      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
        );
      });

      self.addEventListener('fetch', event => {
        event.respondWith(
          caches.match(event.request)
            .then(response => response || fetch(event.request))
        );
      });
    `;
    
    fs.writeFileSync(path.join(this.outputDir, 'sw.js'), serviceWorker);
  }

  async generateManifest() {
    const manifest = {
      "name": "Ummah Connects",
      "short_name": "Ummah Connects",
      "description": "Connecting the Muslim community worldwide",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#2E7D32",
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ]
    };
    
    fs.writeFileSync(path.join(this.outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }
}

module.exports = PageGenerator;
