// Initialize Social Media Accounts in Database
// This script adds the planned social media accounts to the database

import { supabase } from '@/integrations/supabase/client';
import { socialMediaAccounts } from './setup-social-media-accounts';

export interface DatabaseSocialAccount {
  platform: string;
  username: string;
  profile_url: string;
  business_url?: string;
  email: string;
  description: string;
  category: string;
  website: string;
  location: string;
  contact_email: string;
  contact_phone?: string;
  contact_address?: string;
  profile_image_specs: string;
  cover_image_specs?: string;
  bio: string;
  hashtags: string[];
  posting_frequency: string;
  content_types: string[];
  target_audience: string;
  is_active: boolean;
  is_business_account: boolean;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
}

export async function initializeSocialMediaAccounts(): Promise<void> {
  console.log('🚀 Initializing social media accounts in database...');

  try {
    // First, check if accounts already exist
    const { data: existingAccounts, error: fetchError } = await supabase
      .from('social_media_accounts')
      .select('platform');

    if (fetchError) {
      console.error('Error fetching existing accounts:', fetchError);
      return;
    }

    const existingPlatforms = existingAccounts?.map(acc => acc.platform) || [];
    console.log('Existing platforms:', existingPlatforms);

    // Prepare accounts for database insertion
    const accountsToInsert: Omit<DatabaseSocialAccount, 'created_at' | 'updated_at'>[] = [];

    for (const account of socialMediaAccounts) {
      // Skip if account already exists
      if (existingPlatforms.includes(account.name.toLowerCase())) {
        console.log(`⏭️ Skipping ${account.name} - already exists`);
        continue;
      }

      const dbAccount: Omit<DatabaseSocialAccount, 'created_at' | 'updated_at'> = {
        platform: account.name.toLowerCase(),
        username: account.username,
        profile_url: account.profileUrl,
        business_url: account.businessUrl,
        email: account.email,
        description: account.description,
        category: account.category,
        website: account.website,
        location: account.location,
        contact_email: account.contactInfo.email,
        contact_phone: account.contactInfo.phone,
        contact_address: account.contactInfo.address,
        profile_image_specs: account.brandingGuidelines.profileImage,
        cover_image_specs: account.brandingGuidelines.coverImage,
        bio: account.brandingGuidelines.bio,
        hashtags: account.brandingGuidelines.hashtags,
        posting_frequency: account.contentStrategy.postingFrequency,
        content_types: account.contentStrategy.contentTypes,
        target_audience: account.contentStrategy.targetAudience,
        is_active: false, // Will be set to true once account is actually created
        is_business_account: true,
        setup_completed: false
      };

      accountsToInsert.push(dbAccount);
    }

    if (accountsToInsert.length === 0) {
      console.log('✅ All social media accounts already exist in database');
      return;
    }

    // Insert new accounts
    const { data: insertedAccounts, error: insertError } = await supabase
      .from('social_media_accounts')
      .insert(accountsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting social media accounts:', insertError);
      return;
    }

    console.log(`✅ Successfully added ${insertedAccounts?.length || 0} social media accounts to database`);

    // Log each inserted account
    insertedAccounts?.forEach(account => {
      console.log(`   📱 ${account.platform}: ${account.profile_url}`);
    });

    // Create initial content templates for each platform
    await createContentTemplates();

    console.log('🎉 Social media accounts initialization completed!');

  } catch (error) {
    console.error('❌ Error in initializeSocialMediaAccounts:', error);
  }
}

