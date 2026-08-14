import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, PageHeader, Button } from "@/components/ui";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; skipped?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/settings");

  const { created, updated, skipped, error } = await searchParams;
  const hasResult = created !== undefined || updated !== undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Import from Excel" description="Bulk-load or refresh deals from a spreadsheet export." />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {hasResult && !error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 size={16} />
          {created} created, {updated} updated, {skipped} skipped.
        </div>
      )}

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-white">Upload a file</h2>
        <p className="mb-4 text-sm text-slate-400">
          Accepts <code className="rounded bg-slate-800 px-1 py-0.5">.xlsx</code> files with a table
          containing at least <strong>Company Name</strong> and <strong>Stage</strong> columns,
          matching the firm&apos;s deal pipeline export format (Project Name, Company Name, HQ,
          Description, Website, Stage, Status, Source / Referral, Referral Type, Primary Contact,
          Type, Date Received, Primary Industry, Secondary Industry, Enterprise Value, Revenue,
          EBITDA, Next Step, Primary Owner, Secondary Owner, Reason for Pass). Existing deals are
          matched by Project Name + Company Name and updated in place; everything else is created
          as a new deal. Owners are matched by initials against existing team members.
        </p>
        <form action="/api/import" method="post" encType="multipart/form-data" className="space-y-4">
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls"
            required
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-emerald-400"
          />
          <Button type="submit">Upload &amp; Import</Button>
        </form>
      </Card>
    </div>
  );
}
