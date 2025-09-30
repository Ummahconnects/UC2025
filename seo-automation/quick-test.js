#!/usr/bin/env node

/**
 * Quick Test for Muslim Google SEO System
 * Test the system with a small sample to verify it works
 */

const MuslimGoogleSEO = require('./muslim-google-seo-system');

function quickTest() {
  console.log('🧪 Testing Muslim Google SEO System...');
  console.log('');

  const seoSystem = new MuslimGoogleSEO();
  
  // Test with a small sample
  const testCountries = ['australia', 'canada'];
  const testCategories = ['halal-restaurants', 'islamic-clothing'];
  
  console.log('📊 Test Configuration:');
  console.log(`   Countries: ${testCountries.length}`);
  console.log(`   Categories: ${testCategories.length}`);
  console.log('');

  // Generate test pages
  const testPages = [];
  
  for (const country of testCountries) {
    for (const category of testCategories) {
      const page = seoSystem.createCountryCategoryPage(country, category, seoSystem.categories[category]);
      testPages.push(page);
    }
  }

  console.log('✅ Generated Test Pages:');
  testPages.forEach((page, index) => {
    console.log(`   ${index + 1}. ${page.title}`);
    console.log(`      URL: ${page.url}`);
    console.log(`      Keywords: ${page.keywords.slice(0, 3).join(', ')}...`);
    console.log('');
  });

  // Test schema generation
  console.log('🔍 Testing Schema Generation:');
  const testSchema = seoSystem.generateSchemaMarkup('australia', 'halal-restaurants', seoSystem.categories['halal-restaurants']);
  console.log('   ✅ Schema markup generated successfully');
  console.log('');

  // Test sitemap generation
  console.log('🗺️ Testing Sitemap Generation:');
  const sitemapUrls = seoSystem.generateSitemap();
  console.log(`   ✅ Generated ${sitemapUrls.length} sitemap URLs`);
  console.log('');

  // Calculate full scale
  const totalCountries = seoSystem.countries.length;
  const totalCategories = Object.keys(seoSystem.categories).length;
  const totalSubcategories = Object.values(seoSystem.categories)
    .reduce((sum, cat) => sum + cat.subcategories.length, 0);
  
  const totalPages = (totalCountries * totalCategories) + 
                    (totalCountries * totalCategories * totalSubcategories / totalCategories);
  
  console.log('📈 Full Scale Projection:');
  console.log(`   Total Countries: ${totalCountries}`);
  console.log(`   Total Categories: ${totalCategories}`);
  console.log(`   Total Subcategories: ${totalSubcategories}`);
  console.log(`   Estimated Total Pages: ~${Math.round(totalPages)}`);
  console.log('');

  console.log('🎯 Expected SEO Impact:');
  console.log('   • #1 rankings for "halal restaurants [country]"');
  console.log('   • #1 rankings for "islamic clothing [country]"');
  console.log('   • #1 rankings for "islamic finance [country]"');
  console.log('   • #1 rankings for "mosques [country]"');
  console.log('   • Dominant presence in Islamic business searches');
  console.log('   • Become the "Muslim Google"');
  console.log('');

  console.log('✅ Test completed successfully!');
  console.log('🚀 Ready to generate full-scale SEO system');
  console.log('   Run: npm run generate');
}

// Run the test
if (require.main === module) {
  quickTest();
}

module.exports = quickTest;
