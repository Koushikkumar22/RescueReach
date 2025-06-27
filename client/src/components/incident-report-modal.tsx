import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertIncidentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Hospital, Flame, Shield, Car, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  latitude: number;
  longitude: number;
}

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentReported: () => void;
  userLocation: Location | null;
}

const incidentFormSchema = insertIncidentSchema.extend({
  address: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentFormSchema>;

const incidentTypes = [
  { id: "medical", label: "Medical", icon: Hospital, color: "border-red-500 hover:bg-red-50 hover:border-red-600" },
  { id: "fire", label: "Fire", icon: Flame, color: "border-orange-500 hover:bg-orange-50 hover:border-orange-600" },
  { id: "crime", label: "Crime", icon: Shield, color: "border-blue-500 hover:bg-blue-50 hover:border-blue-600" },
  { id: "accident", label: "Accident", icon: Car, color: "border-yellow-500 hover:bg-yellow-50 hover:border-yellow-600" },
];

const severityLevels = [
  { id: "low", label: "Low", color: "border-green-500 hover:bg-green-50 text-green-700" },
  { id: "medium", label: "Medium", color: "border-orange-500 hover:bg-orange-50 text-orange-700" },
  { id: "high", label: "High", color: "border-red-500 hover:bg-red-50 text-red-700" },
];

export function IncidentReportModal({ 
  isOpen, 
  onClose, 
  onIncidentReported, 
  userLocation 
}: IncidentReportModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      type: "medical",
      severity: "medium",
      description: "",
      reportedBy: "anonymous",
      latitude: userLocation?.latitude.toString() || "0",
      longitude: userLocation?.longitude.toString() || "0",
      address: "",
      status: "reported",
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const response = await apiRequest("POST", "/api/incidents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents/active"] });
      toast({
        title: "Incident Reported",
        description: "Your incident has been reported to emergency services.",
      });
      onIncidentReported();
      form.reset();
      setSelectedType("");
      setSelectedSeverity("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to report incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    form.setValue("type", type as any);
  };

  const handleSeveritySelect = (severity: string) => {
    setSelectedSeverity(severity);
    form.setValue("severity", severity as any);
  };

  const onSubmit = (data: IncidentFormData) => {
    createIncidentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto emergency-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Report Incident</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Incident Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Type of Incident</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {incidentTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleTypeSelect(type.id)}
                          className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${
                            isSelected 
                              ? type.color.replace('hover:', '') 
                              : `border-gray-200 ${type.color}`
                          }`}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${
                            isSelected 
                              ? type.color.includes('red') ? 'text-red-600' :
                                type.color.includes('orange') ? 'text-orange-600' :
                                type.color.includes('blue') ? 'text-blue-600' : 'text-yellow-600'
                              : 'text-gray-600'
                          }`} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Severity Level */}
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Severity Level</FormLabel>
                  <div className="flex space-x-3">
                    {severityLevels.map((level) => {
                      const isSelected = selectedSeverity === level.id;
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleSeveritySelect(level.id)}
                          className={`flex-1 p-3 border-2 rounded-xl transition-colors text-center ${
                            isSelected 
                              ? level.color.replace('hover:', '')
                              : `border-gray-200 ${level.color}`
                          }`}
                        >
                          <div className={`font-medium ${isSelected ? level.color.split(' ').pop() : 'text-gray-700'}`}>
                            {level.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter specific address or landmark" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide additional details about the incident..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tap to add photo</p>
                <p className="text-xs text-gray-500 mt-1">Feature coming soon</p>
              </div>
            </div>

            {/* Current Location Display */}
            {userLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Using your current location</p>
                <p className="text-xs text-blue-700 mt-1">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createIncidentMutation.isPending || !selectedType || !selectedSeverity}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors focus:ring-4 focus:ring-red-300"
            >
              {createIncidentMutation.isPending ? "Submitting..." : "Submit Incident Report"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
