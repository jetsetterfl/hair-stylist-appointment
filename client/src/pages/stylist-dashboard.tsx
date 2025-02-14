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

export default function StylistDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", user?.id],
  });

  const { data: availabilities } = useQuery<Availability[]>({
    queryKey: ["/api/availability", user?.id],
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
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
    },
  });

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
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Select onValueChange={(value) => {
                  createAvailabilityMutation.mutate({
                    dayOfWeek: parseInt(value),
                    startTime: "09:00",
                    endTime: "17:00"
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {availabilities?.map((avail) => (
                  <div key={avail.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][avail.dayOfWeek]} {avail.startTime}-{avail.endTime}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
