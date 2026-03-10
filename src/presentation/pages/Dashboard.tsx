import { useEffect, useMemo, useRef, useState } from "react";
import { useGroupStore } from "../../application/store/group.store";
import { computeOverlap, findBestSlots } from "../../application/services/availability.service";
import { formatHour } from "../../application/services/timezone.service";
import { DAY_LABELS } from "../../domain/models/types";
import { AddMemberForm } from "../components/AddMemberForm";
import { MemberList } from "../components/MemberList";
import { AvailabilityGrid } from "../components/AvailabilityGrid";
import { OverlapGrid } from "../components/OverlapGrid";
import { TimezoneSelector } from "../components/TimezoneSelector";
import { Legend } from "../components/Legend";

export function Dashboard() {
  const {
    group,
    loading,
    viewTimezone,
    setViewTimezone,
    addMember,
    removeMember,
    updateMemberAvailability,
    updateGroupName,
    shareUrl,
  } = useGroupStore();

  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (group) {
      document.title = `TimeSync — ${group.name}`;
    }
    return () => { document.title = "TimeSync"; };
  }, [group?.name]);

  const startEditingName = () => {
    setNameInput(group?.name ?? "");
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const commitName = () => {
    if (nameInput.trim()) updateGroupName(nameInput.trim());
    setEditingName(false);
  };

  const activeMember = group?.members.find((m) => m.id === activeMemberId) ?? null;

  const overlap = useMemo(
    () => (group ? computeOverlap(group.members, viewTimezone) : []),
    [group, viewTimezone],
  );

  const bestSlots = useMemo(
    () => (group ? findBestSlots(overlap, group.members.length) : []),
    [overlap, group],
  );

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-slate-500">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 -mx-4 px-4 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:mx-0 sm:px-0 sm:py-0 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            TimeSync
          </h1>
          <p className="text-slate-500">
            Coordinate availability across time zones for the{" "}
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") setEditingName(false); }}
                className="inline-block rounded border border-indigo-300 bg-indigo-50 px-1 py-0.5 text-base font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <span
                className="cursor-pointer font-medium text-slate-700 underline decoration-dashed underline-offset-2 hover:text-indigo-600"
                title="Click to edit group name"
                onClick={startEditingName}
              >
                {group.name}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? "Copied!" : "Share Link"}
        </button>
      </header>

      {/* Add Member */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add Member
        </h2>
        <AddMemberForm onAdd={addMember} currentMemberCount={group.members.length} existingTimezones={group.members.map((m) => m.timezone)} />
      </section>

      {/* Members */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Members ({group.members.length})
        </h2>
        <MemberList
          members={group.members}
          activeMemberId={activeMemberId}
          onSelect={setActiveMemberId}
          onRemove={removeMember}
        />
      </section>

      {/* Empty state */}
      {group.members.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No members yet</p>
          <p className="mt-1 text-xs text-slate-400">Add your first member above to get started.</p>
        </div>
      )}

      {/* Individual Availability */}
      {activeMember && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: activeMember.color }}
              />
              {activeMember.name}'s Availability
              <span className="ml-2 text-xs font-normal normal-case text-slate-400">
                (click &amp; drag to select)
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Timezone: {activeMember.timezone}
            </span>
          </div>
          <AvailabilityGrid
            slots={activeMember.availability}
            memberColor={activeMember.color}
            onChange={(slots) => updateMemberAvailability(activeMember.id, slots)}
          />
        </section>
      )}

      {/* Group Overlap */}
      {group.members.length >= 2 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Group Availability Overlap
              </h2>
              {bestSlots.length > 0 && (
                <p className="mt-1 text-xs text-emerald-600">
                  Best time(s):{" "}
                  {bestSlots.slice(0, 5).map((s) => (
                    <span key={`${s.day}-${s.hour}`} className="mr-2 font-medium">
                      {DAY_LABELS[s.day]} {formatHour(s.hour)}
                    </span>
                  ))}
                  {bestSlots.length > 5 && (
                    <span className="text-slate-400">
                      +{bestSlots.length - 5} more
                    </span>
                  )}
                </p>
              )}
            </div>
            <TimezoneSelector
              value={viewTimezone}
              onChange={setViewTimezone}
              label="View in timezone"
              pinnedTimezones={group.members.map((m) => m.timezone)}
            />
          </div>
          <Legend totalMembers={group.members.length} />
          <div className="mt-3">
            <OverlapGrid
              overlap={overlap}
              members={group.members}
              totalMembers={group.members.length}
            />
          </div>
        </section>
      )}

      {/* Empty state for overlap */}
      {group.members.length > 0 && group.members.length < 2 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          Add at least 2 members to see availability overlap
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-6 pb-4 text-center">
        <a
          href="https://github.com/michelleyuenco/timesync"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          Open source on GitHub — contribute or fork
        </a>
      </footer>
    </div>
  );
}
