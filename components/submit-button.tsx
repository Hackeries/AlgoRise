// components/submit-button.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export function SubmitButton({ idle, submitting, ...props }: any) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? submitting : idle}
    </Button>
  );
}
