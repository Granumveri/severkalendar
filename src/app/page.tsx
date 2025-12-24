"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CalendarIcon, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import { AuthForm } from "@/components/AuthForm";

import type { User } from "@supabase/supabase-js";

const CalendarApp = dynamic(() => import("@/components/CalendarApp").then(mod => mod.CalendarApp), {
  ssr: false,
  loading: () => <div className="animate-pulse text-zinc-500">Загрузка календаря...</div>
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Unexpected error in getUser:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1766477877834-019b4a48-7d31-7199-bc46-cf40fc6e5966-1766481191293.png?width=8000&height=8000&resize=contain")' }}
        />
        <div className="animate-pulse text-2xl font-bold text-white uppercase italic tracking-tighter relative z-10">Северный человек...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <main className="min-h-screen text-zinc-50 font-sans relative bg-zinc-950">
      <div 
        className="fixed inset-0 opacity-10 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1766477877834-019b4a48-7d31-7199-bc46-cf40fc6e5966-1766481191293.png?width=8000&height=8000&resize=contain")' }}
      />
      <div className="relative z-10">
        <header className="border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-zinc-50 rounded flex items-center justify-center">
              <CalendarIcon className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase italic">Северный человек</h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-[0.2em] -mt-1">КАЛЕНДАРЬ ГРУППЫ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold uppercase italic">{user.user_metadata?.full_name || user.email}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{user.user_metadata?.role || 'Участник'}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <CalendarApp currentUser={user} />
      </div>
    </div>
    </main>
  );
}
