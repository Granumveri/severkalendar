"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEventNotification({ 
  to, 
  subject, 
  title, 
  description, 
  startTime, 
  location 
}: { 
  to: string; 
  subject: string; 
  title: string; 
  description?: string; 
  startTime: string; 
  location?: string; 
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email notification skipped.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Календарь Северный Человек <notifications@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 20px; border: 1px solid #333;">
          <h1 style="text-transform: uppercase; font-style: italic;">Северный Человек</h1>
          <h2 style="color: #ff0000;">${subject}</h2>
          <hr style="border-color: #333;" />
          <p><strong>Событие:</strong> ${title}</p>
          <p><strong>Начало:</strong> ${new Date(startTime).toLocaleString('ru-RU')}</p>
          ${location ? `<p><strong>Место:</strong> ${location}</p>` : ''}
          ${description ? `<p><strong>Описание:</strong> ${description}</p>` : ''}
          <br />
          <p style="font-size: 12px; color: #666;">Это автоматическое уведомление от системы Календарь.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}
