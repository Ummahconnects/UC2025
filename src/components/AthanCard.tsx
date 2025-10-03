import React from 'react';
import { FaMosque } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import type { PrayerTime } from '@/lib/services/prayerTimesService.ts';

// ✅ Default times
const defaultData: PrayerTime[] = [
  { name: "Fajr", time: "5:12 AM" },
  { name: "Dhuhr", time: "12:45 PM" },
  { name: "Asr", time: "4:20 PM" },
  { name: "Maghrib", time: "6:55 PM" },
  { name: "Isha", time: "8:15 PM" },
];

interface AthanCardProps {
  data?: PrayerTime[] | any; // Can be array or object with prayer times
  loading?: boolean;
  nextPrayer?: PrayerTime | null;
}

function AthanCard({ data = defaultData, loading = false, nextPrayer }: AthanCardProps) {
  // Debug logging
  console.log('🕌 AthanCard: Received data:', data);
  console.log('🕌 AthanCard: Loading state:', loading);
  console.log('🕌 AthanCard: Next prayer:', nextPrayer);

  // Convert object format to array format if needed
  let prayerTimesArray: PrayerTime[] = defaultData;
  
  if (data && !loading) {
    if (Array.isArray(data)) {
      // Already in correct format
      prayerTimesArray = data;
    } else if (typeof data === 'object') {
      // Convert object {fajr: "5:30", dhuhr: "12:15", ...} to array format
      const prayerNames: Record<string, string> = {
        'fajr': 'Fajr',
        'dhuhr': 'Dhuhr',
        'asr': 'Asr',
        'maghrib': 'Maghrib',
        'isha': 'Isha'
      };
      
      prayerTimesArray = Object.keys(prayerNames).map(key => ({
        name: prayerNames[key],
        time: data[key] || data[prayerNames[key]] || '—'
      })).filter(pt => pt.time !== '—');
      
      console.log('🕌 AthanCard: Converted object to array:', prayerTimesArray);
    }
  }

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border shadow-lg backdrop-blur-sm flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="text-lg font-semibold text-foreground">Prayer Times</span>
          <span className="text-2xl text-primary">
            <FaMosque />
          </span>
        </div>
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-lg border-2 border-yellow-400 shadow-lg flex flex-col h-full relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/mosques/Athaan card5.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Semi-transparent overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-lg font-semibold text-white drop-shadow-lg">Prayer Times</span>
        <span className="text-2xl text-yellow-400 drop-shadow-lg">
          <FaMosque />
        </span>
      </div>
      
      {nextPrayer && (
        <div className="mb-4 p-3 bg-yellow-400/90 rounded border-2 border-yellow-500 relative z-10 backdrop-blur-sm">
          <div className="text-xs text-yellow-900 mb-1 font-medium">Next Prayer</div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-yellow-900">{nextPrayer.name}</span>
            <span className="text-sm font-mono font-bold text-yellow-900">{nextPrayer.time}</span>
          </div>
        </div>
      )}
      
      <ul className="space-y-3 relative z-10">
        {prayerTimesArray.map((item, idx) => (
          <li
            key={idx}
            className={`flex justify-between items-center text-sm border-b border-yellow-300 pb-2 last:border-b-0 last:pb-0 ${
              nextPrayer?.name === item.name ? 'text-yellow-900 font-semibold bg-yellow-400/80 px-2 py-1 rounded border border-yellow-500 backdrop-blur-sm' : ''
            }`}
          >
            <span className="font-medium text-white drop-shadow-lg">{item.name}</span>
            <span className="font-mono font-bold text-white drop-shadow-lg">
              {item.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AthanCard;
