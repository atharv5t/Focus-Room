import { useEffect, useState } from "react";
import { Play, Square, X } from "lucide-react";
import { fetchLogEntries, createLogEntry, deleteLogEntry } from "@/lib/api";
import { toast } from "sonner";

const ACTIVE_KEY = "focusroom_active_entry";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toDisplay(hm) {
  const [h, m] = hm.split(":").map((x) => parseInt(x, 10));
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

function minutesBetween(start, end) {
  const [sh, sm] = start.split(":").map((x) => parseInt(x, 10));
  const [eh, em] = end.split(":").map((x) => parseInt(x, 10));
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const LogBook = ({ refreshKey, onChange }) => {
  const [entries, setEntries] = useState([]);
  const [taskDraft, setTaskDraft] = useState("");
  const [active, setActive] = useState(null); // {task, start_time, started_ts, category?}
  const [pendingLog, setPendingLog] = useState(null); // {task, start_time}
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const date = todayISO();

  // Load active entry from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === date) setActive(parsed);
        else localStorage.removeItem(ACTIVE_KEY);
      }
    } catch (e) { /* ignore */ }
  }, [date]);

  // Live tick for active entry duration display
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  const load = async () => {
    try {
      const list = await fetchLogEntries(date);
      setEntries(list);
    } catch (e) {
      toast.error("Could not load log");
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { load(); }, [date, refreshKey]); // eslint-disable-line

  const total = entries.reduce((s, e) => s + minutesBetween(e.start_time, e.end_time), 0);

  const requestLogEntry = () => {
    const t = taskDraft.trim();
    if (!t) { toast.error("Enter a task first"); return; }
    setPendingLog({ task: t, start_time: nowHM() });
    setShowCategoryPopup(true);
  };

  const startWithCategory = (category) => {
    if (!pendingLog) return;
    
    // Create the active session but DO NOT save to database yet
    const newActive = {
      date,
      task: pendingLog.task,
      start_time: pendingLog.start_time,
      started_ts: Date.now(),
      category: category
    };
    
    setActive(newActive);
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(newActive));
    } catch (e) { /* ignore */ }
    
    setShowCategoryPopup(false);
    setPendingLog(null);
    setTaskDraft("");
    toast.success("Started: " + pendingLog.task);
  };

  const endEntry = async () => {
    if (!active) return;
    // Now we send it to the database with the saved category
    const payload = {
      date: active.date,
      task: active.task,
      start_time: active.start_time,
      end_time: nowHM(),
      category: active.category || null,
    };
    try {
      const entry = await createLogEntry(payload);
      setEntries((cur) => [...cur, entry].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      setActive(null);
      try { localStorage.removeItem(ACTIVE_KEY); } catch (e) { /* ignore */ }
      onChange?.();
      toast.success("Saved");
    } catch (e) {
      toast.error("Could not save entry");
    }
  };

  const cancelActive = () => {
    setActive(null);
    try { localStorage.removeItem(ACTIVE_KEY); } catch (e) { /* ignore */ }
  };

  const remove = async (id) => {
    try {
      await deleteLogEntry(id);
      setEntries((cur) => cur.filter((e) => e.id !== id));
      onChange?.();
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  // Elapsed for active entry (uses tick to force re-render)
  let activeElapsed = "0s";
  if (active) {
    void tick;
    const secs = Math.max(0, Math.floor((Date.now() - active.started_ts) / 1000));
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    activeElapsed = h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  return (
    <div className="relative border border-[color:var(--surface-2)] rounded-sm bg-[color:var(--surface)]/30 backdrop-blur-sm p-7 lg:p-8 lg:sticky lg:top-10">
      {/* Decorative light */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-25"
        style={{ background: "var(--moss)" }}
      />

      <div className="flex items-center mb-6 relative z-10">
        <div className="uppercase tracking-[0.3em] text-xs text-[color:var(--ink-2)] font-body flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[color:var(--moss)]"
            style={{ boxShadow: "0 0 6px var(--moss)" }}
          />
          Log Book · Today
        </div>
      </div>

      {/* Active entry OR add form */}
      <div className="pb-5 border-b border-[color:var(--surface-2)] relative z-10">
        {active ? (
          <div data-testid="active-entry" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--terracotta)] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--terracotta)] font-body">
                In progress
              </span>
            </div>
            <div className="font-display font-light text-2xl text-[color:var(--ink)] leading-snug">
              {active.task}
            </div>
            <div className="flex items-center justify-between text-xs text-[color:var(--ink-2)] font-body tabular-nums">
              <span>Started at {toDisplay(active.start_time)}</span>
              <span data-testid="active-elapsed">{activeElapsed}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                data-testid="log-end-btn"
                onClick={endEntry}
                className="btn-primary !py-2 !px-5 !text-[10px]"
              >
                <Square size={12} strokeWidth={2} fill="currentColor" /> End
              </button>
              <button
                data-testid="log-cancel-btn"
                onClick={cancelActive}
                className="btn-secondary !py-2 !px-4 !text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              data-testid="log-task-input"
              type="text"
              value={taskDraft}
              onChange={(e) => setTaskDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") requestLogEntry(); }}
              placeholder="What are you starting on?"
              className="w-full bg-transparent border-b border-[color:var(--surface-2)] focus:border-[color:var(--moss)] outline-none py-2 text-lg font-display font-light text-[color:var(--ink)] placeholder-[color:var(--ink-3)] transition-colors"
            />
            <button
              data-testid="log-start-btn"
              onClick={requestLogEntry}
              className="btn-primary !py-2 !px-5 !text-[10px] self-start"
            >
              <Play size={12} strokeWidth={2} fill="currentColor" /> Start
            </button>
          </div>
        )}
      </div>

      {showCategoryPopup && (
        <div
          data-testid="log-category-dialog"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(240, 238, 230, 0.4)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#F5F4F0",
              borderRadius: "8px",
              padding: "2rem 2.5rem",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <p
              className="font-display font-light text-2xl text-[color:var(--ink)]"
              style={{ marginBottom: "1.5rem" }}
            >
              What type of activity?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                data-testid="log-category-study"
                onClick={() => startWithCategory("Study Activity")}
                style={{
                  borderRadius: "50px",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  letterSpacing: "1px",
                }}
                className="px-5 py-2.5 border border-[color:var(--moss)] bg-[color:var(--moss)]/10 text-[color:var(--moss-dark)] font-body hover:bg-[color:var(--moss)]/20 transition-colors"
              >
                Study Activity
              </button>
              <button
                data-testid="log-category-other"
                onClick={() => startWithCategory("Other Activity")}
                style={{
                  borderRadius: "50px",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  letterSpacing: "1px",
                }}
                className="px-5 py-2.5 border border-[color:var(--border)] text-[color:var(--ink-2)] font-body hover:border-[color:var(--ink)] hover:text-[color:var(--ink)] transition-colors"
              >
                Other Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="pt-5 relative z-10 max-h-[600px] overflow-y-auto -mx-2 px-2">
        {!loaded ? (
          <p className="text-xs text-[color:var(--ink-3)] italic">Loading…</p>
        ) : entries.length === 0 ? (
          <p data-testid="log-empty" className="text-sm text-[color:var(--ink-3)] italic font-body py-4">
            Nothing logged yet. Start your first entry above.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[color:var(--surface-2)]" data-testid="log-entries">
            {entries.map((e) => {
              return (
                <li
                  key={e.id}
                  data-testid={`log-entry-${e.id}`}
                  className="task-enter group flex items-center gap-4 py-4"
                >
                  <span
                    className="w-1 h-1 rounded-full bg-[color:var(--moss)] flex-shrink-0"
                    style={{ boxShadow: "0 0 4px var(--moss)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-[15px] text-[color:var(--ink)] truncate">
                      {e.task}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-2)] font-body tabular-nums mt-1">
                      {toDisplay(e.start_time)} — {toDisplay(e.end_time)}
                    </div>
                  </div>
                  <button
                    data-testid={`log-delete-${e.id}`}
                    onClick={() => remove(e.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[color:var(--ink-3)] hover:text-[color:var(--terracotta)]"
                    aria-label="Delete entry"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};