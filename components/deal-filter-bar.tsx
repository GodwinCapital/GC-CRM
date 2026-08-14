"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import {
  STAGE_ORDER,
  STAGE_LABELS,
  STATUS_ORDER,
  STATUS_LABELS,
  TYPE_ORDER,
  TYPE_LABELS,
  PRIMARY_INDUSTRIES,
} from "@/lib/taxonomy";
import { selectClass, inputClass } from "@/components/ui";

export function DealFilterBar({
  owners,
  sources,
}: {
  owners: { id: string; name: string }[];
  sources: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => router.push(`${pathname}?${next.toString()}`));
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => set("q", e.target.value)}
        placeholder="Search deals..."
        className={`${inputClass} w-56`}
      />
      <select
        defaultValue={searchParams.get("stage") ?? ""}
        onChange={(e) => set("stage", e.target.value)}
        className={`${selectClass} w-auto`}
      >
        <option value="">All Stages</option>
        {STAGE_ORDER.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => set("status", e.target.value)}
        className={`${selectClass} w-auto`}
      >
        <option value="">All Statuses</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("type") ?? ""}
        onChange={(e) => set("type", e.target.value)}
        className={`${selectClass} w-auto`}
      >
        <option value="">All Types</option>
        {TYPE_ORDER.map((t) => (
          <option key={t} value={t}>
            {TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("industry") ?? ""}
        onChange={(e) => set("industry", e.target.value)}
        className={`${selectClass} w-auto`}
      >
        <option value="">All Industries</option>
        {PRIMARY_INDUSTRIES.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("owner") ?? ""}
        onChange={(e) => set("owner", e.target.value)}
        className={`${selectClass} w-auto`}
      >
        <option value="">All Owners</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("source") ?? ""}
        onChange={(e) => set("source", e.target.value)}
        className={`${selectClass} w-auto`}
      >
        <option value="">All Sources</option>
        {sources.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {searchParams.toString() && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
