"use client";
import { useState, useTransition } from "react";
import {
  submitKycCaseAction,
  startReviewAction,
  sendForApprovalAction,
  requestInfoAction,
} from "../actions";
import { useToast } from "@/features/ui/toast/toast-context";

type ActionResult =
  | { denied?: boolean; errors?: unknown; message?: string }
  | undefined;

export function KycStatusActions({
  kycCaseId,
  status,
}: {
  kycCaseId: number;
  status: string;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [showInfoForm, setShowInfoForm] = useState(false);

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result?.message)
        toast(result.message, result.denied ? "error" : "success");
    });
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {(status === "DRAFT" || status === "INFO_REQUIRED") && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => submitKycCaseAction(kycCaseId))}
          className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "INFO_REQUIRED" ? "Resubmit" : "Submit"}
        </button>
      )}

      {status === "SUBMITTED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => startReviewAction(kycCaseId))}
          className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Start review
        </button>
      )}

      {status === "UNDER_REVIEW" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => sendForApprovalAction(kycCaseId))}
            className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send for approval
          </button>
          <button
            type="button"
            onClick={() => setShowInfoForm((v) => !v)}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-soft"
          >
            Request info
          </button>
        </>
      )}

      {status === "AWAITING_APPROVAL" && (
        <p className="text-sm text-steel">
          Waiting on an approver — see the Approvals page.
        </p>
      )}

      {showInfoForm && (
        <form
          action={async (formData) => {
            const result = await requestInfoAction(
              kycCaseId,
              undefined,
              formData,
            );
            if (result?.message)
              toast(
                result.message,
                result.denied || result.errors ? "error" : "success",
              );
          }}
          className="mt-3 flex w-full items-center gap-2"
        >
          <input
            name="reason"
            placeholder="What information is needed?"
            className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
