"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Input, Button, toast } from "@/shared/components/ui";
import { ProjectsService } from "@/features/project/services/project.service";
import { CreateProjectRequest } from "@/features/project/types";
import { ApiError } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name cannot be blank")
    .max(100, "Project name must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, "Project name cannot be blank"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

const INITIAL_FORM_DATA: CreateProjectFormData = {
  name: "",
  description: "",
};

export const CreateProjectForm: React.FC = () => {
  const router = useRouter();

  // Unified Form State (AGENTS.md Section 8.3)
  const [formData, setFormData] =
    useState<CreateProjectFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateProjectFormData, string>> & { general?: string }
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic slug preview
  const slugPreview = formData.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Unified Input Change Handler (AGENTS.md Section 8.3)
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear specific field validation error dynamically
    if (errors[name as keyof CreateProjectFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof CreateProjectFormData];
        return newErrors;
      });
    }

    // Clear general form banner error
    if (errors.general) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  // Form Submission with Zod Validation (AGENTS.md Section 8.4)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = createProjectSchema.parse(formData);
      setIsSubmitting(true);

      const payload: CreateProjectRequest = {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || undefined,
      };

      const createdProject = await ProjectsService.createProject(payload);

      toast.success(
        `Project "${createdProject.name || validatedData.name}" created successfully!`
      );

      // Smooth redirection to projects overview
      setTimeout(() => {
        router.push("/workspace/projects");
      }, 700);
    } catch (error) {
      setIsSubmitting(false);

      let errorMessage = "Failed to create project. Please try again.";
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<
          Record<keyof CreateProjectFormData, string>
        > = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof CreateProjectFormData] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.warning("Please check the form for validation errors.");
        return;
      } else if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* General Error Banner */}
      {errors.general && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-700 shadow-2xs">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Creation failed</p>
            <p className="mt-0.5">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="border-border overflow-hidden rounded-xl border bg-white shadow-2xs"
      >
        {/* Card Header */}
        <div className="border-border-subtle border-b p-6 sm:p-8">
          <h1 className="text-heading text-xl font-semibold tracking-tight">
            Create a new project
          </h1>
          <p className="text-description mt-1.5 text-xs leading-relaxed sm:text-sm">
            Your project will have its own dedicated instance and full Postgres
            database. An API will be set up so you can easily interact with your
            new database.
          </p>
        </div>

        {/* Form Body - Two-column horizontal row layout */}
        <div className="divide-border-subtle divide-y">
          {/* Field 1: Project Name */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-12 sm:gap-6 sm:p-8">
            <div className="sm:col-span-4">
              <label
                htmlFor="project-name"
                className="text-heading text-xs font-medium sm:text-sm"
              >
                Project name <span className="text-red-500">*</span>
              </label>
              <p className="text-description mt-1 text-xs">
                A unique identifier for your project workspace.
              </p>
            </div>

            <div className="sm:col-span-8">
              <Input
                id="project-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Acme API Gateway"
                maxLength={100}
                error={errors.name}
                helperText={
                  slugPreview ? (
                    <span className="text-muted text-xs">
                      Project slug preview:{" "}
                      <span className="text-body font-mono font-medium">
                        {slugPreview}
                      </span>
                    </span>
                  ) : undefined
                }
                autoFocus
              />
            </div>
          </div>

          {/* Field 2: Description */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-12 sm:gap-6 sm:p-8">
            <div className="sm:col-span-4">
              <label
                htmlFor="project-description"
                className="text-heading text-xs font-medium sm:text-sm"
              >
                Description
              </label>
              <p className="text-description mt-1 text-xs">
                Brief description of your service or architecture.
              </p>
            </div>

            <div className="sm:col-span-8">
              <textarea
                id="project-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. High-throughput microservice handling transaction lifecycle and reconciliation workflows."
                rows={3}
                className={cn(
                  "text-body placeholder:text-muted hover:border-border-hover focus:border-primary focus:ring-primary/20 w-full resize-y rounded-lg border bg-white p-3 text-xs shadow-2xs transition-colors focus:ring-2 focus:outline-none",
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-border"
                )}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-border flex items-center justify-end gap-3 border-t bg-zinc-50/50 px-6 py-4 sm:px-8">
          <Link href="/workspace/projects">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !formData.name.trim()}
          >
            Create new project
          </Button>
        </div>
      </form>
    </>
  );
};

export default CreateProjectForm;
