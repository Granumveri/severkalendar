"use client";

import { useState } from "react";
import { createClientClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            data: { 
              full_name: email.split('@')[0], 
              role: 'participant', 
              username: email.split('@')[0] 
            } 
          } 
        }) 
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-50">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1766477877834-019b4a48-7d31-7199-bc46-cf40fc6e5966-1766478382380.png?width=8000&height=8000&resize=contain")' }}
        />
        <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[1px]" />
        
        <div className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <CalendarIcon className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Северный человек</h1>
          <p className="text-sm tracking-[0.4em] text-zinc-500 font-bold -mt-1 uppercase">Календарь</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden text-zinc-50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-white to-red-600" />
          
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold italic uppercase">
              {isSignUp ? "РЕГИСТРАЦИЯ" : "ВХОД В СИСТЕМУ"}
            </CardTitle>
            <CardDescription className="text-zinc-500 font-medium">
              {isSignUp ? "Создайте аккаунт для доступа к календарю" : "Введите свои данные для авторизации"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="uppercase font-bold text-xs tracking-widest text-zinc-400">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="north@man.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800 text-zinc-50 focus:ring-zinc-50 focus:border-zinc-50 font-bold italic"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="uppercase font-bold text-xs tracking-widest text-zinc-400">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800 text-zinc-50 focus:ring-zinc-50 focus:border-zinc-50 font-bold italic"
                  required 
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-black py-2 uppercase italic tracking-tighter">Ошибка: {error}</p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-zinc-50 text-black hover:bg-zinc-200 font-black py-6 text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] italic"
              >
                {loading ? "ЗАГРУЗКА..." : (isSignUp ? "СОЗДАТЬ АККАУНТ" : "ВОЙТИ")}
              </Button>

              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-xs text-zinc-500 hover:text-zinc-50 font-bold uppercase tracking-widest transition-colors underline decoration-dotted"
              >
                {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
              </button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-12 flex justify-between items-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] italic">
          <span>© 2025 СЕВЕРНЫЙ ЧЕЛОВЕК</span>
          <span>ЕДИНСТВО • СИЛА • ДУХ</span>
        </div>
      </div>
    </div>
  );
}
