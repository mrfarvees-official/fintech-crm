"use client";
import { OPERATORS, CONDITION_SOURCES } from "../schema";

export type Rule = {
  attribute: string;
  operator: string;
  value: string | null;
};
export type ConditionRule = Rule & {
  source: "SUBJECT" | "RESOURCE" | "CONTEXT";
};

export function RuleListEditor<T extends Rule>({
  label,
  hint,
  rows,
  onChange,
  withSource = false,
}: {
  label: string;
  hint?: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  withSource?: boolean;
}) {
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
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-line bg-paper p-2"
          >
            {withSource && (
              <select
                value={(row as unknown as ConditionRule).source}
                onChange={(e) =>
                  updateRow(i, {
                    source: e.target.value as ConditionRule["source"],
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
            <input
              placeholder="attribute"
              value={row.attribute}
              onChange={(e) => updateRow(i, { attribute: e.target.value })}
              className="w-32 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
            />
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
            <input
              placeholder="value ($subject.x / $resource.x / literal)"
              value={row.value ?? ""}
              onChange={(e) => updateRow(i, { value: e.target.value })}
              className="flex-1 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-xs text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
