"use client";
import { attributesFor, CUSTOM_ATTRIBUTE_KEY } from "../attribute-catalog";
import type { OrgUser } from "./rule-list-editor";

export type AttrRow = { attribute: string; value: string };

export function AttrBagEditor({
  label,
  rows,
  onChange,
  source,
  resourceType,
  orgUsers = [],
}: {
  label: string;
  rows: AttrRow[];
  onChange: (rows: AttrRow[]) => void;
  source: "SUBJECT" | "RESOURCE" | "CONTEXT";
  resourceType: string;
  orgUsers: OrgUser[];
}) {
  const catalog = attributesFor(source, resourceType);

  function addRow() {
    onChange([...rows, { attribute: "", value: "" }]);
  }
  function updateRow(i: number, patch: Partial<AttrRow>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <button
          type="button"
          onClick={addRow}
          className="text-xs font-medium text-ledger"
        >
          + Add field
        </button>
      </div>

      {rows.length === 0 && (
        <p className="mt-1 text-xs text-steel">No fields set.</p>
      )}

      <div className="mt-2 flex flex-col gap-2">
        {rows.map((row, i) => {
          const selected = catalog.find((a) => a.key === row.attribute);
          const isCustom = row.attribute !== "" && !selected;

          return (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-paper p-2"
            >
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
                className="min-w[min-w-40] rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
              >
                <option value="" disabled>
                  Choose field…
                </option>
                {catalog.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
                <option value={CUSTOM_ATTRIBUTE_KEY}>Custom field…</option>
              </select>

              {(isCustom || (!selected && row.attribute === "")) && (
                <input
                  placeholder="field name, e.g. riskScore"
                  value={row.attribute}
                  onChange={(e) => updateRow(i, { attribute: e.target.value })}
                  className="w-32 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                />
              )}

              {selected?.valueKind === "enum" ? (
                <select
                  value={row.value}
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
              ) : selected?.valueKind === "user" ? (
                <select
                  value={row.value}
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
              ) : (
                <input
                  placeholder="value"
                  value={row.value}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  className="flex-1 rounded-md border border-line bg-paper-raised px-2 py-1 text-xs"
                />
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
