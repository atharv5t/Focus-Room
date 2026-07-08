import { useEffect, useState, useCallback } from "react";
import { Timer } from "@/components/Timer";
import { Goals } from "@/components/Targets";
import { StatCard } from "@/components/StatCard";
import { LogBook } from "@/components/LogBook";
import { fetchSettings, updateSettings, fetchLogStats, createSession, fetchLogEntries } from "@/lib/api";
import { toast } from "sonner";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function minutesBetween(start, end) {
  const [sh, sm] = start.split(":").map((x) => parseInt(x, 10));
  const [eh, em] = end.split(":").map((x) => parseInt(x, 10));
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

export default function () {
  const [settings, setSettings] = useState({ daily_goal: "", weekly_goal: "", monthly_goal: "" });
  const [stats, setStats] = useState({ today_minutes: 0, week_minutes: 0, month_minutes: 0 });
  const [manualStudyMinutes, setManualStudyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logRefreshKey, setLogRefreshKey] = useState(0);

  const refreshStats = useCallback(async () => {
    try { 
      const [stat, entries] = await Promise.all([fetchLogStats(), fetchLogEntries(todayISO())]);
      setStats(stat);
      
      // Calculate manual study minutes from Log Book entries matching "Study Activity"
      const studyMins = entries
        .filter(e => e.category === "Study Activity")
        .reduce((sum, e) => sum + minutesBetween(e.start_time, e.end_time), 0);
      
      setManualStudyMinutes(studyMins);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [s, stat, entries] = await Promise.all([
          fetchSettings(), 
          fetchLogStats(), 
          fetchLogEntries(todayISO())
        ]);
        setSettings(s);
        setStats(stat);
        
        const studyMins = entries
          .filter(e => e.category === "Study Activity")
          .reduce((sum, e) => sum + minutesBetween(e.start_time, e.end_time), 0);
        
        setManualStudyMinutes(studyMins);
      } catch (e) {
        toast.error("Could not load your data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdateSettings = async (partial) => {
    try {
      const s = await updateSettings(partial);
      setSettings(s);
      toast.success("Saved");
    } catch (e) { toast.error("Could not save"); }
  };

  const handleSessionComplete = async ({ topic, durationMinutes, category }) => {
    try {
      await createSession({
        topic: topic || null,
        duration_minutes: durationMinutes,
        category: category || null,
      });
      refreshStats();
    } catch (e) { /* ignore */ }
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // Add the manual study book minutes directly onto the stats counters for display
  const combinedToday = stats.today_minutes + manualStudyMinutes;
  const combinedWeek = stats.week_minutes + manualStudyMinutes;
  const combinedMonth = stats.month_minutes + manualStudyMinutes;

  return (
    <div data-testid="" className="min-h-screen relative overflow-hidden">
      {/* Ambient background lights */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-25" style={{ background: "var(--moss)" }} />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full blur-3xl opacity-20" style={{ background: "var(--terracotta)" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl opacity-15" style={{ background: "#8A6D3B" }} />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-4 flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <div className="font-display text-xl text-[color:var(--ink)] leading-tight">
            Focus<span className="text-[color:var(--moss)]">.</span>room
          </div>
          <div data-testid="by-attribution" className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--ink-2)] font-body mt-1">
            by Atharv
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-2)] font-body hidden sm:block">
          {today}
        </div>
      </header>

      {/* Main two-column layout */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        {/* Left column: Timer + Stats + Intentions */}
        <div className="lg:col-span-7 flex flex-col">
          <Timer onSessionComplete={handleSessionComplete} />

          {/* Stats */}
          <section className="pt-4">
            <div className="uppercase tracking-[0.3em] text-xs text-[color:var(--ink-2)] font-body mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--moss)]" style={{ boxShadow: "0 0 6px var(--moss)" }} />
              Time Studied
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Today" minutes={combinedToday} testId="stat-today" dotColor="#556B2F" />
              <StatCard label="This Week" minutes={combinedWeek} testId="stat-week" dotColor="#B84C36" />
              <StatCard label="This Month" minutes={combinedMonth} testId="stat-month" dotColor="#8A6D3B" />
            </div>
          </section>

          {/* Intentions */}
          <section className="pt-12 hidden">
            {!loading && <Goals settings={settings} onUpdate={handleUpdateSettings} />}
          </section>
        </div>

        {/* Right column: Log Book + Goals stacked */}
        <aside className="lg:col-span-5 flex flex-col gap-10">
          <LogBook refreshKey={logRefreshKey} onChange={refreshStats} />
          <div className="relative border border-[color:var(--surface-2)] rounded-sm bg-[color:var(--surface)]/30 backdrop-blur-sm p-7 lg:p-8">
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-25" style={{ background: "var(--terracotta)" }} />
            {!loading && <Goals settings={settings} onUpdate={handleUpdateSettings} />}
          </div>
        </aside>
      </main>

      <footer className="max-w-7xl mx-auto px-6 lg:px-12 pb-8 pt-4 border-t border-[color:var(--surface-2)] flex items-center justify-between text-xs font-body text-[color:var(--ink-2)] relative z-10">
        <span>Focus is a practice.</span>
        <span className="uppercase tracking-[0.2em]">Work quietly.</span>
      </footer>
    </div>
  );
}