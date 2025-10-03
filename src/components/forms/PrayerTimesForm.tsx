import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { useToast } from '@/components/ui/toast/use-toast';
import { MosqueService } from '@/lib/services/mosqueService.ts';
// Define MosquePrayerTimes type locally if not exported from '@/types/mosque'
type MosquePrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumuah: string;
  effective_date: string;
};
// import type { MosquePrayerTimes } from '@/types/mosque';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const prayerTimesSchema = z.object({
  fajr: z.string().regex(timeRegex, 'Please enter a valid time (HH:MM)'),
  dhuhr: z.string().regex(timeRegex, 'Please enter a valid time (HH:MM)'),
  asr: z.string().regex(timeRegex, 'Please enter a valid time (HH:MM)'),
  maghrib: z.string().regex(timeRegex, 'Please enter a valid time (HH:MM)'),
  isha: z.string().regex(timeRegex, 'Please enter a valid time (HH:MM)'),
  jumuah: z.string().regex(timeRegex, 'Please enter a valid time (HH:MM)'),
  effective_date: z.string(),
});

type PrayerTimesFormData = z.infer<typeof prayerTimesSchema>;

interface PrayerTimesFormProps {
  mosqueId: string;
  prayerTimes?: MosquePrayerTimes;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PrayerTimesForm({
  mosqueId,
  prayerTimes,
  isOpen,
  onClose,
  onSuccess,
}: PrayerTimesFormProps) {
  const { toast } = useToast();

  const form = useForm<PrayerTimesFormData>({
    resolver: zodResolver(prayerTimesSchema),
    defaultValues: {
      fajr: prayerTimes?.fajr || '',
      dhuhr: prayerTimes?.dhuhr || '',
      asr: prayerTimes?.asr || '',
      maghrib: prayerTimes?.maghrib || '',
      isha: prayerTimes?.isha || '',
      jumuah: prayerTimes?.jumuah || '',
      effective_date: prayerTimes?.effective_date || new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: PrayerTimesFormData) => {
    try {
      await MosqueService.updatePrayerTimes(mosqueId, data);
      
      toast({
        title: 'Success',
        description: 'Prayer times updated successfully',
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating prayer times:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prayer times. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Prayer Times</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah'].map((prayer) => (
                <FormField
                  key={prayer}
                  control={form.control}
                  name={prayer as keyof PrayerTimesFormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{prayer}</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="time"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="effective_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective Date</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Update Prayer Times</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
