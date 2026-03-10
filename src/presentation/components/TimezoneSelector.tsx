import { ALL_TIMEZONES } from "../../domain/constants/timezones";

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
  pinnedTimezones?: string[]; // shown at top with separator
}

export function TimezoneSelector({ value, onChange, label, pinnedTimezones = [] }: TimezoneSelectorProps) {
  const uniquePinned = [...new Set(pinnedTimezones)].filter(Boolean);

  const pinnedOptions = uniquePinned
    .map((tz) => ALL_TIMEZONES.find((t) => t.value === tz) ?? { value: tz, label: tz, offset: 0 })
    .filter((t) => t !== undefined);

  const remainingOptions = ALL_TIMEZONES.filter((tz) => !uniquePinned.includes(tz.value));

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-600">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {pinnedOptions.length > 0 && (
          <optgroup label="Members' Timezones">
            {pinnedOptions.map((tz) => (
              <option key={`pinned-${tz.value}`} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label={pinnedOptions.length > 0 ? "All Timezones" : "Select Timezone"}>
          {remainingOptions.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
