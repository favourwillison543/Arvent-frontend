// lib/utils/dates.ts

export function formatEventDate(
    date: string,
    timezone?: string,
  ): string {
    const eventDate = new Date(date);
  
    return new Intl.DateTimeFormat("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(eventDate);
  }
  
  export function formatShortDate(
    date: string,
    timezone?: string,
  ): string {
    const eventDate = new Date(date);
  
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(eventDate);
  }
  
  export function formatTime(
    time: string,
    timezone?: string,
  ): string {
    const value = new Date(time);
  
    return new Intl.DateTimeFormat("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(value);
  }
  
  export function formatDateTime(
    date: string,
    timezone?: string,
  ): string {
    const value = new Date(date);
  
    return new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(value);
  }
  
  export function isPastDate(date: string): boolean {
    return new Date(date).getTime() < Date.now();
  }