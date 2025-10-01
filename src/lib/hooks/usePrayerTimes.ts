import { useState, useEffect } from 'react';
import { PrayerTimesService, type PrayerTime } from '../services/prayerTimesService';
import { useErrorHandler } from './useErrorHandler';

export const usePrayerTimes = (latitude?: number, longitude?: number) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        console.log('🕌 usePrayerTimes: Fetching prayer times...');
        setLoading(true);
        
        const times = await PrayerTimesService.getTodaysPrayerTimes(latitude, longitude);
        setPrayerTimes(times);
        
        const next = PrayerTimesService.getNextPrayer(times);
        setNextPrayer(next);
        
        console.log('🕌 usePrayerTimes: Prayer times loaded:', times.length, 'prayers');
        console.log('🕌 usePrayerTimes: Next prayer:', next?.name);
      } catch (error) {
        console.error('🕌 usePrayerTimes: Error fetching prayer times:', error);
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
    
    // Refresh prayer times every hour
    const interval = setInterval(fetchPrayerTimes, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [latitude, longitude, handleError]);

  return { prayerTimes, loading, nextPrayer };
};