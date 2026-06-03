import { useMemo, useState } from "react";
import { BadgeCheck, Crown, Shield, Trash2, UserPlus2 } from "lucide-react";

export type AdminRole = "super_admin" | "admin" | "guest";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

interface AdminUsersPanelProps {
  currentUserId: string;
  users: AdminUserRow[];
  isLoading: boolean;
  savingUserId: string | null;
  deletingUserId: string | null;
  isCreatingUser: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdateRole: (id: string, role: AdminRole) => void;
  onDeleteUser: (id: string) => void;
  onCreateUser: (payload: {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
  }) => void;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  guest: "Guest",
};

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: "#f59e0b",
  admin: "#22d3ee",
  guest: "#94a3b8",
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "—";
  }

  return date.toISOString().slice(0, 16).replace("T", " ");
}

export function AdminUsersPanel({
  currentUserId,
  users,
  isLoading,
  savingUserId,
  deletingUserId,
  isCreatingUser,
  error,
  onRefresh,
  onUpdateRole,
  onDeleteUser,
  onCreateUser,
}: AdminUsersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<AdminRole>("admin");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        query === "" ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchQuery, users]);

  const counts = useMemo(
    () => ({
      total: users.length,
      superAdmins: users.filter((user) => user.role === "super_admin").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users]
  );

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreateUser({
      name: createName,
      email: createEmail,
      password: createPassword,
      role: createRole,
    });

    setCreatePassword("");
  };

  return (
    <div className="space-y-6 font-sans">
      <form
        onSubmit={handleCreateSubmit}
        className="grid gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/5 p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <p className="sm:col-span-2 lg:col-span-5 text-xs uppercase tracking-[0.18em] text-emerald-100/70">Create admin user</p>
        <input
          type="text"
          placeholder="Full name"
          value={createName}
          onChange={(event) => setCreateName(event.target.value)}
          className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white/80 placeholder-white/30 focus:border-white/30 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={createEmail}
          onChange={(event) => setCreateEmail(event.target.value)}
          required
          className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white/80 placeholder-white/30 focus:border-white/30 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password (min. 8 characters)"
          value={createPassword}
          onChange={(event) => setCreatePassword(event.target.value)}
          required
          minLength={8}
          className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white/80 placeholder-white/30 focus:border-white/30 focus:outline-none"
        />
        <select
          value={createRole}
          onChange={(event) => setCreateRole(event.target.value as AdminRole)}
          className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white/70 focus:border-white/30 focus:outline-none"
        >
          <option value="guest">Guest</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button
          type="submit"
          disabled={isCreatingUser}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-3 py-2.5 text-sm text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-60"
        >
          <UserPlus2 size={15} />
          {isCreatingUser ? "Creating..." : "Create user"}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-white/45">Loading admin users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/35">
          No admin users found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-black/20 text-white/45 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.07]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold text-white"
                            style={{
                              background: `${ROLE_COLORS[user.role]}22`,
                              borderColor: `${ROLE_COLORS[user.role]}55`,
                            }}
                          >
                            {user.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{user.name}</p>
                              {isCurrentUser && (
                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/35">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/55">{user.email}</td>
                      <td className="px-5 py-4 text-white/45">{formatTimestamp(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium"
                          style={{
                            background: `${ROLE_COLORS[user.role]}15`,
                            color: ROLE_COLORS[user.role],
                            borderColor: `${ROLE_COLORS[user.role]}30`,
                          }}
                        >
                          {user.role === "super_admin" ? <Crown size={12} /> : user.role === "admin" ? <Shield size={12} /> : <BadgeCheck size={12} />}
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={user.role}
                            disabled={savingUserId === user.id || deletingUserId === user.id || isCurrentUser}
                            onChange={(event) => onUpdateRole(user.id, event.target.value as AdminRole)}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 focus:border-white/30 focus:outline-none disabled:opacity-40"
                          >
                            <option value="guest">Guest</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => onDeleteUser(user.id)}
                            disabled={deletingUserId === user.id || isCurrentUser}
                            className="rounded-xl border border-red-300/30 bg-red-500/10 px-2.5 py-2 text-xs text-red-200 transition hover:bg-red-500/20 disabled:opacity-40"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {isCurrentUser && (
                          <p className="mt-2 text-[11px] text-white/30">Your own role is locked in the UI.</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}