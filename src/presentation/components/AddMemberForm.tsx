import { useState } from "react";
import { detectUserTimezone } from "../../application/services/timezone.service";
import {
  sanitizeName,
  validateMemberInput,
  findNameConflict,
  generateNameSuffix,
  MAX_MEMBER_NAME_LENGTH,
} from "../../application/services/validation.service";
import { TimezoneSelector } from "./TimezoneSelector";

const LS_NAME_KEY = "timesync:last-name";
const LS_TZ_KEY = "timesync:last-timezone";

interface ExistingMember {
  id: string;
  name: string;
}

interface AddMemberFormProps {
  onAdd: (name: string, timezone: string) => void;
  onClaimIdentity: (memberId: string) => void;
  currentMemberCount: number;
  existingMembers: ExistingMember[];
  existingTimezones?: string[];
}

export function AddMemberForm({
  onAdd,
  onClaimIdentity,
  currentMemberCount,
  existingMembers,
  existingTimezones = [],
}: AddMemberFormProps) {
  const [name, setName] = useState(() => localStorage.getItem(LS_NAME_KEY) ?? "");
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem(LS_TZ_KEY) ?? detectUserTimezone()
  );
  const [error, setError] = useState<string | null>(null);
  const [nameWarning, setNameWarning] = useState<{
    type: "exact" | "similar";
    suggestedName: string;
    matchedMembers: ExistingMember[];
  } | null>(null);

  const existingNames = existingMembers.map((m) => m.name);

  const checkName = (value: string) => {
    const sanitized = sanitizeName(value);
    if (sanitized.length < 2) {
      setNameWarning(null);
      return;
    }
    const conflict = findNameConflict(sanitized, existingNames);
    if (conflict) {
      const lower = sanitized.toLowerCase();
      const matched = existingMembers.filter((m) => {
        const mLower = m.name.toLowerCase();
        return conflict === "exact"
          ? mLower === lower
          : mLower.startsWith(lower) || lower.startsWith(mLower);
      });
      setNameWarning({
        type: conflict,
        suggestedName: `${sanitized}-${generateNameSuffix()}`,
        matchedMembers: matched,
      });
    } else {
      setNameWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeName(name);
    const validation = validateMemberInput(sanitized, currentMemberCount);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid input");
      return;
    }
    localStorage.setItem(LS_NAME_KEY, sanitized);
    localStorage.setItem(LS_TZ_KEY, timezone);
    setError(null);
    setNameWarning(null);
    onAdd(sanitized, timezone);
    setName("");
  };

  const applySuggestion = () => {
    if (!nameWarning) return;
    setName(nameWarning.suggestedName);
    setNameWarning(null);
    setError(null);
  };

  const handleClaimIdentity = (member: ExistingMember) => {
    localStorage.setItem(LS_NAME_KEY, member.name);
    setName("");
    setNameWarning(null);
    setError(null);
    onClaimIdentity(member.id);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="member-name" className="text-sm font-medium text-slate-600">
            Name
            {localStorage.getItem(LS_NAME_KEY) && (
              <span className="ml-2 text-xs font-normal text-indigo-400">remembered</span>
            )}
          </label>
          <input
            id="member-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
              checkName(e.target.value);
            }}
            placeholder="e.g. Jane Doe"
            maxLength={MAX_MEMBER_NAME_LENGTH}
            autoComplete="off"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <TimezoneSelector
            label="Timezone"
            value={timezone}
            onChange={(tz) => {
              setTimezone(tz);
            }}
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

      {nameWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm" role="status">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div className="flex-1 space-y-2">
              <p className="text-amber-800">
                {nameWarning.type === "exact"
                  ? "This name already exists in the pool. Is this you?"
                  : "A similar name already exists. Is this you?"}
              </p>

              {/* Claim identity buttons for matched members */}
              <div className="flex flex-wrap gap-2">
                {nameWarning.matchedMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleClaimIdentity(member)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yes, I'm {member.name}
                  </button>
                ))}
              </div>

              {/* Or add as new with variant */}
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <span>Not you?</span>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="rounded bg-amber-200 px-2 py-0.5 font-medium text-amber-900 transition-colors hover:bg-amber-300"
                >
                  Add as {nameWarning.suggestedName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
    </form>
  );
}
