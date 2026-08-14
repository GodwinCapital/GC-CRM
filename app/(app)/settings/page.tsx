import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createUserAction, deleteUserAction, createTagAction, deleteTagAction } from "./actions";
import { Card, PageHeader, Button, Field, inputClass, selectClass, LinkButton } from "@/components/ui";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Trash2, Upload } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const [users, tags] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.passReasonTag.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your account, team, and pipeline configuration." />

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-white">My Account</h2>
        <p className="mb-4 text-sm text-slate-400">
          Signed in as {session?.user.name} ({session?.user.email})
        </p>
        <ChangePasswordForm />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Data Import</h2>
        </div>
        <p className="mb-3 text-sm text-slate-400">
          Bulk-import or update deals from an Excel export matching the firm&apos;s deal pipeline format.
        </p>
        <LinkButton href="/settings/import" variant="secondary">
          <Upload size={15} /> Import from Excel
        </LinkButton>
      </Card>

      {isAdmin && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-white">Team</h2>
          <div className="mb-4 space-y-2">
            {users.map((u) => {
              const boundDelete = deleteUserAction.bind(null, u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {u.name} <span className="text-slate-500">({u.initials})</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {u.email} · {u.role}
                    </p>
                  </div>
                  {u.id !== session?.user.id && (
                    <form action={boundDelete}>
                      <button type="submit" className="text-slate-600 hover:text-red-400" aria-label="Remove user">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>

          <form action={createUserAction} className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <input id="name" name="name" required className={inputClass} />
            </Field>
            <Field label="Initials" htmlFor="initials">
              <input id="initials" name="initials" required maxLength={4} className={inputClass} />
            </Field>
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" required className={inputClass} />
            </Field>
            <Field label="Temporary Password" htmlFor="password">
              <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
            </Field>
            <Field label="Role" htmlFor="role">
              <select id="role" name="role" defaultValue="MEMBER" className={selectClass}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" variant="secondary" className="w-full justify-center">
                Add Team Member
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-white">Pass Reason Tags</h2>
        <p className="mb-3 text-xs text-slate-500">
          Tags used to categorize why deals were passed on, for the dashboard analytics.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((t) => {
            const boundDelete = deleteTagAction.bind(null, t.id);
            return (
              <form key={t.id} action={boundDelete}>
                <button
                  type="submit"
                  className="group flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300 hover:border-red-500/50 hover:text-red-400"
                >
                  {t.label}
                  <Trash2 size={11} className="opacity-0 group-hover:opacity-100" />
                </button>
              </form>
            );
          })}
        </div>
        <form action={createTagAction} className="flex gap-2">
          <input name="label" required placeholder="New tag label" className={inputClass} />
          <Button type="submit" variant="secondary">
            Add Tag
          </Button>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-600">
        Need to see your data raw? Try <Link href="/api/deals/export" className="underline">exporting all deals to CSV</Link>.
      </p>
    </div>
  );
}
