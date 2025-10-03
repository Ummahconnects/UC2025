import { logger } from '../errors/Logger';

interface PrayerTimesResponse {
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      hijri: {
        date: string;
        month: {
          en: string;
          ar: string;
        };
        year: string;
      };
    };
  };
}

export interface PrayerTime {
  name: string;
  time: string;
}

export class PrayerTimesService {
  private static readonly API_URL = 'https://api.aladhan.com/v1'; // Direct Aladhan API
  private static readonly DEFAULT_LAT = parseFloat(import.meta.env.VITE_PRAYER_LAT || '-31.9505'); // Perth
  private static readonly DEFAULT_LNG = parseFloat(import.meta.env.VITE_PRAYER_LNG || '115.8605'); // Perth

  /**
   * Get the appropriate calculation method based on geographic location
   */
  private static getCalculationMethod(latitude: number, longitude: number): number {
    // Method selection based on region:
    // 1 = University of Islamic Sciences, Karachi
    // 2 = Islamic Society of North America (ISNA) - North America
    // 3 = Muslim World League (MWL) - Universal, works well globally
    // 4 = Umm Al-Qura University, Makkah - Saudi Arabia & Middle East
    // 5 = Egyptian General Authority of Survey - Egypt, Syria, Iraq, Lebanon, Malaysia, Parts of USA
    // 7 = Institute of Geophysics, University of Tehran - Iran
    // 12 = Union Organization islamic de France - France
    // 13 = Majlis Ugama Islam Singapura, Singapore
    // 15 = Moonsighting Committee Worldwide
    
    // North America (Canada, USA, Mexico)
    if (latitude >= 15 && latitude <= 75 && longitude >= -170 && longitude <= -50) {
      return 2; // ISNA
    }
    
    // Middle East & Gulf (Saudi Arabia, UAE, Kuwait, Qatar, etc.)
    if (latitude >= 12 && latitude <= 42 && longitude >= 34 && longitude <= 63) {
      return 4; // Umm Al-Qura
    }
    
    // Egypt, North Africa
    if (latitude >= 20 && latitude <= 35 && longitude >= -17 && longitude <= 37) {
      return 5; // Egyptian General Authority
    }
    
    // Southeast Asia (Indonesia, Malaysia, Singapore, Brunei)
    if (latitude >= -11 && latitude <= 20 && longitude >= 95 && longitude <= 141) {
      return 13; // Singapore method (good for SE Asia)
    }
    
    // South Asia (Pakistan, India, Bangladesh)
    if (latitude >= 8 && latitude <= 37 && longitude >= 60 && longitude <= 97) {
      return 1; // University of Karachi
    }
    
    // Europe
    if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
      return 3; // Muslim World League
    }
    
    // Australia & New Zealand
    if (latitude >= -48 && latitude <= -10 && longitude >= 110 && longitude <= 180) {
      return 3; // Muslim World League
    }
    
    // Default: Muslim World League (works well globally)
    return 3;
  }

  /**
   * Fetch prayer times for today
   */
  static async getTodaysPrayerTimes(latitude?: number, longitude?: number): Promise<PrayerTime[]> {
    try {
      console.log('🕌 PrayerTimesService: Fetching today\'s prayer times...');
      
      const lat = latitude || this.DEFAULT_LAT;
      const lng = longitude || this.DEFAULT_LNG;
      
      // Get current date
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      
      // Auto-select calculation method based on location
      const method = this.getCalculationMethod(lat, lng);
      const methodNames: Record<number, string> = {
        1: 'Karachi',
        2: 'ISNA (North America)',
        3: 'Muslim World League',
        4: 'Umm Al-Qura (Makkah)',
        5: 'Egyptian',
        13: 'Singapore',
      };
      
      console.log(`🕌 PrayerTimesService: Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      console.log(`🕌 PrayerTimesService: Using calculation method ${method} (${methodNames[method] || 'Unknown'})`);
      
      const url = `${this.API_URL}/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${method}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🕌 PrayerTimesService: API error response:', errorText);
        throw new Error(`Prayer times API error: ${response.status} ${response.statusText}`);
      }
      
      const data: PrayerTimesResponse = await response.json();
      console.log('🕌 PrayerTimesService: Received prayer times data:', data.data?.timings);
      
      if (!data.data || !data.data.timings) {
        throw new Error('Invalid prayer times response format');
      }
      
      const timings = data.data.timings;
      const prayerTimes: PrayerTime[] = [
        { name: 'Fajr', time: this.formatTime(timings.Fajr) },
        { name: 'Dhuhr', time: this.formatTime(timings.Dhuhr) },
        { name: 'Asr', time: this.formatTime(timings.Asr) },
        { name: 'Maghrib', time: this.formatTime(timings.Maghrib) },
        { name: 'Isha', time: this.formatTime(timings.Isha) }
      ];
      
      console.log('🕌 PrayerTimesService: ✅ Successfully fetched and formatted prayer times:', prayerTimes);
      return prayerTimes;
      
    } catch (error) {
      console.error('🕌 PrayerTimesService: ❌ Error fetching prayer times:', error);
      logger.error('Failed to fetch prayer times', { error });
      
      // Return default prayer times as fallback
      console.log('🕌 PrayerTimesService: Using default prayer times as fallback');
      return this.getDefaultPrayerTimes();
    }
  }
  
  /**
   * Format time from 24-hour to 12-hour format
   */
  private static formatTime(time: string): string {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.warn('🕌 PrayerTimesService: Error formatting time:', time, error);
      return time; // Return original time if formatting fails
    }
  }
  
  /**
   * Get default prayer times as fallback
   */
  private static getDefaultPrayerTimes(): PrayerTime[] {
    return [
      { name: 'Fajr', time: '5:12 AM' },
      { name: 'Dhuhr', time: '12:45 PM' },
      { name: 'Asr', time: '4:20 PM' },
      { name: 'Maghrib', time: '6:55 PM' },
      { name: 'Isha', time: '8:15 PM' }
    ];
  }
  
  /**
   * Get the next prayer time
   */
  static getNextPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const prayer of prayerTimes) {
      const prayerTime = this.timeToMinutes(prayer.time);
      if (prayerTime > currentTime) {
        return prayer;
      }
    }
    
    // If no prayer is found for today, return the first prayer of tomorrow
    return prayerTimes[0] || null;
  }
  
  /**
   * Convert time string to minutes since midnight
   */
  private static timeToMinutes(timeStr: string): number {
    try {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalHours = hours;
      
      if (period === 'PM' && hours !== 12) {
        totalHours += 12;
      } else if (period === 'AM' && hours === 12) {
        totalHours = 0;
      }
      
      return totalHours * 60 + minutes;
    } catch (error) {
      console.warn('🕌 PrayerTimesService: Error converting time to minutes:', timeStr, error);
      return 0;
    }
  }
}