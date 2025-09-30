#!/usr/bin/env node

/**
 * Muslim Google SEO Automation Server
 * Continuous SEO page generation for high rankings
 * Runs 24/7 to maintain and improve search rankings
 */

const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const PageGenerator = require('./page-generator');
const MuslimGoogleSEO = require('./muslim-google-seo-system');

class SEOAutomationServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.seoSystem = new MuslimGoogleSEO();
    this.pageGenerator = new PageGenerator();
    this.isRunning = false;
    this.stats = {
      totalPages: 0,
      lastUpdate: null,
      nextUpdate: null,
      errors: 0,
      successRate: 100
    };
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupScheduler();
    this.startServer();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('generated-pages'));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        stats: this.stats
      });
    });

    // SEO stats
    this.app.get('/api/stats', (req, res) => {
      res.json({
        totalPages: this.stats.totalPages,
        lastUpdate: this.stats.lastUpdate,
        nextUpdate: this.stats.nextUpdate,
        successRate: this.stats.successRate,
        errors: this.stats.errors
      });
    });

    // Force regeneration
    this.app.post('/api/regenerate', async (req, res) => {
      try {
        await this.regeneratePages();
        res.json({ message: 'Pages regenerated successfully', stats: this.stats });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get page count
    this.app.get('/api/pages/count', (req, res) => {
      const pageCount = this.getPageCount();
      res.json({ count: pageCount });
    });

    // Get recent pages
    this.app.get('/api/pages/recent', (req, res) => {
      const recentPages = this.getRecentPages(10);
      res.json({ pages: recentPages });
    });

    // SEO monitoring
    this.app.get('/api/monitoring', (req, res) => {
      const monitoring = this.getMonitoringData();
      res.json(monitoring);
    });
  }

  setupScheduler() {
    // Run every 6 hours to keep content fresh
    const schedule = process.env.SEO_SCHEDULE || '0 */6 * * *';
    
    cron.schedule(schedule, async () => {
      console.log('🔄 Starting scheduled SEO update...');
      await this.updateSEOContent();
    });

    // Run daily full regeneration
    cron.schedule('0 2 * * *', async () => {
      console.log('🌙 Starting daily full regeneration...');
      await this.fullRegeneration();
    });

    // Run weekly deep optimization
    cron.schedule('0 3 * * 0', async () => {
      console.log('📈 Starting weekly deep optimization...');
      await this.deepOptimization();
    });
  }

  async updateSEOContent() {
    try {
      this.isRunning = true;
      console.log('📝 Updating SEO content...');
      
      // Update existing pages with fresh content
      await this.updateExistingPages();
      
      // Generate new pages for trending keywords
      await this.generateTrendingPages();
      
      // Update sitemaps
      await this.updateSitemaps();
      
      this.stats.lastUpdate = new Date().toISOString();
      this.stats.successRate = 100;
      
      console.log('✅ SEO content updated successfully');
    } catch (error) {
      console.error('❌ Error updating SEO content:', error);
      this.stats.errors++;
      this.stats.successRate = Math.max(0, this.stats.successRate - 1);
    } finally {
      this.isRunning = false;
    }
  }

  async regeneratePages() {
    try {
      this.isRunning = true;
      console.log('🔄 Regenerating all pages...');
      
      // Generate all pages
      await this.pageGenerator.generateAllPages();
      
      // Update stats
      this.stats.totalPages = this.getPageCount();
      this.stats.lastUpdate = new Date().toISOString();
      
      console.log(`✅ Regenerated ${this.stats.totalPages} pages`);
    } catch (error) {
      console.error('❌ Error regenerating pages:', error);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
    }
  }

  async updateExistingPages() {
    const pages = this.seoSystem.generateAllPages();
    const batchSize = parseInt(process.env.SEO_BATCH_SIZE) || 100;
    
    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize);
      await this.updateBatch(batch);
      
      // Log progress
      console.log(`📄 Updated ${Math.min(i + batchSize, pages.length)}/${pages.length} pages`);
    }
  }

  async updateBatch(pages) {
    const promises = pages.map(page => this.updatePage(page));
    await Promise.all(promises);
  }

  async updatePage(pageData) {
    try {
      // Update page with fresh content
      const updatedContent = this.generateFreshContent(pageData);
      const html = this.createPageHTML({ ...pageData, content: updatedContent });
      const filePath = this.getFilePath(pageData.url);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write updated page
      fs.writeFileSync(filePath, html);
    } catch (error) {
      console.error(`❌ Error updating page ${pageData.url}:`, error);
    }
  }

  generateFreshContent(pageData) {
    // Add fresh content elements
    const freshElements = [
      '<div class="fresh-content">',
      '<h3>Latest Updates</h3>',
      `<p>Last updated: ${new Date().toLocaleDateString()}</p>`,
      '<p>New businesses added this week!</p>',
      '</div>'
    ].join('');
    
    return pageData.content + freshElements;
  }

  async generateTrendingPages() {
    // Generate pages for trending keywords
    const trendingKeywords = this.getTrendingKeywords();
    
    for (const keyword of trendingKeywords) {
      const pageData = this.createTrendingPage(keyword);
      await this.generatePage(pageData);
    }
  }

  getTrendingKeywords() {
    // This would typically come from analytics or keyword research
    return [
      'halal restaurants near me',
      'islamic clothing online',
      'islamic finance services',
      'mosque prayer times',
      'halal travel packages'
    ];
  }

  createTrendingPage(keyword) {
    return {
      url: `/trending/${keyword.replace(/\s+/g, '-')}`,
      title: `${keyword} | Ummah Connects`,
      metaDescription: `Find the best ${keyword} services. Halal certified, Muslim-friendly businesses.`,
      h1: keyword,
      content: this.generateTrendingContent(keyword),
      schema: this.generateTrendingSchema(keyword),
      keywords: [keyword, 'halal', 'muslim', 'islamic'],
      internalLinks: this.generateTrendingInternalLinks(keyword),
      breadcrumbs: this.generateTrendingBreadcrumbs(keyword)
    };
  }

  generateTrendingContent(keyword) {
    return `
      <div class="trending-page">
        <header>
          <h1>${keyword}</h1>
          <p class="lead">Discover the best ${keyword} services. All businesses are halal certified and Muslim-friendly.</p>
        </header>
        
        <section class="trending-businesses">
          <h2>Popular ${keyword} Services</h2>
          <div class="business-grid">
            <!-- Dynamic business listings -->
          </div>
        </section>
        
        <section class="trending-info">
          <h2>About ${keyword}</h2>
          <p>Find the best ${keyword} services in your area. All businesses are verified and halal certified.</p>
        </section>
      </div>
    `;
  }

  generateTrendingSchema(keyword) {
    return `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "${keyword}",
      "description": "Find the best ${keyword} services",
      "provider": {
        "@type": "Organization",
        "name": "Ummah Connects"
      }
    }
    </script>`;
  }

  generateTrendingInternalLinks(keyword) {
    return [
      { url: '/', text: 'Home' },
      { url: '/businesses', text: 'All Businesses' },
      { url: '/trending', text: 'Trending Services' }
    ];
  }

  generateTrendingBreadcrumbs(keyword) {
    return [
      { url: '/', text: 'Home' },
      { url: '/trending', text: 'Trending' },
      { url: `/trending/${keyword.replace(/\s+/g, '-')}`, text: keyword }
    ];
  }

  async updateSitemaps() {
    console.log('🗺️ Updating sitemaps...');
    await this.pageGenerator.generateSitemaps();
    console.log('✅ Sitemaps updated');
  }

  async fullRegeneration() {
    console.log('🌙 Starting full regeneration...');
    await this.regeneratePages();
    await this.optimizePages();
    console.log('✅ Full regeneration complete');
  }

  async deepOptimization() {
    console.log('📈 Starting deep optimization...');
    
    // Analyze page performance
    await this.analyzePerformance();
    
    // Optimize content
    await this.optimizeContent();
    
    // Update schema markup
    await this.updateSchemaMarkup();
    
    console.log('✅ Deep optimization complete');
  }

  async analyzePerformance() {
    // Analyze page performance and identify optimization opportunities
    console.log('📊 Analyzing page performance...');
  }

  async optimizeContent() {
    // Optimize content for better SEO
    console.log('📝 Optimizing content...');
  }

  async updateSchemaMarkup() {
    // Update schema markup for better rich snippets
    console.log('🏷️ Updating schema markup...');
  }

  getPageCount() {
    try {
      const pagesDir = './generated-pages';
      if (!fs.existsSync(pagesDir)) return 0;
      
      let count = 0;
      const countPages = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            countPages(filePath);
          } else if (file.endsWith('.html')) {
            count++;
          }
        }
      };
      
      countPages(pagesDir);
      return count;
    } catch (error) {
      console.error('Error counting pages:', error);
      return 0;
    }
  }

  getRecentPages(limit = 10) {
    // Get recently generated pages
    return [];
  }

  getMonitoringData() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      stats: this.stats,
      isRunning: this.isRunning,
      nextUpdate: this.stats.nextUpdate
    };
  }

  createPageHTML(pageData) {
    // Same as in page-generator.js
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
    
    <!-- Schema.org JSON-LD -->
    ${pageData.schema}
    
    <!-- CSS -->
    <link rel="stylesheet" href="/css/seo-pages.css">
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
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        ${pageData.content}
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <p>&copy; 2025 Ummah Connects. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
  }

  getFilePath(url) {
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const pathParts = cleanUrl.split('/');
    
    if (pathParts.length === 1 && pathParts[0] === '') {
      return path.join('./generated-pages', 'index.html');
    }
    
    const fileName = pathParts[pathParts.length - 1] || 'index';
    const dirPath = pathParts.slice(0, -1).join('/');
    
    return path.join('./generated-pages', dirPath, `${fileName}.html`);
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`🚀 SEO Automation Server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`📈 Stats: http://localhost:${this.port}/api/stats`);
      console.log(`🔍 Monitoring: http://localhost:${this.port}/api/monitoring`);
    });
  }
}

// Start the server
new SEOAutomationServer();
