"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "@/services/projectService";
import { StatusBadge } from "@/components/databases/StatusBadge";
import { EditableCell } from "@/components/databases/EditableCell";
import { SidePeek } from "@/components/ui/SidePeek";
import { DatabaseEntryPage } from "@/components/databases/DatabaseEntryPage";
import type { Project, EntryStatus } from "@/types/models";

export function ProjectTable() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peek");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [peekProject, setPeekProject] = useState<Project | null>(null);

  const refresh = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const items = await listProjects(workspaceId);
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setProjects(items);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (peekId) {
      getProject(peekId).then((data) => {
        if (data) setPeekProject(data);
        else setPeekProject(null);
      });
    } else {
      setPeekProject(null);
    }
  }, [peekId]);

  function closePeek() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("peek");
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  function openPeek(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("peek", id);
    router.replace(`${pathname}?${params}`);
  }

  function openFullPage(id: string) {
    router.push(`/projects/${id}`);
  }

  async function handleInlineAdd() {
    if (!workspaceId || !user) return;
    const projectId = await createProject(workspaceId, user.uid, { name: "" });
    await refresh();
    openPeek(projectId);
  }

  async function handleDelete(id: string) {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (peekId === id) closePeek();
  }

  async function handleStatusChange(id: string, status: EntryStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    await updateProject(id, { status });
    if (peekProject?.id === id) setPeekProject((p) => (p ? { ...p, status } : null));
  }

  async function handleFieldChange(
    id: string,
    field: keyof Pick<Project, "name" | "description" | "gitRepo" | "link">,
    value: string
  ) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    await updateProject(id, { [field]: value });
    if (peekProject?.id === id)
      setPeekProject((p) => (p ? { ...p, [field]: value } : null));
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="px-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          Projects
        </h1>

        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded">
            <span className="font-medium">Table</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-[20%] font-mono">
                  Aa Name
                </th>
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                  Description
                </th>
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                  Git Repo
                </th>
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                  Link
                </th>
                <th className="px-3 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td colSpan={6} className="px-3 py-3">
                      <div className="h-5 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium">
                        <div className="flex items-center gap-2">
                          <EditableCell
                            value={project.name}
                            onChange={(v) => handleFieldChange(project.id, "name", v)}
                            placeholder="Project name"
                            isTitle
                          />
                          <button
                            onClick={() => openPeek(project.id)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 rounded px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans font-normal"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </button>
                        </div>
                      </td>
                    <td className="px-3 py-2 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={project.description}
                        onChange={(v) => handleFieldChange(project.id, "description", v)}
                        placeholder="Add description"
                      />
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge
                        status={project.status}
                        onChange={(s) => handleStatusChange(project.id, s)}
                      />
                    </td>
                    <td className="px-3 py-2 max-w-[180px]" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={project.gitRepo}
                        onChange={(v) => handleFieldChange(project.id, "gitRepo", v)}
                        placeholder="https://..."
                      />
                    </td>
                    <td className="px-3 py-2 max-w-[180px] text-zinc-600 dark:text-zinc-300" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={project.link}
                        onChange={(v) => handleFieldChange(project.id, "link", v)}
                        placeholder="https://..."
                      />
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr
                  onClick={() => void handleInlineAdd()}
                  className="border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td colSpan={6} className="px-3 py-3">
                    <span className="text-zinc-400 dark:text-zinc-500 text-sm flex items-center gap-2">
                      + New page
                    </span>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      </div>

      <SidePeek
        isOpen={!!peekId}
        onClose={closePeek}
        onOpenFullPage={() => peekId && openFullPage(peekId)}
      >
        {peekProject && (
          <DatabaseEntryPage
            initialData={{
              title: peekProject.name,
              content: peekProject.content,
              status: peekProject.status,
              coverImage: peekProject.coverImage,
              icon: peekProject.icon,
              properties: {
                description: peekProject.description,
                gitRepo: peekProject.gitRepo,
                link: peekProject.link,
              },
            }}
            propertyLabels={[
              { key: "description", label: "Description" },
              { key: "gitRepo", label: "Git Repo" },
              { key: "link", label: "Link" },
            ]}
            backHref="/projects"
            backLabel="Back to Projects"
            onSave={async (data) => {
              if (!peekProject) return;
              const updates: Parameters<typeof updateProject>[1] = {};
              if (data.title !== undefined) updates.name = data.title;
              if (data.content !== undefined) updates.content = data.content;
              if (data.status !== undefined) updates.status = data.status;
              if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
              if (data.icon !== undefined) updates.icon = data.icon;
              await updateProject(peekProject.id, updates);
              setPeekProject((p) => (p ? { ...p, ...data, ...(data.title !== undefined && { name: data.title }) } : null));
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === peekProject.id
                    ? { ...p, ...data, ...(data.title !== undefined && { name: data.title }) }
                    : p
                )
              );
            }}
            onPropertyChange={async (key, value) => {
              if (!peekProject) return;
              await updateProject(peekProject.id, { [key]: value });
              setPeekProject((p) => (p ? { ...p, [key]: value } : null));
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === peekProject.id ? { ...p, [key]: value } : p
                )
              );
            }}
            onBack={closePeek}
          />
        )}
      </SidePeek>
    </div>
  );
}
