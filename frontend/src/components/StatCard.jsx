export const StatCard = ({ label, minutes, testId, dotColor = "#556B2F" }) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div
      data-testid={testId}
      className="relative flex flex-col gap-3 px-5 py-6 border border-[color:var(--surface-2)] bg-[color:var(--surface)]/40 rounded-sm overflow-hidden hover:border-[color:var(--ink)] transition-colors duration-300"
    >
      {/* decorative light */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: dotColor }}
      />
      <div className="flex items-center gap-2 relative z-10">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
        />
        <span className="uppercase tracking-[0.25em] text-[10px] text-[color:var(--ink-2)] font-body">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="font-display font-light text-5xl md:text-6xl text-[color:var(--ink)] tabular-nums leading-none">
          {display}
        </span>
      </div>
    </div>
  );
};
