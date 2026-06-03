import React, { useEffect, useState } from "react";
import { LogOut, LogIn, User } from "lucide-react";
import { motion } from "framer-motion";

interface ImpersonationStatus {
  isImpersonating: boolean;
  impersonating?: {
    userId: string;
    email: string;
    name: string;
  };
  actualUser: {
    userId: string;
    email: string;
    name: string;
  };
  impersonatedAt?: string;
}

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ImpersonationPanelProps {
  currentUserId: string;
  isSuperAdmin: boolean;
  adminUsers: AdminUserRow[];
  onRefresh?: () => void;
}

export function ImpersonationPanel({
  currentUserId,
  isSuperAdmin,
  adminUsers,
}: ImpersonationPanelProps) {
  const [status, setStatus] = useState<ImpersonationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate");
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
        setError(null);
      } else {
        setError(data.error ?? "Failed to fetch impersonation status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStatus();
    }
  }, [isSuperAdmin]);

  const handleImpersonate = async () => {
    if (!selectedAdminId.trim()) {
      setError("Please select an admin to impersonate");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAdminId: selectedAdminId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to impersonate admin");
        return;
      }

      setStatus({
        isImpersonating: true,
        impersonating: data.impersonating,
        actualUser: data.actualUser,
        impersonatedAt: new Date().toISOString(),
      });
      setSelectedAdminId("");
      setShowForm(false);
      setError(null);
      // Refresh the page to apply impersonation
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to impersonate");
    } finally {
      setLoading(false);
    }
  };

  const handleStopImpersonate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to stop impersonation");
        return;
      }

      setStatus({
        isImpersonating: false,
        actualUser: status!.actualUser,
      });
      setError(null);
      // Refresh the page to apply changes
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop impersonation");
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {status?.isImpersonating ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-400/30 bg-amber-500/15 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-100/70 font-semibold">
                ⚠️ Impersonating Admin
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-amber-100/50">Currently logged in as:</p>
                  <p className="text-sm font-medium text-amber-100">
                    {status.impersonating?.name} ({status.impersonating?.email})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-amber-100/50">Your actual account:</p>
                  <p className="text-sm font-medium text-amber-100">
                    {status.actualUser.name} ({status.actualUser.email})
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStopImpersonate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm text-amber-100 hover:bg-amber-500/30 disabled:opacity-50"
            >
              <LogOut size={14} />
              {loading ? "Stopping..." : "Stop Impersonating"}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-purple-300" />
              <p className="text-sm text-purple-100">
                Logged in as: <span className="font-medium">{status?.actualUser.name}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/20 px-4 py-2 text-sm text-purple-100 hover:bg-purple-500/30"
            >
              <LogIn size={14} />
              {showForm ? "Cancel" : "Login As Admin"}
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3 pt-4 border-t border-purple-400/20"
            >
              <div>
                <label className="block text-xs text-purple-100/70 mb-2">
                  Select admin to impersonate:
                </label>
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full rounded-lg border border-purple-400/30 bg-black/25 px-4 py-2 text-sm text-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                >
                  <option value="">Choose an admin...</option>
                  {adminUsers
                    .filter(
                      (user) =>
                        user.id !== currentUserId &&
                        (user.role === "admin" || user.role === "super_admin")
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImpersonate}
                  disabled={!selectedAdminId || loading}
                  className="flex-1 rounded-lg border border-purple-400/30 bg-purple-500/20 px-3 py-2 text-sm text-purple-100 hover:bg-purple-500/30 disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Impersonate"}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