async function createContentTemplates(): Promise<void> {
  console.log('📝 Creating content templates...');

  const templates = [
    {
      name: 'Daily Islamic Quote',
      category: 'islamic',
      platforms: ['instagram', 'twitter', 'facebook', 'linkedin'],
      template: '🌟 Daily Islamic Inspiration 🌟\n\n"{quote}"\n\n- {source}\n\n#DailyInspiration {hashtags}',
      variables: ['quote', 'source'],
      is_islamic_calendar_aware: true
    },
    {
      name: 'Business Spotlight',
      category: 'business',
      platforms: ['instagram', 'linkedin', 'facebook'],
      template: '🏪 Business Spotlight 🏪\n\n✨ {businessName}\n📍 {location}\n🍽️ {category}\n\n{description}\n\n🌟 Supporting halal businesses in our community!\n\n{hashtags}',
      variables: ['businessName', 'location', 'category', 'description'],
      is_islamic_calendar_aware: false
    },
    {
      name: 'Mosque Feature',
      category: 'community',
      platforms: ['instagram', 'twitter', 'facebook'],
      template: '🕌 Mosque Spotlight 🕌\n\n📿 {mosqueName}\n📍 {location}\n🕐 Prayer Times: {prayerTimes}\n\n{description}\n\n🤝 Building stronger communities together!\n\n{hashtags}',
      variables: ['mosqueName', 'location', 'prayerTimes', 'description'],
      is_islamic_calendar_aware: true
    },
    {
      name: 'Community Announcement',
      category: 'announcement',
      platforms: ['instagram', 'twitter', 'facebook', 'linkedin', 'telegram'],
      template: '📢 Community Update 📢\n\n{title}\n\n{content}\n\n🔗 Learn more: {link}\n\n{hashtags}',
      variables: ['title', 'content', 'link'],
      is_islamic_calendar_aware: false
    },
    {
      name: 'Friday Blessing',
      category: 'islamic',
      platforms: ['instagram', 'twitter', 'facebook', 'linkedin'],
      template: '🌟 Jummah Mubarak! 🌟\n\n"O you who believe! When the call is proclaimed for Jummah (Friday prayer), come to the remembrance of Allah and leave off business." - Quran 62:9\n\n🤲 May this blessed Friday bring peace, prosperity, and unity to our Ummah.\n\n{hashtags}',
      variables: [],
      is_islamic_calendar_aware: true
    },
    {
      name: 'TikTok Islamic Reminder',
      category: 'islamic',
      platforms: ['tiktok'],
      template: '🌙 Islamic Reminder 🌙\n\n{reminder}\n\n#IslamicReminder #MuslimTikTok #Ummah-Connectss',
      variables: ['reminder'],
      is_islamic_calendar_aware: true
    },
    {
      name: 'YouTube Video Announcement',
      category: 'announcement',
      platforms: ['youtube'],
      template: '🎥 New Video: {title}\n\n{description}\n\n🔔 Subscribe for more Islamic community content!\n\n{hashtags}',
      variables: ['title', 'description'],
      is_islamic_calendar_aware: false
    },
    {
      name: 'Pinterest Islamic Quote',
      category: 'islamic',
      platforms: ['pinterest'],
      template: '✨ {quote} ✨\n\n- {source}\n\n#IslamicQuotes #MuslimInspiration #Ummah-Connectss',
      variables: ['quote', 'source'],
      is_islamic_calendar_aware: true
    }
  ];

  try {
    const { data: insertedTemplates, error } = await supabase
      .from('content_templates')
      .insert(templates)
      .select();

    if (error) {
      console.error('Error creating content templates:', error);
      return;
    }

    console.log(`✅ Created ${insertedTemplates?.length || 0} content templates`);
  } catch (error) {
    console.error('Error in createContentTemplates:', error);
  }
}

export async function updateAccountSetupStatus(platform: string, completed: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('social_media_accounts')
      .update({
        setup_completed: completed,
        is_active: completed,
        updated_at: new Date().toISOString()
      })
      .eq('platform', platform.toLowerCase());

    if (error) {
      console.error(`Error updating ${platform} setup status:`, error);
      return;
    }

    console.log(`✅ Updated ${platform} setup status to ${completed ? 'completed' : 'pending'}`);
  } catch (error) {
    console.error('Error in updateAccountSetupStatus:', error);
  }
}

export async function getSocialMediaAccountsStatus(): Promise<DatabaseSocialAccount[]> {
  try {
    const { data: accounts, error } = await supabase
      .from('social_media_accounts')
      .select('*')
      .order('platform');

    if (error) {
      console.error('Error fetching social media accounts:', error);
      return [];
    }

    return accounts || [];
  } catch (error) {
    console.error('Error in getSocialMediaAccountsStatus:', error);
    return [];
  }
}

export async function generateSetupProgressReport(): Promise<string> {
  try {
    const accounts = await getSocialMediaAccountsStatus();
    
    let report = '# Social Media Setup Progress Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    const completed = accounts.filter(acc => acc.setup_completed);
    const pending = accounts.filter(acc => !acc.setup_completed);
    
    report += `## Summary\n`;
    report += `- ✅ Completed: ${completed.length}\n`;
    report += `- ⏳ Pending: ${pending.length}\n`;
    report += `- 📊 Total: ${accounts.length}\n\n`;
    
    if (completed.length > 0) {
      report += `## ✅ Completed Accounts\n\n`;
      completed.forEach(acc => {
        report += `- **${acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)}**: ${acc.profile_url}\n`;
      });
      report += '\n';
    }
    
    if (pending.length > 0) {
      report += `## ⏳ Pending Setup\n\n`;
      pending.forEach(acc => {
        report += `- **${acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)}**: ${acc.profile_url}\n`;
      });
      report += '\n';
    }
    
    report += `## Next Steps\n\n`;
    report += `1. Complete setup for pending accounts\n`;
    report += `2. Enable automation for completed accounts\n`;
    report += `3. Create content calendar\n`;
    report += `4. Set up analytics tracking\n`;
    
    return report;
  } catch (error) {
    console.error('Error generating progress report:', error);
    return 'Error generating report';
  }
}

// Export for use in other parts of the application
export default {
  initializeSocialMediaAccounts,
  updateAccountSetupStatus,
  getSocialMediaAccountsStatus,
  generateSetupProgressReport
};
