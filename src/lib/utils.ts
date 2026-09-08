export type InternalStatus = "todo" | "doing" | "done";

export const statusLabels: Record<InternalStatus, string> = {
  todo: "Fazer",
  doing: "Fazendo",
  done: "Feito",
};

export function isOverdue(date: Date | null, status: InternalStatus) {
  return Boolean(date && status !== "done" && date < new Date(new Date().toDateString()));
}

export function isDueSoon(date: Date | null, status: InternalStatus) {
  if (!date || status === "done") return false;
  const today = new Date(new Date().toDateString()).getTime();
  const target = new Date(date.toDateString()).getTime();
  return target >= today && target - today <= 2 * 86_400_000;
}

export function formatDate(date: Date | null | undefined) {
  return date ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date) : "No target";
}

export function labelTextColor(color?: string) {
  const hex = color?.replace("#", "");
  if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return "#000000";
  const [red, green, blue] = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  return (red * 0.299 + green * 0.587 + blue * 0.114) < 150 ? "#ffffff" : "#000000";
}

export function deadlineLabel(date: Date) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const difference = Math.round((target - today) / 86_400_000);
  if (difference < 0) return `Vencida — ${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(date)}`;
  if (difference === 0) return "Hoje";
  if (difference === 1) return "Amanhã";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(date);
}
