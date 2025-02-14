import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertAppointmentSchema, Availability } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMinutes } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BookAppointment() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStylist, setSelectedStylist] = useState<number | null>(null);

  // Fetch all stylists
  const { data: stylists } = useQuery({
    queryKey: ["/api/stylists"],
  });

  // Fetch selected stylist's availability
  const { data: availabilities } = useQuery<Availability[]>({
    queryKey: ["/api/availability", selectedStylist],
    enabled: !!selectedStylist,
  });

  const form = useForm({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      stylistId: undefined,
      date: new Date(),
      startTime: "",
      endTime: "",
      clientName: "",
      clientEmail: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/appointment", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your appointment has been booked. Check your email for confirmation.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter available times based on availabilities
  const selectedDayOfWeek = selectedDate.getDay();
  const dayAvailability = availabilities?.find(a => a.dayOfWeek === selectedDayOfWeek);

  const availableTimes = dayAvailability 
    ? generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime) 
    : [];

  if (!selectedStylist) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Select a Stylist</AlertTitle>
              <AlertDescription>
                Please select a stylist to view their availability.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              {stylists?.map((stylist) => (
                <Button
                  key={stylist.id}
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedStylist(stylist.id)}
                >
                  {stylist.username}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dayAvailability) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Availability</AlertTitle>
              <AlertDescription>
                The stylist is not available on {format(selectedDate, "EEEE")}s. 
                Please select a different day.
              </AlertDescription>
            </Alert>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => setSelectedStylist(null)}
            >
              Choose Different Stylist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Book an Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => {
              const startDate = new Date(selectedDate);
              const [hours, minutes] = data.startTime.split(":").map(Number);
              startDate.setHours(hours, minutes);

              createAppointmentMutation.mutate({
                ...data,
                stylistId: selectedStylist,
                date: startDate,
                endTime: format(addMinutes(startDate, 45), "HH:mm"),
              });
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={() => setSelectedStylist(null)}
                  >
                    Choose Different Stylist
                  </Button>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Time</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimes.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    slots.push(
      `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`
    );

    // Add 45 minutes for appointment + 15 minutes break
    currentMinute += 60;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}