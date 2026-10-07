"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ProjectMember,
  InviteMemberRequest,
  InviteMemberResponse,
  ProjectInvitation,
} from "../types";
import { CollaboratorService } from "../services/collaborator.service";
import { ApiError } from "@/shared/types";

export interface UseCollaboratorsReturn {
  members: ProjectMember[];
  filteredMembers: ProjectMember[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
  inviteMember: (data: InviteMemberRequest) => Promise<InviteMemberResponse>;
  removeMember: (userId: string) => Promise<void>;
  leaveTeam: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: string) => Promise<void>;

  // Pending Invitations Management
  pendingInvitations: ProjectInvitation[];
  isLoadingInvitations: boolean;
  invitationsError: string | null;
  fetchPendingInvitations: () => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;

  // Computed RBAC helpers
  currentMember: ProjectMember | undefined;
  currentUserRole: string | undefined;
  isOwner: boolean;
  isAdmin: boolean;
  canManageCollaborators: boolean;
  canChangeRoles: boolean;
}

export function useCollaborators(projectCode: string): UseCollaboratorsReturn {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pending Invitations state
  const [pendingInvitations, setPendingInvitations] = useState<
    ProjectInvitation[]
  >([]);
  const [isLoadingInvitations, setIsLoadingInvitations] =
    useState<boolean>(false);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectCode) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await CollaboratorService.getMembers(projectCode);
      setMembers(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load project members";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [projectCode]);

  useEffect(() => {
    let isCancelled = false;

    if (!projectCode) {
      return;
    }

    async function load() {
      try {
        const data = await CollaboratorService.getMembers(projectCode);
        if (!isCancelled) {
          setMembers(data);
          setError(null);
        }
        const myMember = data.find((m) => m.is_you);
        const myRole = myMember?.role?.toUpperCase();
        if (myRole === "OWNER" || myRole === "ADMIN") {
          try {
            const pending =
              await CollaboratorService.getPendingInvitations(projectCode);
            if (!isCancelled) {
              setPendingInvitations(pending);
            }
          } catch {
            // Silently ignore background invitation error
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Failed to load project members";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [projectCode]);

  // Current logged in member and RBAC role computations
  const currentMember = useMemo(() => members.find((m) => m.is_you), [members]);

  const currentUserRole = useMemo(
    () => currentMember?.role?.toUpperCase(),
    [currentMember]
  );

  const isOwner = currentUserRole === "OWNER";
  const isAdmin = currentUserRole === "ADMIN";
  const canManageCollaborators = isOwner || isAdmin;
  const canChangeRoles = isOwner || isAdmin;

  // Fetch pending invitations (requires Owner or Admin)
  const fetchPendingInvitations = useCallback(async () => {
    if (!projectCode) return;
    setIsLoadingInvitations(true);
    setInvitationsError(null);
    try {
      const data = await CollaboratorService.getPendingInvitations(projectCode);
      setPendingInvitations(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load pending invitations";
      setInvitationsError(message);
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [projectCode]);

  // Filter members by search query (email, username, fullName, role)
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const email = m.email?.toLowerCase() || "";
      const username = m.username?.toLowerCase() || "";
      const fullName =
        `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase();
      const role = m.role?.toLowerCase() || "";
      return (
        email.includes(q) ||
        username.includes(q) ||
        fullName.includes(q) ||
        role.includes(q)
      );
    });
  }, [members, searchQuery]);

  // In-place mutation: append newly created invitation to local state
  const inviteMember = async (
    data: InviteMemberRequest
  ): Promise<InviteMemberResponse> => {
    const result = await CollaboratorService.inviteMember(projectCode, data);
    const newInvitation: ProjectInvitation = {
      id: result.invitation_id,
      project_id: projectCode,
      invitee_email: result.invitee_email,
      email: result.invitee_email,
      role: result.role,
      status: result.status || "PENDING",
      expires_at: result.expires_at,
      created_at: new Date().toISOString(),
      inviter: currentMember
        ? {
            id: currentMember.user_id,
            email: currentMember.email,
            username: currentMember.username,
            first_name: currentMember.first_name,
            last_name: currentMember.last_name,
          }
        : null,
    };
    setPendingInvitations((prev) => [newInvitation, ...prev]);
    return result;
  };

  // In-place mutation: remove revoked invitation from local state
  const revokeInvitation = async (invitationId: string): Promise<void> => {
    await CollaboratorService.revokeInvitation(projectCode, invitationId);
    setPendingInvitations((prev) => prev.filter((i) => i.id !== invitationId));
  };

  // In-place mutation: filter out removed member from local state
  const removeMember = async (userId: string): Promise<void> => {
    await CollaboratorService.removeMember(projectCode, userId);
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  };

  // In-place mutation: filter out self when leaving
  const leaveTeam = async (userId: string): Promise<void> => {
    await CollaboratorService.removeMember(projectCode, userId);
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  };

  // In-place mutation: update member role directly in local state
  const updateMemberRole = async (
    userId: string,
    role: string
  ): Promise<void> => {
    const updated = await CollaboratorService.updateMemberRole(
      projectCode,
      userId,
      role
    );
    setMembers((prev) =>
      prev.map((m) =>
        m.user_id === userId
          ? {
              ...m,
              ...(updated || {}),
              role: role.toUpperCase(),
            }
          : m
      )
    );
  };

  return {
    members,
    filteredMembers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch: fetchMembers,
    inviteMember,
    removeMember,
    leaveTeam,
    updateMemberRole,

    pendingInvitations,
    isLoadingInvitations,
    invitationsError,
    fetchPendingInvitations,
    revokeInvitation,

    currentMember,
    currentUserRole,
    isOwner,
    isAdmin,
    canManageCollaborators,
    canChangeRoles,
  };
}
