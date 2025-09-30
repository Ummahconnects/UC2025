/**
 * Muslim Google SEO System
 * Comprehensive SEO automation to dominate Islamic business search rankings
 * Target: #1 rankings across all Islamic business categories globally
 */

const fs = require('fs');
const path = require('path');

class MuslimGoogleSEO {
  constructor() {
    this.countries = [
      'australia', 'canada', 'united-kingdom', 'united-states', 'germany', 
      'france', 'netherlands', 'sweden', 'norway', 'denmark', 'belgium',
      'switzerland', 'austria', 'italy', 'spain', 'portugal', 'ireland',
      'new-zealand', 'south-africa', 'malaysia', 'singapore', 'indonesia',
      'turkey', 'saudi-arabia', 'uae', 'qatar', 'kuwait', 'bahrain',
      'oman', 'jordan', 'lebanon', 'morocco', 'tunisia', 'algeria',
      'egypt', 'pakistan', 'bangladesh', 'india', 'iran', 'iraq'
    ];

    this.categories = {
      'halal-restaurants': {
        keywords: ['halal restaurant', 'halal food', 'muslim restaurant', 'halal dining'],
        schema: 'Restaurant',
        subcategories: ['middle-eastern', 'turkish', 'indian', 'pakistani', 'arabic', 'persian', 'malay', 'indonesian']
      },
      'islamic-clothing': {
        keywords: ['islamic clothing', 'modest fashion', 'hijab', 'abaya', 'thobe', 'muslim clothing'],
        schema: 'ClothingStore',
        subcategories: ['hijabs', 'abayas', 'thobes', 'modest-dresses', 'islamic-shoes', 'prayer-clothes']
      },
      'islamic-finance': {
        keywords: ['islamic banking', 'halal investment', 'sharia finance', 'islamic loans', 'halal insurance'],
        schema: 'FinancialService',
        subcategories: ['islamic-banking', 'halal-investment', 'sharia-insurance', 'islamic-loans', 'halal-credit-cards']
      },
      'islamic-education': {
        keywords: ['islamic school', 'quran classes', 'arabic lessons', 'islamic studies', 'madrasa'],
        schema: 'EducationalOrganization',
        subcategories: ['quran-schools', 'arabic-classes', 'islamic-studies', 'hifz-programs', 'islamic-universities']
      },
      'mosques': {
        keywords: ['mosque', 'masjid', 'islamic center', 'prayer times', 'jummah prayer'],
        schema: 'PlaceOfWorship',
        subcategories: ['prayer-times', 'jummah-services', 'islamic-centers', 'community-mosques', 'friday-prayer']
      },
      'halal-travel': {
        keywords: ['halal travel', 'muslim travel', 'islamic tourism', 'halal hotels', 'muslim-friendly'],
        schema: 'TravelAgency',
        subcategories: ['halal-hotels', 'muslim-tours', 'umrah-packages', 'hajj-travel', 'halal-resorts']
      },
      'islamic-books': {
        keywords: ['islamic books', 'quran', 'hadith', 'islamic literature', 'religious books'],
        schema: 'BookStore',
        subcategories: ['quran-books', 'hadith-collections', 'islamic-history', 'fiqh-books', 'seerah-books']
      },
      'islamic-art': {
        keywords: ['islamic art', 'calligraphy', 'arabic art', 'islamic decoration', 'muslim art'],
        schema: 'ArtGallery',
        subcategories: ['calligraphy', 'islamic-patterns', 'arabic-art', 'religious-art', 'islamic-crafts']
      },
      'charities': {
        keywords: ['islamic charity', 'zakat', 'sadaqah', 'muslim charity', 'islamic relief'],
        schema: 'Organization',
        subcategories: ['zakat-foundations', 'orphan-sponsorship', 'emergency-relief', 'education-charity', 'health-charity']
      },
      'wedding-services': {
        keywords: ['muslim wedding', 'islamic wedding', 'halal wedding', 'nikah services', 'muslim photographer'],
        schema: 'EventVenue',
        subcategories: ['nikah-services', 'muslim-photographers', 'halal-catering', 'islamic-decorations', 'wedding-planning']
      },
      'healthcare': {
        keywords: ['muslim doctor', 'halal healthcare', 'islamic medicine', 'muslim therapist', 'halal pharmacy'],
        schema: 'MedicalBusiness',
        subcategories: ['muslim-doctors', 'halal-pharmacy', 'islamic-therapy', 'halal-medicine', 'muslim-dentists']
      }
    };

    this.schemaTemplates = this.initializeSchemaTemplates();
  }

