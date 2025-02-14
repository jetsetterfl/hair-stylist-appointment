import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Appointment, Availability } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

export default function StylistDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", user?.id],
  });

  const { data: availabilities } = useQuery<Availability[]>({
    queryKey: ["/api/availability", user?.id],
  });

  const form = useForm({
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00"
    }
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Availability deleted",
        description: "Your availability has been removed."
      });
    },
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: { dayOfWeek: number, startTime: string, endTime: string }) => {
      await apiRequest("POST", "/api/availability", {
        ...data,
        stylistId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Availability saved",
        description: "Your availability has been updated."
      });
    },
  });

  // Generate available time slots
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ["00", "30"]) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute}`);
    }
  }

  // Get day of week from selected date
  const selectedDayOfWeek = selectedDate.getDay();

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Set Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
                createAvailabilityMutation.mutate({
                  dayOfWeek: selectedDayOfWeek,
                  startTime: data.startTime,
                  endTime: data.endTime
                });
              })} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Day: {format(selectedDate, "EEEE")}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createAvailabilityMutation.isPending}
                  >
                    {createAvailabilityMutation.isPending ? "Saving..." : "Save Availability"}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Current Availabilities</h3>
              <div className="space-y-2">
                {availabilities?.map((avail) => (
                  <div key={avail.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span>
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][avail.dayOfWeek]}{" "}
                      {avail.startTime} - {avail.endTime}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAvailabilityMutation.mutate(avail.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments?.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{appt.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appt.date), "PPP")} at {appt.startTime}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{appt.clientEmail}</p>
                </div>
              ))}
              {(!appointments || appointments.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming appointments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}