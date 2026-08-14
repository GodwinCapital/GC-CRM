"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DealForm, type DealFormValues } from "@/components/deal-form";
import { Button, Card, StageBadge, StatusBadge, TypeBadge } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/format";
import type { DealStage, DealStatus, DealType } from "@prisma/client";

type DealSummary = {
  id: string;
  projectName: string | null;
  companyName: string | null;
  hq: string | null;
  website: string | null;
  description: string | null;
  stage: DealStage;
  status: DealStatus;
  type: DealType | null;
  primaryIndustry: string | null;
  secondaryIndustry: string | null;
  enterpriseValue: number | null;
  revenue: number | null;
  ebitda: number | null;
  nextStep: string | null;
  dateReceived: Date;
  source: { name: string } | null;
  primaryContact: { name: string; email: string | null; phone: string | null } | null;
  primaryOwner: { id: string; name: string; initials: string } | null;
  secondaryOwner: { id: string; name: string; initials: string } | null;
};

export function DealDetailPanel({
  deal,
  formInitial,
  updateAction,
  users,
  sourceNames,
}: {
  deal: DealSummary;
  formInitial: DealFormValues;
  updateAction: (formData: FormData) => void;
  users: { id: string; name: string; initials: string }[];
  sourceNames: string[];
}) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  if (editing) {
    return (
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Edit Deal</h2>
          <Button variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        <DealForm
          action={async (formData) => {
            await updateAction(formData);
            setEditing(false);
            router.refresh();
          }}
          initial={formInitial}
          users={users}
          sourceNames={sourceNames}
          submitLabel="Save Changes"
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <StageBadge stage={deal.stage} />
          <StatusBadge status={deal.status} />
          <TypeBadge type={deal.type} />
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>

      {deal.description && <p className="mb-4 text-sm text-slate-300">{deal.description}</p>}

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <Info label="Headquarters" value={deal.hq} />
        <Info label="Website" value={deal.website} />
        <Info label="Primary Industry" value={deal.primaryIndustry} />
        <Info label="Secondary Industry" value={deal.secondaryIndustry} />
        <Info label="Source / Referral" value={deal.source?.name} />
        <Info
          label="Primary Contact"
          value={
            deal.primaryContact
              ? `${deal.primaryContact.name}${deal.primaryContact.email ? ` · ${deal.primaryContact.email}` : ""}`
              : null
          }
        />
        <Info label="Enterprise Value" value={formatMoney(deal.enterpriseValue)} />
        <Info label="Revenue" value={formatMoney(deal.revenue)} />
        <Info label="EBITDA" value={formatMoney(deal.ebitda)} />
        <Info label="Date Received" value={formatDate(deal.dateReceived)} />
        <Info
          label="Primary Owner"
          value={deal.primaryOwner ? `${deal.primaryOwner.name} (${deal.primaryOwner.initials})` : null}
        />
        <Info
          label="Secondary Owner"
          value={deal.secondaryOwner ? `${deal.secondaryOwner.name} (${deal.secondaryOwner.initials})` : null}
        />
        <Info label="Next Step" value={deal.nextStep} className="sm:col-span-2" />
      </dl>
    </Card>
  );
}

function Info({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value || "—"}</dd>
    </div>
  );
}
