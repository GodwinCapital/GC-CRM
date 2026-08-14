import { SOURCE_TYPE_ORDER, SOURCE_TYPE_LABELS } from "@/lib/taxonomy";
import { Field, Button, inputClass, selectClass, textareaClass } from "@/components/ui";

export function SourceForm({
  action,
  initial,
  submitLabel = "Save Source",
}: {
  action: (formData: FormData) => void;
  initial?: {
    name?: string | null;
    type?: string | null;
    website?: string | null;
    notes?: string | null;
  };
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <input id="name" name="name" required defaultValue={initial?.name ?? ""} className={inputClass} />
        </Field>
        <Field label="Type" htmlFor="type">
          <select id="type" name="type" defaultValue={initial?.type ?? "SPONSOR"} className={selectClass}>
            {SOURCE_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {SOURCE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Website" htmlFor="website">
        <input id="website" name="website" defaultValue={initial?.website ?? ""} className={inputClass} />
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
