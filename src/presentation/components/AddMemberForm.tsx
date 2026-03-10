import { useState } from "react";
import { detectUserTimezone } from "../../application/services/timezone.service";
import {
  sanitizeName,
  validateMemberInput,
  MAX_MEMBER_NAME_LENGTH,
} from "../../application/services/validation.service";
import { TimezoneSelector } from "./TimezoneSelector";

interface AddMemberFormProps {
  onAdd: (name: string, timezone: string) => void;
  currentMemberCount: number;
  existingTimezones?: string[];
}

export function AddMemberForm({ onAdd, currentMemberCount, existingTimezones = [] }: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(detectUserTimezone);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeName(name);
    const validation = validateMemberInput(sanitized, currentMemberCount);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid input");
      return;
    }
    setError(null);
    onAdd(sanitized, timezone);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="member-name" className="text-sm font-medium text-slate-600">
            Name
          </label>
          <input
            id="member-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Alex"
            maxLength={MAX_MEMBER_NAME_LENGTH}
            autoComplete="off"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <TimezoneSelector
            label="Timezone"
            value={timezone}
            onChange={setTimezone}
            pinnedTimezones={existingTimezones}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          disabled={!name.trim()}
        >
          Add Member
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
    </form>
  );
}
