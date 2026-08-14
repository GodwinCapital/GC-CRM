import { Field, Button, inputClass, selectClass, textareaClass } from "@/components/ui";

export function ContactForm({
  action,
  initial,
  sources,
  submitLabel = "Save Contact",
}: {
  action: (formData: FormData) => void;
  initial?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    title?: string | null;
    company?: string | null;
    linkedinUrl?: string | null;
    notes?: string | null;
    sourceId?: string | null;
  };
  sources: { id: string; name: string }[];
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <input id="name" name="name" required defaultValue={initial?.name ?? ""} className={inputClass} />
        </Field>
        <Field label="Title" htmlFor="title">
          <input id="title" name="title" defaultValue={initial?.title ?? ""} className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} className={inputClass} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input id="phone" name="phone" defaultValue={initial?.phone ?? ""} className={inputClass} />
        </Field>
        <Field label="Company" htmlFor="company">
          <input id="company" name="company" defaultValue={initial?.company ?? ""} className={inputClass} />
        </Field>
        <Field label="LinkedIn URL" htmlFor="linkedinUrl">
          <input id="linkedinUrl" name="linkedinUrl" defaultValue={initial?.linkedinUrl ?? ""} className={inputClass} />
        </Field>
      </div>
      <Field label="Associated Source / Firm" htmlFor="sourceId">
        <select id="sourceId" name="sourceId" defaultValue={initial?.sourceId ?? ""} className={selectClass}>
          <option value="">—</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes" htmlFor="notes">
        <textarea id="notes" name="notes" defaultValue={initial?.notes ?? ""} className={textareaClass} />
      </Field>
      <div className="flex justify-end border-t border-slate-800 pt-4">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
