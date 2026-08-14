"use client";

import { useState } from "react";
import {
  STAGE_ORDER,
  STAGE_LABELS,
  STATUS_ORDER,
  STATUS_LABELS,
  TYPE_ORDER,
  TYPE_LABELS,
  SOURCE_TYPE_ORDER,
  SOURCE_TYPE_LABELS,
  INDUSTRY_TAXONOMY,
  PRIMARY_INDUSTRIES,
} from "@/lib/taxonomy";
import { Field, Button, inputClass, selectClass, textareaClass } from "@/components/ui";
import type { DealStage, DealStatus, DealType, SourceType } from "@prisma/client";

export type DealFormValues = {
  projectName?: string | null;
  companyName?: string | null;
  hq?: string | null;
  website?: string | null;
  description?: string | null;
  stage?: DealStage;
  status?: DealStatus;
  type?: DealType | null;
  sourceName?: string | null;
  sourceType?: SourceType | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  dateReceived?: string;
  primaryIndustry?: string | null;
  secondaryIndustry?: string | null;
  enterpriseValue?: number | null;
  revenue?: number | null;
  ebitda?: number | null;
  nextStep?: string | null;
  primaryOwnerId?: string | null;
  secondaryOwnerId?: string | null;
  reasonForPass?: string | null;
};

export function DealForm({
  action,
  initial,
  users,
  sourceNames,
  submitLabel = "Save Deal",
}: {
  action: (formData: FormData) => void;
  initial?: DealFormValues;
  users: { id: string; name: string; initials: string }[];
  sourceNames: string[];
  submitLabel?: string;
}) {
  const [primaryIndustry, setPrimaryIndustry] = useState(initial?.primaryIndustry ?? "");
  const [status, setStatus] = useState<DealStatus>(initial?.status ?? "ACTIVE");
  const secondaryOptions = INDUSTRY_TAXONOMY[primaryIndustry] ?? [];

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Project Name" htmlFor="projectName">
          <input
            id="projectName"
            name="projectName"
            defaultValue={initial?.projectName ?? ""}
            placeholder="Project Codename"
            className={inputClass}
          />
        </Field>
        <Field label="Company Name" htmlFor="companyName">
          <input
            id="companyName"
            name="companyName"
            defaultValue={initial?.companyName ?? ""}
            placeholder="Target company (if known)"
            className={inputClass}
          />
        </Field>
        <Field label="Headquarters" htmlFor="hq">
          <input id="hq" name="hq" defaultValue={initial?.hq ?? ""} className={inputClass} />
        </Field>
        <Field label="Website" htmlFor="website">
          <input
            id="website"
            name="website"
            defaultValue={initial?.website ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ""}
          className={textareaClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Stage" htmlFor="stage">
          <select id="stage" name="stage" defaultValue={initial?.stage ?? "INTRO_TEASER"} className={selectClass}>
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "ACTIVE"}
            onChange={(e) => setStatus(e.target.value as DealStatus)}
            className={selectClass}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deal Type" htmlFor="type">
          <select id="type" name="type" defaultValue={initial?.type ?? ""} className={selectClass}>
            <option value="">—</option>
            {TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Primary Industry" htmlFor="primaryIndustry">
          <select
            id="primaryIndustry"
            name="primaryIndustry"
            value={primaryIndustry}
            onChange={(e) => setPrimaryIndustry(e.target.value)}
            className={selectClass}
          >
            <option value="">—</option>
            {PRIMARY_INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Secondary Industry" htmlFor="secondaryIndustry">
          <select
            id="secondaryIndustry"
            name="secondaryIndustry"
            defaultValue={initial?.secondaryIndustry ?? ""}
            className={selectClass}
            disabled={secondaryOptions.length === 0}
          >
            <option value="">—</option>
            {secondaryOptions.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Source / Referral Name" htmlFor="sourceName">
          <input
            id="sourceName"
            name="sourceName"
            list="source-suggestions"
            defaultValue={initial?.sourceName ?? ""}
            placeholder="e.g. Braemont Capital"
            className={inputClass}
          />
          <datalist id="source-suggestions">
            {sourceNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>
        <Field label="Referral Type" htmlFor="sourceType">
          <select id="sourceType" name="sourceType" defaultValue={initial?.sourceType ?? "SPONSOR"} className={selectClass}>
            {SOURCE_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {SOURCE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Primary Contact" htmlFor="contactName">
          <input
            id="contactName"
            name="contactName"
            defaultValue={initial?.contactName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Contact Email" htmlFor="contactEmail">
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={initial?.contactEmail ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Contact Phone" htmlFor="contactPhone">
          <input
            id="contactPhone"
            name="contactPhone"
            defaultValue={initial?.contactPhone ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Primary Owner" htmlFor="primaryOwnerId">
          <select
            id="primaryOwnerId"
            name="primaryOwnerId"
            defaultValue={initial?.primaryOwnerId ?? ""}
            className={selectClass}
          >
            <option value="">—</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.initials})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Secondary Owner" htmlFor="secondaryOwnerId">
          <select
            id="secondaryOwnerId"
            name="secondaryOwnerId"
            defaultValue={initial?.secondaryOwnerId ?? ""}
            className={selectClass}
          >
            <option value="">—</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.initials})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Field label="Date Received" htmlFor="dateReceived">
          <input
            id="dateReceived"
            name="dateReceived"
            type="date"
            defaultValue={initial?.dateReceived ?? new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>
        <Field label="Enterprise Value ($mm)" htmlFor="enterpriseValue">
          <input
            id="enterpriseValue"
            name="enterpriseValue"
            type="number"
            step="0.1"
            defaultValue={initial?.enterpriseValue ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Revenue ($mm)" htmlFor="revenue">
          <input
            id="revenue"
            name="revenue"
            type="number"
            step="0.1"
            defaultValue={initial?.revenue ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="EBITDA ($mm)" htmlFor="ebitda">
          <input
            id="ebitda"
            name="ebitda"
            type="number"
            step="0.1"
            defaultValue={initial?.ebitda ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Next Step" htmlFor="nextStep">
        <input
          id="nextStep"
          name="nextStep"
          defaultValue={initial?.nextStep ?? ""}
          className={inputClass}
        />
      </Field>

      {status === "DEAD" && (
        <Field label="Reason for Pass" htmlFor="reasonForPass">
          <textarea
            id="reasonForPass"
            name="reasonForPass"
            defaultValue={initial?.reasonForPass ?? ""}
            className={textareaClass}
            placeholder="Why did we pass on this deal?"
          />
        </Field>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
