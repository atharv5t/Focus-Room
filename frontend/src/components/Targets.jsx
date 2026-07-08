import { useEffect, useRef, useState } from "react";

const FIELDS = [
  { key: "daily_goal", label: "Daily", accent: "#556B2F", placeholder: "e.g. 1 chapter of calculus, 30 min run…" },
  { key: "weekly_goal", label: "Weekly", accent: "#B84C36", placeholder: "e.g. finish React 19 deep-dive…" },
  { key: "monthly_goal", label: "Monthly", accent: "#8A6D3B", placeholder: "e.g. ship v1.0, read 3 books…" },
];

const GoalRow = ({ label, accent, value, placeholder, onSave, testKey }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    onSave(draft.trim());
    setEditing(false);
  };

  return (
    <div
      data-testid={`goal-row-${label.toLowerCase()}`}
      className="flex flex-col gap-2 py-3 border-b border-[color:var(--surface-2)] last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--ink-2)] font-body">
            {label}
          </span>
        </div>
        {editing ? (
          <button
            data-testid={`goal-save-${label.toLowerCase()}`}
            onClick={commit}
            className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--moss)] hover:opacity-70 transition-opacity font-body"
          >
            Save
          </button>
        ) : (
          <button
            data-testid={`goal-edit-${label.toLowerCase()}`}
            onClick={() => setEditing(true)}
            className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-2)] hover:text-[color:var(--moss)] transition-colors font-body"
          >
            {value ? "Edit" : "Set"}
          </button>
        )}
      </div>
      {editing ? (
        <textarea
          ref={inputRef}
          data-testid={`goal-input-${label.toLowerCase()}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
            if (e.key === "Escape") setEditing(false);
          }}
          rows={2}
          placeholder={placeholder}
          className="w-full bg-transparent border-b border-[color:var(--moss)] outline-none py-1 text-base font-display font-light italic text-[color:var(--ink)] placeholder-[color:var(--ink-3)] resize-none"
        />
      ) : (
        <p
          onClick={() => setEditing(true)}
          className={`cursor-text text-base font-display font-light italic leading-snug ${
            value ? "text-[color:var(--ink)]" : "text-[color:var(--ink-3)]"
          }`}
        >
          {value ? `"${value}"` : placeholder}
        </p>
      )}
    </div>
  );
};

export const Goals = ({ settings, onUpdate }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="uppercase tracking-[0.3em] text-xs text-[color:var(--ink-2)] font-body flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full bg-[color:var(--moss)]"
          style={{ boxShadow: "0 0 6px var(--moss)" }}
        />
        Goals
      </div>
      <div className="flex flex-col">
        {FIELDS.map(({ key, label, accent, placeholder }) => (
          <GoalRow
            key={key}
            label={label}
            accent={accent}
            value={settings?.[key] || ""}
            placeholder={placeholder}
            onSave={(v) => onUpdate({ [key]: v })}
          />
        ))}
      </div>
    </div>
  );
};
