"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProject, updateProject } from "@/services/projectService";
import { DatabaseEntryPage } from "@/components/databases/DatabaseEntryPage";
import type { Project, EntryStatus } from "@/types/models";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getProject(params.projectId);
      if (!data) {
        router.replace("/projects");
        return;
      }
      setProject(data);
      setIsLoading(false);
    }
    void load();
  }, [params.projectId, router]);

  const handleSave = useCallback(
    async (data: {
      title?: string;
      content?: string;
      status?: EntryStatus;
      coverImage?: string;
      icon?: string;
    }) => {
      if (!project) return;
      const updates: Parameters<typeof updateProject>[1] = {};
      if (data.title !== undefined) updates.name = data.title;
      if (data.content !== undefined) updates.content = data.content;
      if (data.status !== undefined) updates.status = data.status;
      if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
      if (data.icon !== undefined) updates.icon = data.icon;
      await updateProject(project.id, updates);
      setProject((prev) => (prev ? { ...prev, ...updates } : null));
    },
    [project]
  );

  const handlePropertyChange = useCallback(
    async (key: string, value: string) => {
      if (!project) return;
      await updateProject(project.id, { [key]: value });
    },
    [project]
  );

  if (isLoading || !project) {
    return <p className="text-sm text-zinc-400">Loading project...</p>;
  }

  return (
    <DatabaseEntryPage
      initialData={{
        title: project.name,
        content: project.content,
        status: project.status,
        coverImage: project.coverImage,
        icon: project.icon,
        properties: {
          description: project.description,
          gitRepo: project.gitRepo,
          link: project.link,
        },
      }}
      propertyLabels={[
        { key: "description", label: "Description" },
        { key: "gitRepo", label: "Git Repo" },
        { key: "link", label: "Link" },
      ]}
      backHref="/projects"
      backLabel="Back to Projects"
      onSave={handleSave}
      onPropertyChange={handlePropertyChange}
    />
  );
}
