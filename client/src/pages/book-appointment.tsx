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

export default function BookAppointment() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const stylistId = 1; // In a real app, this would come from the URL or context

  const { data: availabilities } = useQuery<Availability[]>({
    queryKey: ["/api/availability", stylistId],
  });

  const form = useForm({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      stylistId,
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
        title: "Appointment booked!",
        description: "We'll send you a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  const availableTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

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
