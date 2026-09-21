"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/features/ui/toast/toast-context";

type DeleteResult = { denied?: boolean; message?: string } | undefined;

export function DeleteButton({
  onDelete,
  confirmText = "Delete this? This cannot be undone.",
  redirectTo,
  label = "Delete",
}: {
  onDelete: () => Promise<DeleteResult>;
  confirmText?: string;
  redirectTo?: string;
  label?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(confirmText)) return;
    startTransition(async () => {
      const result = await onDelete();
      if (result?.message)
        toast(result.message, result.denied ? "error" : "success");
      if (result && !result.denied && redirectTo) router.push(redirectTo);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
