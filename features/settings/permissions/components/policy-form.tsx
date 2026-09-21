"use client";
import { useActionState, useState } from "react";
import { createPolicyAction, updatePolicyAction } from "../actions";
import {
  RuleListEditor,
  type Rule,
  type ConditionRule,
} from "./rule-list-editor";
import { EFFECTS, type PolicyFormState } from "../schema";

type PolicyRecord = {
  id?: number;
  name: string;
  code: string;
  description: string | null;
  action: string;
  resourceType: string;
  effect: "ALLOW" | "DENY";
  priority: number;
  isActive: boolean;
  subjects: Rule[];
  resources: Rule[];
  conditions: ConditionRule[];
};

export function PolicyForm({ policy }: { policy?: PolicyRecord }) {
  const boundAction = policy?.id
    ? updatePolicyAction.bind(null, policy.id)
    : createPolicyAction;
  const [state, formAction, pending] = useActionState<
    PolicyFormState,
    FormData
  >(boundAction, undefined);

  const [subjects, setSubjects] = useState<Rule[]>(policy?.subjects ?? []);
  const [resources, setResources] = useState<Rule[]>(policy?.resources ?? []);
  const [conditions, setConditions] = useState<ConditionRule[]>(
    policy?.conditions ?? [],
  );

  return (
    <form action={formAction} className="max-w-2xl">
      <input type="hidden" name="subjects" value={JSON.stringify(subjects)} />
      <input type="hidden" name="resources" value={JSON.stringify(resources)} />
      <input
        type="hidden"
        name="conditions"
        value={JSON.stringify(conditions)}
      />

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-ink-soft">
          Name
          <input
            name="name"
            defaultValue={policy?.name}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Code
          <input
            name="code"
            defaultValue={policy?.code}
            placeholder="ALLOW_OWNER_TENANT_MANAGE"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="col-span-2 block text-sm font-medium text-ink-soft">
          Description
          <input
            name="description"
            defaultValue={policy?.description ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Action
          <input
            name="action"
            defaultValue={policy?.action}
            placeholder="tenant.manage"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Resource type
          <input
            name="resourceType"
            defaultValue={policy?.resourceType}
            placeholder="organization"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Effect
          <select
            name="effect"
            defaultValue={policy?.effect ?? "ALLOW"}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          >
            {EFFECTS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Priority
          <input
            name="priority"
            type="number"
            defaultValue={policy?.priority ?? 0}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="col-span-2 flex items-center gap-2 text-sm font-medium text-ink-soft">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={policy?.isActive ?? true}
          />
          Active
        </label>
      </div>

      <RuleListEditor
        label="Subject rules"
        hint="Who this applies to, e.g. department EQUALS COMPLIANCE."
        rows={subjects}
        onChange={setSubjects}
      />
      <RuleListEditor
        label="Resource rules (optional)"
        hint="Which resources this applies to, e.g. status EQUALS AWAITING_APPROVAL."
        rows={resources}
        onChange={setResources}
      />
      <RuleListEditor
        label="Conditions"
        hint="Cross-field comparisons, e.g. SUBJECT id EQUALS $resource.ownerId."
        rows={conditions}
        onChange={setConditions}
        withSource
      />

      {state?.message && (
        <p className="mt-4 text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save policy"}
      </button>
    </form>
  );
}
