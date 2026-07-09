"use client";

import React from "react";
import { motion } from "framer-motion";
import { AdminUsersPanel, type AdminRole, type AdminUserRow } from "@/components/admin/AdminUsersPanel";
import { ImpersonationPanel } from "@/components/admin/ImpersonationPanel";

interface AdminUsersSectionProps {
  currentUserId: string;
  isSuperAdmin: boolean;
  adminUsers: AdminUserRow[];
  isLoadingAdminUsers: boolean;
  savingAdminUserId: string | null;
  deletingAdminUserId: string | null;
  isCreatingAdminUser: boolean;
  loadError: string | null;
  onRefresh: () => void;
  onUpdateRole: (id: string, role: AdminRole) => void;
  onCreateUser: (payload: { name: string; email: string; password: string; role: AdminRole }) => void;
  onDeleteUser: (id: string) => void;
}

export function AdminUsersSection({
  currentUserId,
  isSuperAdmin,
  adminUsers,
  isLoadingAdminUsers,
  savingAdminUserId,
  deletingAdminUserId,
  isCreatingAdminUser,
  loadError,
  onRefresh,
  onUpdateRole,
  onCreateUser,
  onDeleteUser,
}: AdminUsersSectionProps) {
  return (
    <motion.div
      key="adminUsers"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ImpersonationPanel currentUserId={currentUserId} isSuperAdmin={isSuperAdmin} adminUsers={adminUsers} />
      <AdminUsersPanel
        currentUserId={currentUserId}
        users={adminUsers}
        isLoading={isLoadingAdminUsers}
        savingUserId={savingAdminUserId}
        deletingUserId={deletingAdminUserId}
        isCreatingUser={isCreatingAdminUser}
        error={loadError}
        onRefresh={onRefresh}
        onUpdateRole={onUpdateRole}
        onCreateUser={onCreateUser}
        onDeleteUser={onDeleteUser}
      />
    </motion.div>
  );
}
