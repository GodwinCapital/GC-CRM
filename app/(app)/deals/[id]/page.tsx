import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateDealAction,
  deleteDealAction,
  addActivityAction,
  addTaskAction,
  toggleTaskAction,
  deleteTaskAction,
  setPassReasonTagsAction,
} from "@/lib/deal-actions";
import { DealDetailPanel } from "@/components/deal-detail-panel";
import { Card, PageHeader, Button, inputClass, selectClass, textareaClass } from "@/components/ui";
import { dealDisplayName, formatDate } from "@/lib/format";
import { SOURCE_TYPE_LABELS } from "@/lib/taxonomy";
import { Trash2, MessageSquare, Phone, Mail, Users as UsersIcon, Zap } from "lucide-react";

const ACTIVITY_ICON = {
  NOTE: MessageSquare,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: UsersIcon,
  STAGE_CHANGE: Zap,
  STATUS_CHANGE: Zap,
  SYSTEM: Zap,
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [deal, users, sourcesRaw, tags] = await Promise.all([
    prisma.deal.findUnique({
      where: { id },
      include: {
        source: true,
        primaryContact: true,
        primaryOwner: true,
        secondaryOwner: true,
        activities: { include: { author: true }, orderBy: { createdAt: "desc" } },
        tasks: { include: { assignee: true }, orderBy: [{ completed: "asc" }, { dueDate: "asc" }] },
        passReasonTags: { include: { tag: true } },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.source.findMany({ select: { name: true }, distinct: ["name"], orderBy: { name: "asc" } }),
    prisma.passReasonTag.findMany({ orderBy: { label: "asc" } }),
  ]);

  if (!deal) notFound();

  const boundUpdate = updateDealAction.bind(null, deal.id);
  const boundDelete = deleteDealAction.bind(null, deal.id);
  const boundAddActivity = addActivityAction.bind(null, deal.id);
  const boundAddTask = addTaskAction.bind(null, deal.id);

  async function updateTags(formData: FormData) {
    "use server";
    const tagIds = formData.getAll("tagIds") as string[];
    await setPassReasonTagsAction(id, tagIds);
  }

  const activeTagIds = new Set(deal.passReasonTags.map((t) => t.tagId));

  return (
    <div>
      <PageHeader
        title={dealDisplayName(deal)}
        description={deal.projectName && deal.companyName ? deal.projectName : undefined}
        actions={
          <form action={boundDelete}>
            <Button type="submit" variant="danger">
              <Trash2 size={15} /> Delete
            </Button>
          </form>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DealDetailPanel
            deal={deal}
            formInitial={{
              projectName: deal.projectName,
              companyName: deal.companyName,
              hq: deal.hq,
              website: deal.website,
              description: deal.description,
              stage: deal.stage,
              status: deal.status,
              type: deal.type,
              sourceName: deal.source?.name,
              sourceType: deal.referralType,
              contactName: deal.primaryContact?.name,
              contactEmail: deal.primaryContact?.email,
              contactPhone: deal.primaryContact?.phone,
              dateReceived: deal.dateReceived.toISOString().slice(0, 10),
              primaryIndustry: deal.primaryIndustry,
              secondaryIndustry: deal.secondaryIndustry,
              enterpriseValue: deal.enterpriseValue,
              revenue: deal.revenue,
              ebitda: deal.ebitda,
              nextStep: deal.nextStep,
              primaryOwnerId: deal.primaryOwnerId,
              secondaryOwnerId: deal.secondaryOwnerId,
              reasonForPass: deal.reasonForPass,
            }}
            updateAction={boundUpdate}
            users={users}
            sourceNames={sourcesRaw.map((s) => s.name)}
          />

          {deal.status === "DEAD" && (
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">Pass Reason Tags</h2>
              <p className="mb-3 text-xs text-slate-500">
                Tag why we passed so it shows up in the dashboard analytics.
              </p>
              <form action={updateTags} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 has-checked:border-emerald-500 has-checked:bg-emerald-500/10 has-checked:text-emerald-700 dark:has-checked:text-emerald-400"
                    >
                      <input
                        type="checkbox"
                        name="tagIds"
                        value={tag.id}
                        defaultChecked={activeTagIds.has(tag.id)}
                        className="hidden"
                      />
                      {tag.label}
                    </label>
                  ))}
                </div>
                <Button type="submit" variant="secondary">
                  Save Tags
                </Button>
              </form>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Activity Timeline</h2>
            <form action={boundAddActivity} className="mb-5 space-y-2">
              <textarea
                name="content"
                required
                placeholder="Log a call, email, meeting, or note..."
                className={textareaClass}
              />
              <div className="flex items-center justify-between gap-2">
                <select name="type" defaultValue="NOTE" className={`${selectClass} w-auto`}>
                  <option value="NOTE">Note</option>
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                </select>
                <Button type="submit" variant="secondary">
                  Log Activity
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {deal.activities.length === 0 && (
                <p className="text-sm text-slate-500">No activity logged yet.</p>
              )}
              {deal.activities.map((a) => {
                const Icon = ACTIVITY_ICON[a.type];
                return (
                  <div key={a.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{a.content}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {a.author?.name ?? "System"} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tasks / Next Steps</h2>
            <form action={boundAddTask} className="mb-4 space-y-2">
              <input name="title" required placeholder="Task title" className={inputClass} />
              <div className="flex gap-2">
                <input name="dueDate" type="date" className={inputClass} />
                <select name="assigneeId" className={selectClass} defaultValue={deal.primaryOwnerId ?? ""}>
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.initials}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="secondary" className="w-full justify-center">
                Add Task
              </Button>
            </form>

            <div className="space-y-2">
              {deal.tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
              {deal.tasks.map((t) => {
                const toggle = toggleTaskAction.bind(null, t.id, deal.id, !t.completed);
                const remove = deleteTaskAction.bind(null, t.id, deal.id);
                return (
                  <div
                    key={t.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <form action={toggle}>
                        <button
                          type="submit"
                          className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${
                            t.completed ? "border-emerald-500 bg-emerald-500" : "border-slate-600"
                          }`}
                          aria-label="Toggle complete"
                        />
                      </form>
                      <div>
                        <p className={`text-sm ${t.completed ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.assignee?.initials ?? "Unassigned"}
                          {t.dueDate ? ` · Due ${formatDate(t.dueDate)}` : ""}
                        </p>
                      </div>
                    </div>
                    <form action={remove}>
                      <button type="submit" className="text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400" aria-label="Delete task">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </Card>

          {deal.source && (
            <Card>
              <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Source</h2>
              <p className="text-sm text-slate-800 dark:text-slate-200">{deal.source.name}</p>
              <p className="text-xs text-slate-500">{SOURCE_TYPE_LABELS[deal.source.type]}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
