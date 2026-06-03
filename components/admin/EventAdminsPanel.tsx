import { useMemo, useState } from "react";
import { PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { type AdminUserRow } from "@/components/admin/AdminUsersPanel";

export type EventAdminAssignment = {
  id: number;
  userId: string;
  role: "admin" | "owner";
  createdAt: string;
};

interface EventAdminsPanelProps {
  eventId: string | null;
  eventLabel?: string;
  admins: EventAdminAssignment[];
  adminUsers: AdminUserRow[];
  isLoading: boolean;
  isAdding: boolean;
  removingUserId: string | null;
  error: string | null;
  onRefresh: () => void;
  onAddAdmin: (payload: { userId: string; role: "admin" | "owner" }) => void;
  onRemoveAdmin: (userId: string) => void;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "-";
  }

  return date.toISOString().slice(0, 16).replace("T", " ");
}

export function EventAdminsPanel({
  eventId,
  eventLabel,
  admins,
  adminUsers,
  isLoading,
  isAdding,
  removingUserId,
  error,
  onRefresh,
  onAddAdmin,
  onRemoveAdmin,
}: EventAdminsPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "owner">("admin");

  const adminUserOptions = useMemo(
    () => adminUsers.filter((user) => user.role === "admin" || user.role === "super_admin"),
    [adminUsers]
  );

  const userMap = useMemo(() => {
    const map = new Map<string, AdminUserRow>();
    for (const user of adminUsers) {
      map.set(user.id, user);
    }
    return map;
  }, [adminUsers]);

  const availableUsers = useMemo(() => {
    const assignedUserIds = new Set(admins.map((admin) => admin.userId));
    return adminUserOptions.filter((user) => !assignedUserIds.has(user.id));
  }, [adminUserOptions, admins]);

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) {
      return;
    }

    onAddAdmin({ userId: selectedUserId, role: selectedRole });
    setSelectedUserId("");
    setSelectedRole("admin");
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 font-khmer">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Event Admins</h3>
          <p className="text-xs text-white/45">
            {eventId ? `Manage admins for ${eventLabel || "selected event"}` : "Select an event to manage admins."}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={!eventId || isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 disabled:opacity-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {!eventId ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Choose an event above before managing event admins.
        </div>
      ) : (
        <>
          <form onSubmit={handleAdd} className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="md:col-span-2 rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
              disabled={isAdding || availableUsers.length === 0}
            >
              <option value="">Select admin user</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as "admin" | "owner")}
              className="rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
              disabled={isAdding || availableUsers.length === 0}
            >
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <button
              type="submit"
              disabled={isAdding || !selectedUserId}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-3 py-2.5 text-sm text-cyan-100 disabled:opacity-60"
            >
              <PlusCircle size={14} />
              {isAdding ? "Adding..." : "Add"}
            </button>
          </form>

          {isLoading ? (
            <p className="text-sm text-white/45">Loading event admins...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-white/45">No admins assigned yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-black/30 text-white/45">
                  <tr>
                    <th className="px-4 py-2.5 text-left">User</th>
                    <th className="px-4 py-2.5 text-left">Role</th>
                    <th className="px-4 py-2.5 text-left">Added</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const user = userMap.get(admin.userId);
                    return (
                      <tr key={admin.id} className="border-t border-white/10">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{user?.name || admin.userId}</div>
                          <div className="text-xs text-white/45">{user?.email || admin.userId}</div>
                        </td>
                        <td className="px-4 py-3 text-white/80">{admin.role}</td>
                        <td className="px-4 py-3 text-white/60">{formatTimestamp(admin.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onRemoveAdmin(admin.userId)}
                            disabled={removingUserId === admin.userId}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-200 disabled:opacity-60"
                          >
                            <Trash2 size={13} />
                            {removingUserId === admin.userId ? "Removing..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
