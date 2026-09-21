"use client";
import { useState, useTransition } from "react";
import { testPolicy } from "@/features/authorization/test-policy";
import type { EvalResult } from "@/lib/auth/pbac";
import { AttrBagEditor, type AttrRow } from "./attribute-bag-editor";
import { attributesFor } from "../attribute-catalog";
import type { OrgUser } from "./rule-list-editor";

type PolicyOption = { id: number; name: string; resourceType: string };

function toBag(rows: AttrRow[], catalog: ReturnType<typeof attributesFor>) {
  const bag: Record<string, unknown> = {};
  for (const row of rows) {
    if (!row.attribute) continue;
    const def = catalog.find((a) => a.key === row.attribute);
    bag[row.attribute] = def?.isNumeric ? Number(row.value) : row.value;
  }
  return bag;
}

export function PolicyTester({
  policies,
  orgUsers,
}: {
  policies: PolicyOption[];
  orgUsers: OrgUser[];
}) {
  const [policyId, setPolicyId] = useState(policies[0]?.id);
  const resourceType =
    policies.find((p) => p.id === policyId)?.resourceType ?? "";

  const [subjectRows, setSubjectRows] = useState<AttrRow[]>([
    { attribute: "id", value: "" },
  ]);
  const [resourceRows, setResourceRows] = useState<AttrRow[]>([]);
  const [contextRows, setContextRows] = useState<AttrRow[]>([]);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    if (!policyId) return;
    startTransition(async () => {
      const res = await testPolicy(
        policyId,
        toBag(subjectRows, attributesFor("SUBJECT", resourceType)),
        toBag(resourceRows, attributesFor("RESOURCE", resourceType)),
        toBag(contextRows, attributesFor("CONTEXT", resourceType)),
      );
      setResult(res);
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

      <AttrBagEditor
        label="Sample subject"
        rows={subjectRows}
        onChange={setSubjectRows}
        source="SUBJECT"
        resourceType={resourceType}
        orgUsers={orgUsers}
      />
      <AttrBagEditor
        label="Sample resource"
        rows={resourceRows}
        onChange={setResourceRows}
        source="RESOURCE"
        resourceType={resourceType}
        orgUsers={orgUsers}
      />
      <AttrBagEditor
        label="Sample context"
        rows={contextRows}
        onChange={setContextRows}
        source="CONTEXT"
        resourceType={resourceType}
        orgUsers={orgUsers}
      />

      <button
        onClick={run}
        disabled={pending}
        className="mt-4 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
