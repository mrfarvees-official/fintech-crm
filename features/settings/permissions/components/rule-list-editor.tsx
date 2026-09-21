"use client";
import { useState } from "react";
import {
  attributesFor,
  CUSTOM_ATTRIBUTE_KEY,
  type AttributeOption,
} from "../attribute-catalog";
import { OPERATORS, CONDITION_SOURCES } from "../schema";

export type Rule = {
  attribute: string;
  operator: string;
  value: string | null;
};
export type ConditionRule = Rule & {
  source: "SUBJECT" | "RESOURCE" | "CONTEXT";
};
export type OrgUser = { id: number; name: string; email: string };

function findAttribute(catalog: AttributeOption[], key: string) {
  return catalog.find((a) => a.key === key);
}

export function RuleListEditor<T extends Rule>({
  label,
  hint,
  rows,
  onChange,
  category,
  resourceType,
  orgUsers,
}: {
  label: string;
  hint?: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  category: "SUBJECT" | "RESOURCE" | "CONDITION";
  resourceType: string;
  orgUsers: OrgUser[];
}) {
  const withSource = category === "CONDITION";
  const [rawMode, setRawMode] = useState<Set<number>>(new Set());

  function addRow() {
    const base = { attribute: "", operator: "EQUALS", value: "" };
    onChange([
      ...rows,
      (withSource ? { ...base, source: "SUBJECT" } : base) as T,
    ]);
  }
  function updateRow(i: number, patch: Partial<ConditionRule>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }
  function toggleRaw(i: number) {
    setRawMode((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function catalogFor(row: T | ConditionRule): AttributeOption[] {
    const source = withSource ? (row as ConditionRule).source : category;
    return attributesFor(source, resourceType);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <button
          type="button"
          onClick={addRow}
          className="text-xs font-medium text-ledger"
        >
          + Add rule
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
      {rows.length === 0 && (
        <p className="mt-2 text-xs text-steel">
          No rules — matches everything.
        </p>
      )}

      <div className="mt-2 flex flex-col gap-2">
        {rows.map((row, i) => {
          const catalog = catalogFor(row);
          const selected = findAttribute(catalog, row.attribute);
          const isCustomAttribute = row.attribute !== "" && !selected;

          return (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-paper p-2"
            >
              {withSource && (
                <select
                  value={(row as unknown as ConditionRule).source}
                  onChange={(e) =>
                    updateRow(i, {
                      source: e.target.value as ConditionRule["source"],
                      attribute: "",
                      value: "",
                    })
                  }
                  className="rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                >
                  {CONDITION_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={
                  selected
                    ? row.attribute
                    : row.attribute
                      ? CUSTOM_ATTRIBUTE_KEY
                      : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  updateRow(i, {
                    attribute: val === CUSTOM_ATTRIBUTE_KEY ? "" : val,
                    value: "",
                  });
                }}
                className="min-w-[11rem] rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
              >
                <option value="" disabled>
                  Choose attribute…
                </option>
                {catalog.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
                <option value={CUSTOM_ATTRIBUTE_KEY}>Custom attribute…</option>
              </select>

              {(isCustomAttribute || (!selected && row.attribute === "")) && (
                <input
                  placeholder="attribute key, e.g. riskScore"
                  value={row.attribute}
                  onChange={(e) => updateRow(i, { attribute: e.target.value })}
                  className="w-32 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                />
              )}

              <select
                value={row.operator}
                onChange={(e) => updateRow(i, { operator: e.target.value })}
                className="rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>

              {rawMode.has(i) || !selected || selected.valueKind === "text" ? (
                <input
                  placeholder="value, or $subject.x / $resource.x"
                  value={row.value ?? ""}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  className="flex-1 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                />
              ) : selected.valueKind === "enum" ? (
                <select
                  value={row.value ?? ""}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  className="flex-1 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                >
                  <option value="" disabled>
                    Choose value…
                  </option>
                  {selected.enumOptions?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={row.value ?? ""}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  className="flex-1 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                >
                  <option value="" disabled>
                    Choose a person…
                  </option>
                  {orgUsers.map((u) => (
                    <option
                      key={u.id}
                      value={selected.key === "email" ? u.email : String(u.id)}
                    >
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              )}

              {selected && selected.valueKind !== "text" && (
                <button
                  type="button"
                  onClick={() => toggleRaw(i)}
                  className="text-xs text-steel underline"
                >
                  {rawMode.has(i) ? "Use picker" : "Use raw value"}
                </button>
              )}

              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
