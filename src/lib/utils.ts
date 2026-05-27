import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score <= 30) return "text-cyber-green";
  if (score <= 60) return "text-cyber-yellow";
  return "text-cyber-red";
}

export function getScoreLabel(score: number): string {
  if (score <= 30) return "AMAN";
  if (score <= 60) return "CURIGA";
  if (score <= 80) return "RISIKO TINGGI";
  return "PENIPUAN SANGAT MUNGKIN";
}
