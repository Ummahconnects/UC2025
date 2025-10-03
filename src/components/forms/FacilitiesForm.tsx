import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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
import type { MosqueFacilityName } from '@/types/mosque';
import { X } from 'lucide-react';

const facilitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface FacilitiesFormProps {
  mosqueId: string;
  facilities: string[]; // Now facilities are just strings (facility names)
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FacilitiesForm({
  mosqueId,
  facilities,
  isOpen,
  onClose,
  onSuccess,
}: FacilitiesFormProps) {
  const { toast } = useToast();

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  });

  const onSubmit = async (data: FacilityFormData) => {
    try {
      // We now add facilities directly to the mosque's facilities array
      const { name } = data;
      
      // Update mosque to add the facility to the facilities array
      await MosqueService.updateFacilities(mosqueId, [...facilities, name]);
      
      form.reset();
      toast({
        title: 'Success',
        description: 'Facility added successfully',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error adding facility:', error);
      toast({
        title: 'Error',
        description: 'Failed to add facility. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (facilityName: string) => {
    try {
      // Filter out the facility to remove it
      const updatedFacilities = facilities.filter(f => f !== facilityName);
      
      // Update mosque with the new facilities array
      await MosqueService.updateFacilities(mosqueId, updatedFacilities);
      
      toast({
        title: 'Success',
        description: 'Facility deleted successfully',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting facility:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete facility. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Facilities</DialogTitle>
        </DialogHeader>

        {/* Existing Facilities */}
        <div className="space-y-4">
          <h3 className="font-semibold">Current Facilities</h3>
          <div className="grid grid-cols-1 gap-2">
            {facilities.map((facility) => (
              <div
                key={facility}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <h4 className="font-medium">{facility}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(facility)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Facility Form */}
        <div className="pt-6">
          <h3 className="font-semibold mb-4">Add New Facility</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter facility name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter facility description"
                        className="h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter icon name or URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Done
                </Button>
                <Button type="submit">Add Facility</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
