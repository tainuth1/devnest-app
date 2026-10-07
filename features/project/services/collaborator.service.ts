import { apiClient } from "@/shared/services/api-client";
import {
  ProjectMember,
  InviteMemberRequest,
  InviteMemberResponse,
  ProjectInvitation,
} from "../types";

export class CollaboratorService {
  /**
   * Fetch all active members and their roles for a project.
   * Path: GET /api/projects/{project_id}/members
   */
  public static async getMembers(
    projectCodeOrId: string
  ): Promise<ProjectMember[]> {
    const response = await apiClient.get<ProjectMember[]>(
      `/api/projects/${projectCodeOrId}/members`
    );
    return response.data ?? [];
  }

  /**
   * Invite a collaborator to the project.
   * Path: POST /api/projects/{project_id}/invitations
   */
  public static async inviteMember(
    projectCodeOrId: string,
    data: InviteMemberRequest
  ): Promise<InviteMemberResponse> {
    const response = await apiClient.post<InviteMemberResponse>(
      `/api/projects/${projectCodeOrId}/invitations`,
      data
    );
    if (!response.data) {
      throw new Error(response.message || "Failed to dispatch invitation");
    }
    return response.data;
  }

  /**
   * Remove a collaborator from the project or leave the project.
   * Path: DELETE /api/projects/{project_id}/members/{user_id}
   */
  public static async removeMember(
    projectCodeOrId: string,
    userId: string
  ): Promise<void> {
    await apiClient.delete(
      `/api/projects/${projectCodeOrId}/members/${userId}`
    );
  }

  /**
   * Update the RBAC role of an active project collaborator.
   * Path: PATCH /api/projects/{project_id}/members/{user_id}
   */
  public static async updateMemberRole(
    projectCodeOrId: string,
    userId: string,
    role: string
  ): Promise<ProjectMember | null> {
    const response = await apiClient.patch<ProjectMember>(
      `/api/projects/${projectCodeOrId}/members/${userId}`,
      { role }
    );
    return response.data ?? null;
  }

  /**
   * List all pending invitations for a project.
   * Path: GET /api/projects/{project_id}/invitations
   */
  public static async getPendingInvitations(
    projectCodeOrId: string
  ): Promise<ProjectInvitation[]> {
    const response = await apiClient.get<ProjectInvitation[]>(
      `/api/projects/${projectCodeOrId}/invitations`
    );
    return response.data ?? [];
  }

  /**
   * Revoke a pending project invitation.
   * Path: DELETE /api/projects/{project_id}/invitations/{invitation_id}
   */
  public static async revokeInvitation(
    projectCodeOrId: string,
    invitationId: string
  ): Promise<void> {
    await apiClient.delete(
      `/api/projects/${projectCodeOrId}/invitations/${invitationId}`
    );
  }
}
