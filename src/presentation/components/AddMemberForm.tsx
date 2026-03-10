import { useState } from "react";
import { COMMON_TIMEZONES } from "../../domain/constants/timezones";
import { detectUserTimezone } from "../../application/services/timezone.service";

interface AddMemberFormProps {
  onAdd: (name: string, timezone: string) => void;
}

export function AddMemberForm({ onAdd }: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(detectUserTimezone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, timezone);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-sm font-medium text-slate-600">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-sm font-medium text-slate-600">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        disabled={!name.trim()}
      >
        Add Member
      </button>
    </form>
  );
}
