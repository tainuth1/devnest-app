import React from "react";
import Header from "@/shared/components/layouts/header";

interface ProjectLayoutProps {
  children: React.ReactNode;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({ children }) => {
  return (
    <div className="text-heading flex min-h-screen flex-col bg-white font-sans">
      <Header
        breadcrumbs={[{ label: "Workspace", href: "/workspace/projects" }]}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
};

export default ProjectLayout;
