"use client";

import { useState, useEffect } from "react";
import { createClientClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Send, Paperclip } from "lucide-react";

export function Comments({ eventId, currentUser }: { eventId: string, currentUser: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientClient();

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profile:profiles(full_name, avatar_url)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  useEffect(() => {
    fetchComments();

    const subscription = supabase
      .channel(`comments_${eventId}`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "comments", 
        filter: `event_id=eq.${eventId}` 
      }, () => fetchComments())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, supabase]);

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("comments").insert([
      {
        event_id: eventId,
        user_id: currentUser.id,
        content: newComment.trim(),
      }
    ]);

    if (!error) setNewComment("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[400px] border-t border-zinc-800 mt-6 pt-6 bg-zinc-900/50 p-4 rounded-lg">
      <h3 className="text-lg font-black uppercase italic mb-4 tracking-tighter text-zinc-400">Обсуждение</h3>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start group">
              <Avatar className="w-8 h-8 rounded border border-zinc-700">
                <AvatarImage src={comment.profile?.avatar_url} />
                <AvatarFallback className="bg-zinc-800 text-[10px] font-black">
                  {comment.profile?.full_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase italic text-zinc-100">{comment.profile?.full_name}</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ru })}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-1 leading-snug font-medium italic">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-12 text-zinc-600 uppercase text-[10px] font-black tracking-[0.2em] italic">
              Тишина на канале
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2 items-center">
        <div className="relative flex-1">
          <Input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ваша реплика..."
            className="bg-zinc-950 border-zinc-800 pr-10 font-bold italic text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-transparent text-zinc-600"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={loading || !newComment.trim()}
          className="bg-zinc-50 text-black hover:bg-zinc-200"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
