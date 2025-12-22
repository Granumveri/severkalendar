"use client";

import { useState, useEffect } from "react";
import { createClientClient } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { MapPin, Trash2, User } from "lucide-react";
import { Comments } from "@/components/Comments";
import { sendEventNotification } from "@/app/actions/notifications";

export function EventDialog({ isOpen, onOpenChange, event, onSuccess, currentUser }: any) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("meeting");
  const [responsibleId, setResponsibleId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const supabase = createClientClient();

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email");
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, [supabase]);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStartTime(event.start_time ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm") : "");
      setEndTime(event.end_time ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm") : "");
      setLocation(event.location || "");
      setCategory(event.category || "meeting");
      setResponsibleId(event.responsible_id || null);
    } else {
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setCategory("meeting");
      setResponsibleId(currentUser.id);
    }
  }, [event, isOpen, currentUser.id]);

  const handleSave = async () => {
    if (!title || !startTime || !endTime) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setLoading(true);
    const eventData: any = {
      title,
      description,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      location,
      category,
      owner_id: currentUser.id,
      responsible_id: responsibleId,
      updated_at: new Date().toISOString(),
    };

    let error;
    let savedEvent;
    if (event?.id) {
      const { data, error: err } = await supabase.from("events").update(eventData).eq("id", event.id).select().single();
      error = err;
      savedEvent = data;
    } else {
      const { data, error: err } = await supabase.from("events").insert([eventData]).select().single();
      error = err;
      savedEvent = data;
    }

    if (error) {
      toast.error("Ошибка сохранения: " + error.message);
    } else {
      toast.success("Событие сохранено");
      
      // Notify responsible person
      if (responsibleId) {
        const responsibleProfile = profiles.find(p => p.id === responsibleId);
        if (responsibleProfile?.email) {
          await sendEventNotification({
            to: responsibleProfile.email,
            subject: event?.id ? 'Изменение мероприятия' : 'Новое мероприятие',
            title,
            description,
            startTime,
            location
          });
        }
      }

      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Удалить это событие из календаря?")) return;
    setLoading(true);
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) {
      toast.error("Ошибка удаления: " + error.message);
    } else {
      toast.success("Событие удалено");
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-zinc-50 to-red-600" />
        
        <div className="p-8 space-y-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black italic uppercase italic tracking-tighter">
              {event?.id ? "Редактирование" : "Новая запись"}
            </DialogTitle>
          </DialogHeader>

            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Заголовок</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800 font-bold italic h-12 text-lg"
                    placeholder="Название мероприятия..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Ответственный</Label>
                  <Select value={responsibleId || ""} onValueChange={setResponsibleId}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 font-bold italic h-12">
                      <SelectValue placeholder="Выберите ответственного" />
                    </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50 font-bold italic">
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.full_name || 'Без имени'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {responsibleId && profiles.find(p => p.id === responsibleId)?.email && (
                      <div className="mt-1">
                        <a 
                          href={`mailto:${profiles.find(p => p.id === responsibleId).email}`}
                          className="text-[10px] text-red-500 hover:text-red-400 font-bold flex items-center gap-1 uppercase"
                        >
                          Связаться по почте
                        </a>
                      </div>
                    )}
                  </div>

              </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Начало</Label>
                <Input 
                  type="datetime-local" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800 font-bold italic"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Конец</Label>
                <Input 
                  type="datetime-local" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800 font-bold italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 font-bold italic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50 font-bold italic">
                    <SelectItem value="meeting">ВСТРЕЧА</SelectItem>
                    <SelectItem value="deadline">СРОЧНО</SelectItem>
                    <SelectItem value="vacation">ОТПУСК</SelectItem>
                    <SelectItem value="other">ПРОЧЕЕ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Локация</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="pl-10 bg-zinc-950 border-zinc-800 font-bold italic"
                    placeholder="Место встречи..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500">Описание</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="bg-zinc-950 border-zinc-800 min-h-[100px] font-bold italic text-zinc-400"
                placeholder="Дополнительные детали..."
              />
            </div>
          </div>

          {event?.id && (
            <Comments eventId={event.id} currentUser={currentUser} />
          )}
        </div>

        <DialogFooter className="p-8 pt-0 flex justify-between items-center bg-zinc-900/50">
          <div>
            {event?.id && (
              <Button 
                variant="ghost" 
                onClick={handleDelete} 
                className="text-red-600 hover:text-red-500 hover:bg-red-600/10 font-black italic uppercase text-xs"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800 font-black italic uppercase text-xs">Отмена</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-zinc-50 text-black font-black italic uppercase text-xs px-8">
              {loading ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
