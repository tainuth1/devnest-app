import React from "react";
import ProjectSidebar from "@/features/project/components/layouts/project-sidebar";

interface ProjectManagementLayoutProps {
  children: React.ReactNode;
}

const ProjectManagementLayout: React.FC<ProjectManagementLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
      <ProjectSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default ProjectManagementLayout;

