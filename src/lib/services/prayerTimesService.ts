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
  private static readonly API_URL = '/api/prayer-times'; // Use our fixed API route
  private static readonly DEFAULT_LAT = parseFloat(import.meta.env.VITE_PRAYER_LAT || '-31.9505'); // Perth
  private static readonly DEFAULT_LNG = parseFloat(import.meta.env.VITE_PRAYER_LNG || '115.8605'); // Perth

  /**
   * Fetch prayer times for today
   */
  static async getTodaysPrayerTimes(latitude?: number, longitude?: number): Promise<PrayerTime[]> {
    try {
      console.log('🕌 PrayerTimesService: Fetching today\'s prayer times...');
      
      const lat = latitude || this.DEFAULT_LAT;
      const lng = longitude || this.DEFAULT_LNG;
      
      const url = `${this.API_URL}?lat=${lat}&lon=${lng}&method=2`;
      
      console.log('🕌 PrayerTimesService: Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Prayer times API error: ${response.status} ${errorData.message || response.statusText}`);
      }
      
      const data: PrayerTimesResponse = await response.json();
      console.log('🕌 PrayerTimesService: Received prayer times data:', data.data?.timings);
      
      const timings = data.data.timings;
      const prayerTimes: PrayerTime[] = [
        { name: 'Fajr', time: this.formatTime(timings.Fajr) },
        { name: 'Dhuhr', time: this.formatTime(timings.Dhuhr) },
        { name: 'Asr', time: this.formatTime(timings.Asr) },
        { name: 'Maghrib', time: this.formatTime(timings.Maghrib) },
        { name: 'Isha', time: this.formatTime(timings.Isha) }
      ];
      
      console.log('🕌 PrayerTimesService: Formatted prayer times:', prayerTimes);
      return prayerTimes;
      
    } catch (error) {
      console.error('🕌 PrayerTimesService: Error fetching prayer times:', error);
      logger.error('Failed to fetch prayer times', { error });
      
      // Return default prayer times as fallback
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