"use client";

import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ruLocale from "@fullcalendar/core/locales/ru";
import { createClientClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Search, MapPin } from "lucide-react";
import { EventDialog } from "@/components/EventDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CalendarApp({ currentUser }: { currentUser: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClientClient();

    const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        owner:profiles!owner_id(id, full_name, avatar_url, email),
        responsible:profiles!responsible_id(id, full_name, avatar_url, email),
        participants:event_participants(user_id, profile:profiles(full_name))
      `)
      .order('start_time', { ascending: true })
      .limit(1000);
    
    if (error) {
      console.error("Error fetching events:", error);
    }

    if (data) {
      const formattedEvents = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        extendedProps: { ...event },
        backgroundColor: getCategoryColor(event.category),
        borderColor: 'transparent',
      }));
      setEvents(formattedEvents);
    }
    setLoading(false);
  }, [supabase]);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.extendedProps.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.extendedProps.responsible?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return '#ef4444'; 
      case 'deadline': return '#f59e0b'; 
      case 'vacation': return '#10b981'; 
      default: return '#3b82f6'; 
    }
  };

  useEffect(() => {
    fetchEvents();

    const subscription = supabase
      .channel("calendar_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchEvents]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent({ start_time: selectInfo.startStr, end_time: selectInfo.endStr });
    setIsDialogOpen(true);
  };

    const handleEventClick = (clickInfo: any) => {
      setSelectedEvent(clickInfo.event.extendedProps);
      setIsDialogOpen(true);
    };

    const renderEventContent = (eventInfo: any) => {
      const { responsible, location_lat, location_lng } = eventInfo.event.extendedProps;
      return (
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-1">
            <div className="font-bold truncate">{eventInfo.event.title}</div>
            {(location_lat && location_lng) && (
              <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-red-500" />
            )}
          </div>
          {responsible && (
            <div className="text-[8px] opacity-70 truncate flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-zinc-50" />
              {responsible.full_name}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Поиск мероприятий..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-50 font-bold italic"
              />
            </div>
          </div>
  
          <Button 
            onClick={() => { setSelectedEvent(null); setIsDialogOpen(true); }}
            className="bg-zinc-50 text-black hover:bg-zinc-200 font-black italic tracking-tighter"
          >
            <Plus className="w-5 h-5 mr-2" />
            НОВОЕ СОБЫТИЕ
          </Button>
        </div>
  
            <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-50" />
                </div>
              )}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-zinc-50 to-red-600 opacity-50" />
            <div className="calendar-container relative z-10">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={filteredEvents}
                select={handleDateSelect}

              eventClick={handleEventClick}
              eventContent={renderEventContent}
              locale={ruLocale}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
            />
          </div>
        </Card>

      <EventDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        event={selectedEvent}
        onSuccess={fetchEvents}
        currentUser={currentUser}
      />

      <style jsx global>{`
        .fc {
          --fc-border-color: #3f3f46 !important;
          --fc-button-bg-color: #09090b !important;
          --fc-button-border-color: #3f3f46 !important;
          --fc-button-hover-bg-color: #18181b !important;
          --fc-button-active-bg-color: #fafafa !important;
          --fc-button-active-text-color: #000000 !important;
          --fc-page-bg-color: transparent !important;
          --fc-today-bg-color: rgba(250, 250, 250, 0.08) !important;
          color: #fafafa !important;
          font-family: inherit !important;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid #3f3f46 !important;
        }
        .fc .fc-scrollgrid {
          border: 1px solid #3f3f46 !important;
        }
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-style: italic !important;
          letter-spacing: -0.05em !important;
        }
        .fc .fc-button {
          border-radius: 4px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 0.7rem !important;
          font-style: italic !important;
        }
        .fc-event {
          cursor: pointer !important;
          padding: 4px 6px !important;
          border-radius: 2px !important;
          font-weight: 800 !important;
          font-style: italic !important;
          text-transform: uppercase !important;
          font-size: 0.65rem !important;
          border: none !important;
        }
        .fc-daygrid-day-number {
          font-weight: 900 !important;
          font-size: 0.8rem !important;
          padding: 8px !important;
          font-style: italic !important;
        }
        .fc-col-header-cell-cushion {
          text-transform: uppercase !important;
          font-weight: 900 !important;
          font-size: 0.75rem !important;
          padding: 12px 10px !important;
          font-style: italic !important;
          color: #fafafa !important;
          letter-spacing: 0.05em !important;
        }
      `}</style>
    </div>
  );
}
