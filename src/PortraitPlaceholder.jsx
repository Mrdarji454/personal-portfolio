import { useId } from "react";

export function PortraitPlaceholder({ className = "profile-image" }) {
  const id = useId().replace(/:/g, "");
  return <svg className={className} role="img" aria-label="Illustrated portrait placeholder; replaceable with a real photo" width="600" height="720" viewBox="0 0 600 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`${id}-bg`} x2="1" y2="1"><stop stopColor="var(--portrait-bg)" /><stop offset="1" stopColor="var(--portrait-end)" /></linearGradient>
      <linearGradient id={`${id}-shirt`} x2="1" y2="1"><stop stopColor="var(--portrait-shirt)" /><stop offset="1" stopColor="var(--bg)" /></linearGradient>
    </defs>
    <rect width="600" height="720" rx="160" fill={`url(#${id}-bg)`} />
    <circle cx="300" cy="297" r="190" fill="none" stroke="var(--portrait-ink)" opacity=".4" />
    <circle cx="300" cy="297" r="225" fill="none" stroke="var(--portrait-ink)" opacity=".2" />
    <path d="M85 720v-122c0-104 88-157 215-157s215 53 215 157v122" fill={`url(#${id}-shirt)`} />
    <path d="M258 365v85q42 45 84 0v-85" fill="#ba9b7a" />
    <ellipse cx="300" cy="283" rx="104" ry="132" fill="#d4b38d" />
    <path d="M193 295v-88c0-91 68-133 126-127 72 7 111 57 106 139l-11 87-25-83c-77 12-112-18-125-38-5 40-32 58-47 64z" fill="var(--portrait-shirt)" />
    <path d="M261 335q40 13 78 0" fill="none" stroke="#aa8869" strokeWidth="5" strokeLinecap="round" />
    <path d="M216 500l84 43 84-43" fill="none" stroke="var(--portrait-ink)" opacity=".4" strokeWidth="3" />
    <text x="300" y="653" textAnchor="middle" fontFamily="Georgia,serif" fontSize="57" fill="var(--portrait-ink)">md.</text>
    <text x="300" y="687" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="3" fill="var(--portrait-ink)">PORTRAIT PLACEHOLDER</text>
    <path d="M484 95v40m-20-20h40" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
  </svg>;
}
