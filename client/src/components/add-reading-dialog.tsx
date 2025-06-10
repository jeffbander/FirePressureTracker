import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  systolic: z.string().min(1, "Systolic pressure is required").transform(Number),
  diastolic: z.string().min(1, "Diastolic pressure is required").transform(Number),
  heartRate: z.string().optional().transform(val => val ? Number(val) : undefined),
  notes: z.string().optional(),
});

interface AddReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatientId?: number;
}

export function AddReadingDialog({ open, onOpenChange, selectedPatientId }: AddReadingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: selectedPatientId?.toString() || "",
      systolic: "",
      diastolic: "",
      heartRate: "",
      notes: "",
    },
  });

  const createReadingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/readings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/readings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/priority"] });
      toast({
        title: "Reading added successfully",
        description: "The blood pressure reading has been recorded.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reading. Please check the information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createReadingMutation.mutate(data);
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    // AHA Guidelines Implementation
    if (systolic > 180 || diastolic > 120) return { name: "Hypertensive Crisis", color: "purple", priority: 5 };
    if (systolic >= 140 || diastolic >= 90) return { name: "High Blood Pressure Stage 2", color: "red", priority: 4 };
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { name: "High Blood Pressure Stage 1", color: "orange", priority: 3 };
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return { name: "Elevated", color: "yellow", priority: 2 };
    if (systolic < 120 && diastolic < 80) return { name: "Normal", color: "green", priority: 1 };
    return { name: "Unknown", color: "gray", priority: 0 };
  };

  const watchedSystolic = form.watch("systolic");
  const watchedDiastolic = form.watch("diastolic");
  const category = watchedSystolic && watchedDiastolic ? 
    getBPCategory(Number(watchedSystolic), Number(watchedDiastolic)) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Blood Pressure Reading</DialogTitle>
          <DialogDescription>
            Record a new blood pressure measurement for a patient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName} (ID: {patient.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="systolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Systolic (mmHg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diastolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diastolic (mmHg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="80" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {category && (
              <div className={`p-3 rounded-lg border-l-4 text-sm ${
                category.color === 'purple' ? 'bg-purple-50 border-purple-500 text-purple-800' :
                category.color === 'red' ? 'bg-red-50 border-red-500 text-red-800' :
                category.color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-800' :
                category.color === 'yellow' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                category.color === 'green' ? 'bg-green-50 border-green-500 text-green-800' :
                'bg-gray-50 border-gray-500 text-gray-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    category.color === 'purple' ? 'bg-purple-500' :
                    category.color === 'red' ? 'bg-red-500' :
                    category.color === 'orange' ? 'bg-orange-500' :
                    category.color === 'yellow' ? 'bg-yellow-500' :
                    category.color === 'green' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="font-medium">{category.name}</span>
                  {category.priority >= 4 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium ml-auto">
                      Urgent Follow-up Required
                    </span>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="heartRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heart Rate (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="72" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional observations or notes..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createReadingMutation.isPending}>
                {createReadingMutation.isPending ? "Adding..." : "Add Reading"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}