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
    viewTimezone,
    setViewTimezone,
    addMember,
    removeMember,
    updateMemberAvailability,
  } = useGroupStore();

  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const activeMember = group.members.find((m) => m.id === activeMemberId) ?? null;

  const overlap = useMemo(
    () => computeOverlap(group.members, viewTimezone),
    [group.members, viewTimezone],
  );

  const bestSlots = useMemo(
    () => findBestSlots(overlap, group.members.length),
    [overlap, group.members.length],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          TimeSync
        </h1>
        <p className="text-slate-500">
          Coordinate availability across time zones for the{" "}
          <span className="font-medium text-slate-700">{group.name}</span>
        </p>
      </header>

      {/* Add Member */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add Member
        </h2>
        <AddMemberForm onAdd={(name, tz) => {
          addMember(name, tz);
        }} />
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
