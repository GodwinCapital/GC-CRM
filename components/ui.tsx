import { clsx } from "clsx";
import Link from "next/link";
import { STAGE_SHORT_LABELS, STATUS_LABELS, SOURCE_TYPE_LABELS, TYPE_LABELS } from "@/lib/taxonomy";
import type { DealStage, DealStatus, DealType, SourceType } from "@prisma/client";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
        variant === "secondary" &&
          "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800",
        variant === "danger" && "bg-red-500/90 text-white hover:bg-red-500",
        variant === "ghost" && "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
        variant === "secondary" &&
          "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800",
        variant === "ghost" && "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        className
      )}
    >
      {children}
    </Link>
  );
}

const STATUS_COLORS: Record<DealStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  ON_HOLD: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  DEAD: "bg-red-500/10 text-red-400 ring-red-500/30",
  EXECUTED: "bg-sky-500/10 text-sky-400 ring-sky-500/30",
};

export function StatusBadge({ status }: { status: DealStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
      {STAGE_SHORT_LABELS[stage]}
    </span>
  );
}

export function TypeBadge({ type }: { type: DealType | null }) {
  if (!type) return <span className="text-slate-600">—</span>;
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
      {TYPE_LABELS[type]}
    </span>
  );
}

export function SourceTypeBadge({ type }: { type: SourceType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
      {SOURCE_TYPE_LABELS[type]}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-16 text-center">
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50";
export const selectClass = inputClass;
export const textareaClass = clsx(inputClass, "min-h-[90px] resize-y");
