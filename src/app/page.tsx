"use client";

import { useEffect, useState } from "react";
import { createClientClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CalendarIcon, LogOut } from "lucide-react";
import { CalendarApp } from "@/components/CalendarApp";
import { AuthForm } from "@/components/AuthForm";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-2xl font-bold text-white uppercase italic tracking-tighter">Северный человек...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
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
              onClick={() => supabase.auth.signOut()}
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
    </main>
  );
}
