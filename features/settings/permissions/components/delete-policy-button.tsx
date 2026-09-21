"use client";
import { useTransition } from "react";
import { deletePolicyAction } from "../actions";

export function DeletePolicyButton({ policyId }: { policyId: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this policy? This cannot be undone.")) return;
        startTransition(() => deletePolicyAction(policyId));
      }}
      className="text-sm font-medium text-red-600 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
