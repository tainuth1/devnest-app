"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  UserPlus,
  AlertCircle,
  UserMinus,
  Crown,
  RotateCwFadingClock,
} from "lucide-react";
import { Button, Input, Select } from "@/shared/components/ui";
import { toast } from "@/shared/components/ui/toast";
import {
  useCollaborators,
  InviteMemberModal,
  LeaveTeamModal,
  RemoveMemberModal,
  PendingInvitationsDrawer,
  ProjectMember,
} from "@/features/project";

function formatRole(role?: string): string {
  if (!role) return "Member";
  const upper = role.toUpperCase();
  if (upper === "OWNER") return "Owner";
  if (upper === "ADMIN") return "Admin";
  if (upper === "EDITOR") return "Editor";
  if (upper === "VIEWER") return "Viewer";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getRoleBadgeStyle(role?: string): string {
  const upper = role?.toUpperCase();
  if (upper === "OWNER") return "bg-amber-50 text-amber-700 border-amber-200";
  if (upper === "ADMIN")
    return "bg-purple-50 text-purple-700 border-purple-200";
  if (upper === "EDITOR") return "bg-sky-50 text-sky-700 border-sky-200";
  if (upper === "VIEWER") return "bg-zinc-100 text-zinc-700 border-zinc-200";
  return "bg-zinc-100 text-zinc-700 border-zinc-200";
}

function getInitials(member: ProjectMember): string {
  if (member.first_name) {
    return member.first_name.charAt(0).toUpperCase();
  }
  if (member.username) {
    return member.username.charAt(0).toUpperCase();
  }
  if (member.email) {
    return member.email.charAt(0).toUpperCase();
  }
  return "U";
}

const TeamPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectCode = (params?.project_code as string) || "";

  const {
    filteredMembers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
    inviteMember,
    removeMember,
    leaveTeam,
    updateMemberRole,

    pendingInvitations,
    isLoadingInvitations,
    fetchPendingInvitations,
    revokeInvitation,

    currentUserRole,
    isOwner,
    isAdmin,
    canManageCollaborators,
    canChangeRoles,
  } = useCollaborators(projectCode);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [leavingMemberId, setLeavingMemberId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  // Remove collaborator state
  const [removingMember, setRemovingMember] = useState<ProjectMember | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useState(false);

  // Role update state
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const handleInvite = async (email: string, role: string) => {
    try {
      await inviteMember({ email, role });
      toast.success(`Invitation dispatched to ${email}.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send invitation.";
      toast.error(msg);
      throw err;
    }
  };

  const handleRevokeInvitation = async (
    invitationId: string,
    email: string
  ) => {
    try {
      await revokeInvitation(invitationId);
      toast.success(`Invitation for ${email} has been revoked.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to revoke invitation.";
      toast.error(msg);
      throw err;
    }
  };

  const handleConfirmLeave = async () => {
    if (!leavingMemberId) return;
    setIsLeaving(true);
    try {
      await leaveTeam(leavingMemberId);
      toast.success("You have left the project.");
      setLeavingMemberId(null);
      router.push("/workspace/projects");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to leave team.";
      toast.error(msg);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removingMember) return;
    setIsRemoving(true);
    try {
      await removeMember(removingMember.user_id);
      toast.success(
        `${removingMember.email} has been removed from the project.`
      );
      setRemovingMember(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to remove member.";
      toast.error(msg);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingMemberId(userId);
    try {
      await updateMemberRole(userId, newRole);
      toast.success(`Role updated to ${formatRole(newRole)}.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update collaborator role.";
      toast.error(msg);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Determine allowed roles for this specific member row according to RBAC matrix
  const getAllowedRolesForMember = (member: ProjectMember): string[] => {
    const memberRole = member.role?.toUpperCase();

    // Owner role cannot be modified via this endpoint
    if (memberRole === "OWNER") return [];

    // User cannot modify their own role
    if (member.is_you) return [];

    // Editors and Viewers cannot change any roles
    if (!canChangeRoles) return [];

    // Owner can change any member to Admin, Editor, or Viewer
    if (isOwner) {
      return ["ADMIN", "EDITOR", "VIEWER"];
    }

    // Admin constraints:
    // - Admin CANNOT modify roles of other Admins
    // - Admin CANNOT promote member to Admin
    // - Admin can only toggle between Editor and Viewer
    if (isAdmin) {
      if (memberRole === "ADMIN") return [];
      return ["EDITOR", "VIEWER"];
    }

    return [];
  };

  // Check if current user can remove this member
  const canRemoveMember = (member: ProjectMember): boolean => {
    if (member.is_you) return false;
    const memberRole = member.role?.toUpperCase();

    // Owner cannot be removed
    if (memberRole === "OWNER") return false;

    // Owner can remove any non-owner member
    if (isOwner) return true;

    // Admin can remove Editor and Viewer only (cannot remove Owner or Admin)
    if (isAdmin) {
      return memberRole === "EDITOR" || memberRole === "VIEWER";
    }

    return false;
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] flex-1 bg-white">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 md:px-10 md:py-10">
        {/* Page Header */}
        <div>
          <h1 className="text-heading text-2xl font-bold tracking-tight">
            Team
          </h1>
          <p className="text-description mt-1 text-sm">
            Manage team members and invitations
          </p>
        </div>

        {/* Filter and Action Bar */}
        <div className="flex flex-col items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="w-full sm:w-64">
            <Input
              size="md"
              placeholder="Filter members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="text-muted h-4 w-4" />}
            />
          </div>

          {/* Action Buttons: Pending invites button in front of Invite button */}
          <div className="flex items-center gap-2">
            {canManageCollaborators && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<RotateCwFadingClock className="h-4 w-4" />}
                onClick={() => setIsDrawerOpen(true)}
              >
                Pending invites
                {pendingInvitations.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                    {pendingInvitations.length}
                  </span>
                )}
              </Button>
            )}

            {canManageCollaborators && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => setIsInviteModalOpen(true)}
              >
                Invite members
              </Button>
            )}
          </div>
        </div>

        {/* Members Table Card */}
        <div className="border-border rounded-xl border bg-white shadow-2xs">
          {/* Table Header */}
          <div className="border-border text-description grid grid-cols-12 rounded-t-xl border-b bg-zinc-50/40 px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">
            <div className="col-span-6 sm:col-span-5">MEMBER</div>
            <div className="col-span-4 sm:col-span-4">ROLE</div>
            <div className="col-span-2 text-right sm:col-span-3">ACTIONS</div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="divide-border-subtle divide-y">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid animate-pulse grid-cols-12 items-center px-6 py-4"
                >
                  <div className="col-span-6 flex items-center gap-3 sm:col-span-5">
                    <div className="border-border h-8 w-8 rounded-full border bg-zinc-100" />
                    <div className="h-4 w-44 rounded bg-zinc-100" />
                  </div>
                  <div className="col-span-4 sm:col-span-4">
                    <div className="h-4 w-20 rounded bg-zinc-100" />
                  </div>
                  <div className="col-span-2 text-right sm:col-span-3">
                    <div className="ml-auto h-7 w-20 rounded bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="space-y-3 p-10 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm text-red-600">{error}</p>
              <Button size="sm" variant="outline" onClick={refetch}>
                Retry
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-description p-12 text-center text-sm">
              {searchQuery
                ? "No team members matching your search."
                : "No team members found."}
            </div>
          ) : (
            <div className="divide-border-subtle divide-y">
              {filteredMembers.map((member) => {
                const allowedRoles = getAllowedRolesForMember(member);
                const isModifying = updatingMemberId === member.user_id;
                const canEditThisRole = allowedRoles.length > 0;
                const canRemove = canRemoveMember(member);
                const roleBadgeStyle = getRoleBadgeStyle(member.role);

                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-zinc-50/60"
                  >
                    {/* Member Column */}
                    <div className="col-span-6 flex min-w-0 items-center gap-3 pr-2 sm:col-span-5">
                      {/* Avatar */}
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.email}
                          width={32}
                          height={32}
                          unoptimized
                          className="border-border h-8 w-8 shrink-0 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="border-border text-heading flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-zinc-50 text-xs font-semibold uppercase">
                          {getInitials(member)}
                        </div>
                      )}

                      {/* Email and 'You' Badge */}
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-heading truncate text-sm font-medium">
                          {member.email}
                        </span>
                        {member.is_you && (
                          <span className="inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role Column */}
                    <div className="col-span-4 flex items-center gap-2 sm:col-span-4">
                      {canEditThisRole ? (
                        <Select
                          size="sm"
                          value={member.role?.toUpperCase()}
                          onChange={(newRole) =>
                            handleRoleChange(member.user_id, newRole)
                          }
                          options={allowedRoles.map((role) => ({
                            value: role.toUpperCase(),
                            label: formatRole(role),
                            dotColor:
                              role.toUpperCase() === "ADMIN"
                                ? "bg-purple-500"
                                : role.toUpperCase() === "EDITOR"
                                  ? "bg-sky-500"
                                  : "bg-zinc-400",
                          }))}
                          isLoading={isModifying}
                          disabled={isModifying}
                          menuClassName="w-36"
                        />
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeStyle}`}
                        >
                          {member.role?.toUpperCase() === "OWNER" && (
                            <Crown className="h-3 w-3 text-amber-600" />
                          )}
                          {formatRole(member.role)}
                        </span>
                      )}
                    </div>

                    {/* Action Column */}
                    <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-3">
                      {/* Leave team (self) */}
                      {member.is_you && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={member.role?.toUpperCase() === "OWNER"}
                          title={
                            member.role?.toUpperCase() === "OWNER"
                              ? "Project owners cannot leave the project without transferring ownership"
                              : "Leave this project"
                          }
                          onClick={() => setLeavingMemberId(member.user_id)}
                        >
                          Leave team
                        </Button>
                      )}

                      {/* Remove member (Owner/Admin removing collaborator) */}
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={
                            <UserMinus className="h-3.5 w-3.5 text-red-600" />
                          }
                          onClick={() => setRemovingMember(member)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table Footer Count */}
          <div className="border-border text-description rounded-b-xl border-t bg-white px-6 py-3.5 text-xs font-medium">
            {filteredMembers.length}{" "}
            {filteredMembers.length === 1 ? "Member" : "Members"}
          </div>
        </div>
      </div>

      {/* Pending Invitations Drawer */}
      <PendingInvitationsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        invitations={pendingInvitations}
        isLoading={isLoadingInvitations}
        onRevoke={handleRevokeInvitation}
        currentUserRole={currentUserRole}
        onRefresh={fetchPendingInvitations}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        currentUserRole={currentUserRole}
      />

      {/* Leave Team Confirmation Modal */}
      <LeaveTeamModal
        isOpen={Boolean(leavingMemberId)}
        onClose={() => setLeavingMemberId(null)}
        onConfirm={handleConfirmLeave}
        isLoading={isLeaving}
      />

      {/* Remove Collaborator Confirmation Modal */}
      <RemoveMemberModal
        isOpen={Boolean(removingMember)}
        onClose={() => setRemovingMember(null)}
        onConfirm={handleConfirmRemove}
        memberName={removingMember?.email}
        memberRole={formatRole(removingMember?.role)}
        isLoading={isRemoving}
      />
    </div>
  );
};

export default TeamPage;
