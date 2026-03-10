import type { Member } from "../../domain/models/types";

interface MemberListProps {
  members: Member[];
  activeMemberId: string | null;
  onSelect: (memberId: string) => void;
  onRemove: (memberId: string) => void;
}

export function MemberList({
  members,
  activeMemberId,
  onSelect,
  onRemove,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        Add members to start coordinating availability
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member) => (
        <button
          key={member.id}
          onClick={() => onSelect(member.id)}
          className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            activeMemberId === member.id
              ? "border-indigo-300 bg-indigo-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: member.color }}
          />
          <span>{member.name}</span>
          <span className="text-xs text-slate-400">
            {member.availability.length} slots
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              onRemove(member.id);
            }}
            className="ml-1 hidden text-slate-400 transition-colors hover:text-red-500 group-hover:inline-block"
          >
            ×
          </span>
        </button>
      ))}
    </div>
  );
}
