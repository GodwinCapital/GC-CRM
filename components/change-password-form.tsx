"use client";

import { useActionState } from "react";
import { changeMyPasswordAction } from "@/app/(app)/settings/actions";
import { Field, Button, inputClass } from "@/components/ui";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeMyPasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Current Password" htmlFor="currentPassword">
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          className={inputClass}
        />
      </Field>
      <Field label="New Password" htmlFor="newPassword">
        <input id="newPassword" name="newPassword" type="password" required className={inputClass} />
      </Field>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">{state.success}</p>}
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
