"use client";
import { useState, useTransition } from "react";
import { actOnApprovalStepAction } from "../actions";
import { useToast } from "@/features/ui/toast/toast-context";

export function ApprovalActions({ stepId }: { stepId: number }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState("");

  function act(decision: "APPROVED" | "REJECTED") {
    if (decision === "REJECTED" && !comment.trim()) {
      toast("Add a reason before rejecting.", "error");
      return;
    }
    startTransition(async () => {
      const result = await actOnApprovalStepAction(
        stepId,
        decision,
        comment.trim() || null,
      );
      if (result?.message)
        toast(result.message, result.denied ? "error" : "success");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Comment (required to reject)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-48 rounded-md border border-line bg-paper px-2 py-1 text-xs"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => act("APPROVED")}
        className="rounded-md bg-ledger px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("REJECTED")}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
