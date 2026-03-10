import type { ProposedTime, DayOfWeek } from "../../domain/models/types";
import { DAYS_OF_WEEK, DAY_LABELS, HOURS } from "../../domain/models/types";
import { formatHour } from "../../application/services/timezone.service";
import { TimezoneSelector } from "./TimezoneSelector";
import { useState } from "react";
import { detectUserTimezone } from "../../application/services/timezone.service";

interface ProposedTimeSelectorProps {
  proposedTime: ProposedTime | null;
  onSet: (proposed: ProposedTime | null) => void;
  memberTimezones: string[];
}

export function ProposedTimeSelector({
  proposedTime,
  onSet,
  memberTimezones,
}: ProposedTimeSelectorProps) {
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState<DayOfWeek>(proposedTime?.slot.day ?? "monday");
  const [hour, setHour] = useState(proposedTime?.slot.hour ?? 9);
  const [timezone, setTimezone] = useState(proposedTime?.timezone ?? detectUserTimezone());
  const [proposerName, setProposerName] = useState(proposedTime?.proposedBy ?? "");

  const handleSave = () => {
    const name = proposerName.trim();
    if (!name) return;
    onSet({
      slot: { day, hour },
      timezone,
      proposedBy: name,
    });
    setEditing(false);
  };

  const handleClear = () => {
    onSet(null);
    setEditing(false);
  };

  if (proposedTime && !editing) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {DAY_LABELS[proposedTime.slot.day]} at {formatHour(proposedTime.slot.hour)}
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({proposedTime.timezone})
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Proposed by <span className="font-medium">{proposedTime.proposedBy}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Change
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!editing && !proposedTime && (
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-violet-200 px-4 py-2.5 text-sm font-medium text-violet-600 transition-colors hover:border-violet-400 hover:bg-violet-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Propose a meeting time
        </button>
      )}

      {editing && (
        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
            Propose Initial Time
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-slate-600">Your name</label>
              <input
                type="text"
                value={proposerName}
                onChange={(e) => setProposerName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>{DAY_LABELS[d]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Time</label>
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <TimezoneSelector
                label="Timezone"
                value={timezone}
                onChange={setTimezone}
                pinnedTimezones={memberTimezones}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!proposerName.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              Set Proposed Time
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
