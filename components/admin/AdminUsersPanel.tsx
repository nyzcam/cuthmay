import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Crown, Shield, Search, RefreshCw, UserCog } from "lucide-react";

type AdminRole = "super_admin" | "admin" | "guest";

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
  error: string | null;
  onRefresh: () => void;
  onUpdateRole: (id: string, role: AdminRole) => void;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super admin",
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
  error,
  onRefresh,
  onUpdateRole,
}: AdminUsersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");

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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6 backdrop-blur-md"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-200/90">
              <UserCog size={16} />
              <span className="text-sm font-medium">Super admin only</span>
            </div>
            <h2 className="text-xl font-bold text-white">Control admin users</h2>
            <p className="max-w-2xl text-sm leading-6 text-white/60">
              មើល និងកែសម្រួល role របស់អ្នកប្រើ admin បានតែ super_admin ប៉ុណ្ណោះ។
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : undefined} />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Users</p>
            <p className="mt-3 text-2xl font-bold text-white">{counts.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Super admins</p>
            <p className="mt-3 text-2xl font-bold text-white">{counts.superAdmins}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Admins</p>
            <p className="mt-3 text-2xl font-bold text-white">{counts.admins}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search admin users..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white/80 placeholder-white/30 focus:border-white/30 focus:outline-none focus:bg-white/10"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as "all" | AdminRole)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 focus:border-white/30 focus:outline-none appearance-none"
        >
          <option value="all">All roles</option>
          <option value="super_admin">Super admin</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
      </div>

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
              <thead className="bg-black/10 text-white/40 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
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
                            disabled={savingUserId === user.id || isCurrentUser}
                            onChange={(event) => onUpdateRole(user.id, event.target.value as AdminRole)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 focus:border-white/30 focus:outline-none disabled:opacity-40"
                          >
                            <option value="guest">Guest</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super admin</option>
                          </select>
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