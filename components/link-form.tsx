// components/link-form.tsx
"use client";
import { useActionState } from "react";
import { linkCodeforces } from "@/app/actions/cf";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "sonner";
import { useEffect } from "react";

export function LinkForm({ defaultHandle }: { defaultHandle?: string }) {
  cconst [state, action] = useActionState(linkCodeforces as any, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex gap-2">
      <Input name="handle" defaultValue={defaultHandle ?? ""} placeholder="e.g. tourist" />
      <SubmitButton idle="Link" submitting="Linking..." />
    </form>
  );
}
