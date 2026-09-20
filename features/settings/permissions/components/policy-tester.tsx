"use client";
import { useState, useTransition } from "react";
import { testPolicy } from "@/features/authorization/test-policy";
import type { EvalResult } from "@/lib/auth/pbac";

export function PolicyTester({
  policies,
}: {
  policies: { id: number; name: string }[];
}) {
  const [policyId, setPolicyId] = useState(policies[0]?.id);
  const [subject, setSubject] = useState('{ "id": 1 }');
  const [resource, setResource] = useState('{ "ownerId": 1 }');
  const [context, setContext] = useState("{}");
  const [result, setResult] = useState<EvalResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    if (!policyId) return;
    startTransition(async () => {
      try {
        const res = await testPolicy(
          policyId,
          JSON.parse(subject),
          JSON.parse(resource),
          JSON.parse(context),
        );
        setResult(res);
      } catch {
        setResult({
          decision: "NOT_APPLICABLE",
          reasons: ["Invalid JSON input"],
        });
      }
    });
  }

  return (
    <div className="mt-4 max-w-lg rounded-lg border border-line bg-paper-raised p-5">
      <label className="block text-sm font-medium text-ink-soft">
        Policy
        <select
          value={policyId}
          onChange={(e) => setPolicyId(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        >
          {policies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {[
        ["Subject", subject, setSubject],
        ["Resource", resource, setResource],
        ["Context", context, setContext],
      ].map(([label, value, setter]) => (
        <label
          key={label as string}
          className="mt-3 block text-sm font-medium text-ink-soft"
        >
          {label as string} (JSON)
          <textarea
            value={value as string}
            onChange={(e) => (setter as (v: string) => void)(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 font-mono text-xs"
          />
        </label>
      ))}

      <button
        onClick={run}
        disabled={pending}
        className="mt-4 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white"
      >
        {pending ? "Running…" : "Run test"}
      </button>

      {result && (
        <div className="mt-4 rounded-md border border-line bg-paper p-3 text-sm">
          <p className="font-medium text-ink">{result.decision}</p>
          <ul className="mt-1 text-xs text-steel">
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
