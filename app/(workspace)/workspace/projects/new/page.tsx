import { CreateProjectForm } from "@/features/project";

export const metadata = {
  title: "Create a new project | DevNest",
  description: "Create and configure a new project workspace and database.",
};

export default function CreateProjectPage() {
  return (
    <div className="text-heading min-h-full py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <CreateProjectForm />
      </div>
    </div>
  );
}
