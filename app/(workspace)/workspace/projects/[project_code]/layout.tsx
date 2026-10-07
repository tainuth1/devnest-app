import React from "react";
import ProjectSidebar from "@/features/project/components/layouts/project-sidebar";

interface ProjectManagementLayoutProps {
  children: React.ReactNode;
}

const ProjectManagementLayout: React.FC<ProjectManagementLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-1">
      <ProjectSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export default ProjectManagementLayout;
