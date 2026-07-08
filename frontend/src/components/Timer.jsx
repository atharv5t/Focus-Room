import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, Pause, RotateCcw } from "lucide-react";

const PRESETS = [
  { label: "25m", minutes: 25 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "1h 30m", minutes: 90 },
  { label: "2h", minutes: 120 },
];

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h)}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const Timer = ({ onSessionComplete }) => {
  const [durationSec, setDurationSec] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [targetEndTime, setTargetEndTime] = useState(null);
  const [editing, setEditing] = useState(false);
  const [customH, setCustomH] = useState("0");
  const [customM, setCustomM] = useState("25");
  const intervalRef = useRef(null);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = (startTime, frequency, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, startTime);
        
        // Clean volume envelope to prevent clicking noises
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02); // Louder, clearer volume
        gain.gain.setValueAtTime(0.3, startTime + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.connect(gain).connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Distinct double-beep chime
      playBeep(now, 880, 0.15);       // First beep (High A)
      playBeep(now + 0.25, 880, 0.25); // Second beep 250ms later
      
      // Automatically dismantle context after audio finishes
      setTimeout(() => { ctx.close(); }, 1000);
    } catch (e) { /* ignore */ }
  };

  const completeSession = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTargetEndTime(null);
    setRemaining(0);
    
    (async () => {
      try {
        onSessionComplete?.({
          durationMinutes: Math.round(durationSec / 60),
        });
      } catch (e) { /* ignore */ }
    })();

    playChime();
    toast.success("Time's up. Well done.");
  };

  useEffect(() => {
    if (!running || targetEndTime == null) return;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) completeSession();
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, targetEndTime, durationSec, onSessionComplete]);

  const startTimer = () => {
    const secs = remaining === 0 ? durationSec : remaining;
    if (remaining === 0) setRemaining(durationSec);
    setTargetEndTime(Date.now() + secs * 1000);
    setRunning(true);
  };

  const pause = () => {
    if (targetEndTime != null) {
      const left = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
      setRemaining(left);
    }
    setTargetEndTime(null);
    setRunning(false);
  };

  const resume = () => {
    setTargetEndTime(Date.now() + remaining * 1000);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setTargetEndTime(null);
    setRemaining(durationSec);
  };

  const applyPreset = (mins) => {
    setRunning(false);
    setTargetEndTime(null);
    setDurationSec(mins * 60);
    setRemaining(mins * 60);
    setCustomH(String(Math.floor(mins / 60)));
    setCustomM(String(mins % 60));
  };

  const commitCustom = () => {
    const h = parseInt(customH || "0", 10) || 0;
    const m = parseInt(customM || "0", 10) || 0;
    const total = h * 60 + m;
    if (total <= 0 || total > 720) {
      toast.error("Enter a duration between 1 min and 12h");
      setEditing(false);
      return;
    }
    setRunning(false);
    setTargetEndTime(null);
    setDurationSec(total * 60);
    setRemaining(total * 60);
    setEditing(false);
  };

  const progress = durationSec > 0 ? 1 - remaining / durationSec : 0;
  const isPaused = !running && remaining > 0 && remaining < durationSec;
  const isFresh = remaining === durationSec;

  return (
    <section
      data-testid="timer-section"
      className="flex flex-col items-center justify-center py-8 lg:py-10"
    >
      <div className="uppercase tracking-[0.3em] text-xs text-[color:var(--ink-2)] mb-3 font-body">
        Focus Session
      </div>

      <div
        data-testid="timer-display"
        className={`font-display font-light tracking-tight leading-none tabular-nums text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] ${
          running ? "timer-active" : ""
        }`}
        style={{ color: running ? "var(--moss)" : "var(--ink)" }}
      >
        {formatTime(remaining)}
      </div>

      {/* Progress line */}
      <div className="w-full max-w-xl h-px bg-[color:var(--surface-2)] mt-8 relative overflow-hidden">
        <div
          data-testid="timer-progress"
          className="absolute inset-y-0 left-0 bg-[color:var(--moss)] transition-all duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Controls: filled pill buttons */}
      <div className="flex items-center gap-3 mt-10">
        {running ? (
          <button
            data-testid="timer-pause-btn"
            onClick={pause}
            className="btn-primary"
          >
            <Pause size={14} strokeWidth={2} /> Pause
          </button>
        ) : (
          <button
            data-testid="timer-start-btn"
            onClick={isPaused ? resume : startTimer}
            className="btn-primary"
          >
            <Play size={14} strokeWidth={2} /> {isPaused ? "Resume" : "Start"}
          </button>
        )}
        <button
          data-testid="timer-reset-btn"
          onClick={reset}
          disabled={isFresh}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={14} strokeWidth={2} /> Reset
        </button>
      </div>

      {/* Duration selection */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 font-body">
        <span className="uppercase tracking-[0.2em] text-xs text-[color:var(--ink-2)] mr-3">Duration</span>
        {PRESETS.map((p) => {
          const active = durationSec === p.minutes * 60;
          return (
            <button
              key={p.label}
              data-testid={`timer-preset-${p.minutes}`}
              onClick={() => applyPreset(p.minutes)}
              className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
                active
                  ? "border-[color:var(--moss)] text-[color:var(--moss-dark)] bg-[color:var(--moss)]/5"
                  : "border-[color:var(--border)] text-[color:var(--ink-2)] hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
        {editing ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-[color:var(--moss)] bg-transparent">
            <input
              data-testid="timer-custom-hours"
              autoFocus
              type="number"
              min="0"
              max="12"
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCustom();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-8 bg-transparent text-[color:var(--ink)] focus:outline-none text-center tabular-nums"
            />
            <span className="text-[10px] text-[color:var(--ink-2)]">h</span>
            <input
              data-testid="timer-custom-minutes"
              type="number"
              min="0"
              max="59"
              value={customM}
              onChange={(e) => setCustomM(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCustom();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-8 bg-transparent text-[color:var(--ink)] focus:outline-none text-center tabular-nums"
            />
            <span className="text-[10px] text-[color:var(--ink-2)]">m</span>
            <button
              data-testid="timer-custom-save"
              onClick={commitCustom}
              className="ml-1 text-[color:var(--moss)] hover:opacity-70"
              aria-label="Save duration"
            >
              ✓
            </button>
          </span>
        ) : (
          <button
            data-testid="timer-custom-btn"
            onClick={() => setEditing(true)}
            className="px-3 py-1 rounded-full text-xs border border-dashed border-[color:var(--ink-3)] text-[color:var(--ink-2)] hover:border-[color:var(--ink)] hover:text-[color:var(--ink)] transition-colors duration-200"
          >
            Custom
          </button>
        )}
      </div>

    </section>
  );
};