  initializeSchemaTemplates() {
    return {
      Restaurant: {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "{businessName}",
        "description": "{description}",
        "url": "{websiteUrl}",
        "image": "{imageUrl}",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "{streetAddress}",
          "addressLocality": "{city}",
          "addressRegion": "{state}",
          "postalCode": "{postalCode}",
          "addressCountry": "{country}"
        },
        "telephone": "{phone}",
        "servesCuisine": ["{cuisineType}"],
        "priceRange": "{priceRange}",
        "openingHours": ["{openingHours}"],
        "halalCertified": true,
        "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
        "hasMenu": "{menuUrl}",
        "acceptsReservations": true,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "{rating}",
          "reviewCount": "{reviewCount}"
        }
      },
      ClothingStore: {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        "name": "{businessName}",
        "description": "{description}",
        "url": "{websiteUrl}",
        "image": "{imageUrl}",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "{streetAddress}",
          "addressLocality": "{city}",
          "addressRegion": "{state}",
          "postalCode": "{postalCode}",
          "addressCountry": "{country}"
        },
        "telephone": "{phone}",
        "openingHours": ["{openingHours}"],
        "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
        "specialty": "Islamic Clothing",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Islamic Fashion",
          "itemListElement": ["{products}"]
        }
      },
      FinancialService: {
        "@context": "https://schema.org",
        "@type": "FinancialService",
        "name": "{businessName}",
        "description": "{description}",
        "url": "{websiteUrl}",
        "image": "{imageUrl}",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "{streetAddress}",
          "addressLocality": "{city}",
          "addressRegion": "{state}",
          "postalCode": "{postalCode}",
          "addressCountry": "{country}"
        },
        "telephone": "{phone}",
        "serviceType": "Islamic Financial Services",
        "areaServed": "{country}",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Islamic Financial Products",
          "itemListElement": ["{services}"]
        }
      }
    };
  }

  generateCountryCategoryPages() {
    const pages = [];
    
    for (const country of this.countries) {
      for (const [categoryKey, categoryData] of Object.entries(this.categories)) {
        const page = this.createCountryCategoryPage(country, categoryKey, categoryData);
        pages.push(page);
      }
    }
    
    return pages;
  }

  createCountryCategoryPage(country, category, categoryData) {
    const countryName = this.formatCountryName(country);
    const categoryName = this.formatCategoryName(category);
    
    const pageData = {
      url: `/${country}/${category}`,
      title: `${categoryName} in ${countryName} | Halal & Islamic Services`,
      metaDescription: `Find the best ${categoryName.toLowerCase()} in ${countryName}. Halal certified, Muslim-friendly services. Reviews, locations, and contact information.`,
      h1: `${categoryName} in ${countryName}`,
      content: this.generatePageContent(country, category, categoryData),
      schema: this.generateSchemaMarkup(country, category, categoryData),
      keywords: this.generateKeywords(country, category, categoryData),
      internalLinks: this.generateInternalLinks(country, category),
      breadcrumbs: this.generateBreadcrumbs(country, category)
    };

    return pageData;
  }

  generatePageContent(country, category, categoryData) {
    const countryName = this.formatCountryName(country);
    const categoryName = this.formatCategoryName(category);
    
    return `
      <div class="country-category-page">
        <header>
          <h1>${categoryName} in ${countryName}</h1>
          <p class="lead">Discover the best halal and Islamic ${categoryName.toLowerCase()} services in ${countryName}. 
          All businesses are Muslim-friendly and halal certified.</p>
          </p>
        </header>

        <section class="featured-businesses">
          <h2>Featured ${categoryName} in ${countryName}</h2>
          <div class="business-grid">
            <!-- Dynamic business listings will be inserted here -->
          </div>
        </section>

        <section class="category-info">
          <h2>About ${categoryName} in ${countryName}</h2>
          <p>${this.generateCategoryDescription(category, countryName)}</p>
        </section>

        <section class="subcategories">
          <h2>${categoryName} Subcategories</h2>
          <div class="subcategory-grid">
            ${this.generateSubcategoryLinks(country, category, categoryData.subcategories)}
          </div>
        </section>

        <section class="local-seo">
          <h2>Find ${categoryName} Near You</h2>
          <div class="location-finder">
            <!-- Location-based search will be inserted here -->
          </div>
        </section>

        <section class="reviews-testimonials">
          <h2>Customer Reviews</h2>
          <div class="reviews-grid">
            <!-- Customer reviews will be inserted here -->
          </div>
        </section>

        <section class="faq">
          <h2>Frequently Asked Questions</h2>
          <div class="faq-list">
            ${this.generateFAQ(category, countryName)}
          </div>
        </section>
      </div>
    `;
  }

  generateSchemaMarkup(country, category, categoryData) {
    const schemaType = categoryData.schema;
    const template = this.schemaTemplates[schemaType];
    
    if (!template) return null;

    const schema = JSON.stringify(template, null, 2);
    return `<script type="application/ld+json">${schema}</script>`;
  }

  generateKeywords(country, category, categoryData) {
    const countryName = this.formatCountryName(country);
    const baseKeywords = categoryData.keywords;
    
    return [
      ...baseKeywords,
      `${baseKeywords[0]} ${countryName}`,
      `halal ${category} ${countryName}`,
      `muslim ${category} ${countryName}`,
      `islamic ${category} ${countryName}`,
      `${category} near me`,
      `best ${category} ${countryName}`,
      `top ${category} ${countryName}`
    ];
  }

  generateInternalLinks(country, category) {
    return [
      { url: `/${country}`, text: `${this.formatCountryName(country)} Home` },
      { url: `/${country}/businesses`, text: `All Businesses in ${this.formatCountryName(country)}` },
      { url: `/${category}`, text: `All ${this.formatCategoryName(category)}` },
      { url: '/community', text: 'Community Hub' },
      { url: '/mosques', text: 'Find Mosques' }
    ];
  }

  generateBreadcrumbs(country, category) {
    return [
      { url: '/', text: 'Home' },
      { url: `/${country}`, text: this.formatCountryName(country) },
      { url: `/${country}/${category}`, text: this.formatCategoryName(category) }
    ];
  }

  generateCategoryDescription(category, countryName) {
    const descriptions = {
      'halal-restaurants': `Discover the finest halal restaurants in ${countryName}. From traditional Middle Eastern cuisine to modern halal dining experiences, find the perfect halal meal for any occasion.`,
      'islamic-clothing': `Shop for modest Islamic clothing in ${countryName}. Find hijabs, abayas, thobes, and other Islamic fashion items from trusted halal retailers.`,
      'islamic-finance': `Access sharia-compliant financial services in ${countryName}. Islamic banking, halal investments, and ethical financial solutions for the Muslim community.`,
      'islamic-education': `Find Islamic schools, Quran classes, and Arabic lessons in ${countryName}. Quality Islamic education for all ages.`,
      'mosques': `Locate mosques and Islamic centers in ${countryName}. Prayer times, Jummah services, and community activities.`,
      'halal-travel': `Plan your halal travel to ${countryName}. Muslim-friendly hotels, halal restaurants, and Islamic tourism experiences.`,
      'islamic-books': `Browse Islamic books, Quran, and religious literature in ${countryName}. Educational resources for the Muslim community.`,
      'islamic-art': `Discover Islamic art, calligraphy, and cultural items in ${countryName}. Traditional and contemporary Islamic artistic expressions.`,
      'charities': `Support Islamic charities and humanitarian causes in ${countryName}. Zakat, sadaqah, and community service opportunities.`,
      'wedding-services': `Plan your Islamic wedding in ${countryName}. Nikah services, halal catering, and Muslim wedding planning.`,
      'healthcare': `Find Muslim doctors and halal healthcare services in ${countryName}. Islamic medicine and healthcare providers.`
    };

    return descriptions[category] || `Find ${category} services in ${countryName}.`;
  }

  generateSubcategoryLinks(country, category, subcategories) {
    return subcategories.map(sub => 
      `<a href="/${country}/${category}/${sub}" class="subcategory-link">${this.formatCategoryName(sub)}</a>`
    ).join('');
  }

  generateFAQ(category, countryName) {
    const faqs = {
      'halal-restaurants': [
        { q: `What makes a restaurant halal in ${countryName}?`, a: `Halal restaurants in ${countryName} must serve only halal-certified meat and avoid alcohol and pork products.` },
        { q: `How can I verify if a restaurant is truly halal?`, a: `Look for halal certification from recognized Islamic organizations and check online reviews from Muslim customers.` }
      ],
      'islamic-clothing': [
        { q: `Where can I find modest Islamic clothing in ${countryName}?`, a: `Many Islamic clothing stores in ${countryName} offer hijabs, abayas, and other modest fashion items.` },
        { q: `What types of Islamic clothing are available?`, a: `You can find hijabs, abayas, thobes, modest dresses, and Islamic accessories in ${countryName}.` }
      ]
    };

    const categoryFAQs = faqs[category] || [
      { q: `How do I find ${category} services in ${countryName}?`, a: `Use our directory to search for ${category} services by location, ratings, and reviews.` }
    ];

    return categoryFAQs.map(faq => 
      `<div class="faq-item">
        <h3>${faq.q}</h3>
        <p>${faq.a}</p>
      </div>`
    ).join('');
  }

  formatCountryName(country) {
    return country.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatCategoryName(category) {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  generateSitemap() {
    const pages = this.generateCountryCategoryPages();
    const sitemapUrls = pages.map(page => ({
      loc: `https://ummah-connects.com${page.url}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    }));

    return sitemapUrls;
  }

  // Generate pages for mass deployment
  generateAllPages() {
    const allPages = [];
    
    // Generate country-category combinations
    const countryCategoryPages = this.generateCountryCategoryPages();
    allPages.push(...countryCategoryPages);

    // Generate subcategory pages
    for (const country of this.countries) {
      for (const [categoryKey, categoryData] of Object.entries(this.categories)) {
        for (const subcategory of categoryData.subcategories) {
          const subPage = this.createSubcategoryPage(country, categoryKey, subcategory);
          allPages.push(subPage);
        }
      }
    }

    return allPages;
  }

  createSubcategoryPage(country, category, subcategory) {
    const countryName = this.formatCountryName(country);
    const categoryName = this.formatCategoryName(category);
    const subcategoryName = this.formatCategoryName(subcategory);
    
    return {
      url: `/${country}/${category}/${subcategory}`,
      title: `${subcategoryName} in ${countryName} | ${categoryName} Services`,
      metaDescription: `Find ${subcategoryName.toLowerCase()} services in ${countryName}. Halal certified, Muslim-friendly ${categoryName.toLowerCase()}.`,
      h1: `${subcategoryName} in ${countryName}`,
      content: this.generateSubcategoryContent(country, category, subcategory),
      schema: this.generateSubcategorySchema(country, category, subcategory),
      keywords: this.generateSubcategoryKeywords(country, category, subcategory),
      internalLinks: this.generateSubcategoryInternalLinks(country, category, subcategory),
      breadcrumbs: this.generateSubcategoryBreadcrumbs(country, category, subcategory)
    };
  }

  generateSubcategoryContent(country, category, subcategory) {
    const countryName = this.formatCountryName(country);
    const categoryName = this.formatCategoryName(category);
    const subcategoryName = this.formatCategoryName(subcategory);
    
    return `
      <div class="subcategory-page">
        <header>
          <h1>${subcategoryName} in ${countryName}</h1>
          <p class="lead">Discover the best ${subcategoryName.toLowerCase()} services in ${countryName}. 
          All businesses are halal certified and Muslim-friendly.</p>
        </header>

        <section class="featured-businesses">
          <h2>Top ${subcategoryName} in ${countryName}</h2>
          <div class="business-grid">
            <!-- Dynamic business listings -->
          </div>
        </section>

        <section class="local-seo">
          <h2>Find ${subcategoryName} Near You</h2>
          <div class="location-finder">
            <!-- Location-based search -->
          </div>
        </section>

        <section class="related-categories">
          <h2>Related ${categoryName} Services</h2>
          <div class="related-links">
            <!-- Related category links -->
          </div>
        </section>
      </div>
    `;
  }

  generateSubcategorySchema(country, category, subcategory) {
    // Generate specific schema for subcategory
    return `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "${this.formatCategoryName(subcategory)} in ${this.formatCountryName(country)}",
      "description": "Find ${subcategory.toLowerCase()} services in ${this.formatCountryName(country)}",
      "areaServed": "${this.formatCountryName(country)}",
      "serviceType": "${this.formatCategoryName(subcategory)}"
    }
    </script>`;
  }

  generateSubcategoryKeywords(country, category, subcategory) {
    const countryName = this.formatCountryName(country);
    const subcategoryName = this.formatCategoryName(subcategory);
    
    return [
      `${subcategoryName.toLowerCase()} ${countryName}`,
      `halal ${subcategory.toLowerCase()} ${countryName}`,
      `muslim ${subcategory.toLowerCase()} ${countryName}`,
      `islamic ${subcategory.toLowerCase()} ${countryName}`,
      `${subcategory.toLowerCase()} near me`,
      `best ${subcategory.toLowerCase()} ${countryName}`
    ];
  }

  generateSubcategoryInternalLinks(country, category, subcategory) {
    return [
      { url: `/${country}`, text: `${this.formatCountryName(country)} Home` },
      { url: `/${country}/${category}`, text: `All ${this.formatCategoryName(category)} in ${this.formatCountryName(country)}` },
      { url: `/${category}`, text: `All ${this.formatCategoryName(category)}` },
      { url: '/community', text: 'Community Hub' }
    ];
  }

  generateSubcategoryBreadcrumbs(country, category, subcategory) {
    return [
      { url: '/', text: 'Home' },
      { url: `/${country}`, text: this.formatCountryName(country) },
      { url: `/${country}/${category}`, text: this.formatCategoryName(category) },
      { url: `/${country}/${category}/${subcategory}`, text: this.formatCategoryName(subcategory) }
    ];
  }
}

module.exports = MuslimGoogleSEO;
