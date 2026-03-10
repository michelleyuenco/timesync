import { useMemo, useState } from "react";
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
    shareUrl,
  } = useGroupStore();

  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            TimeSync
          </h1>
          <p className="text-slate-500">
            Coordinate availability across time zones for the{" "}
            <span className="font-medium text-slate-700">{group.name}</span>
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
        <AddMemberForm onAdd={addMember} currentMemberCount={group.members.length} />
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
    </div>
  );
}
