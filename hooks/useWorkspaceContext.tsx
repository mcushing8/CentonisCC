"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getWorkspace } from "@/services/workspaceService";
import type { Workspace } from "@/types/models";

type WorkspaceContextValue = {
  workspace: Workspace | null;
  workspaceId: string | null;
  isLoading: boolean;
  hasWorkspace: boolean;
  refresh: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspace: null,
  workspaceId: null,
  isLoading: true,
  hasWorkspace: false,
  refresh: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspace = useCallback(async () => {
    if (!user) {
      setWorkspace(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const wsId = userData?.workspaceId;

      if (wsId) {
        const ws = await getWorkspace(wsId);
        setWorkspace(ws);
      } else {
        setWorkspace(null);
      }
    } catch {
      setWorkspace(null);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      void loadWorkspace();
    }
  }, [authLoading, loadWorkspace]);

  const value = useMemo(
    () => ({
      workspace,
      workspaceId: workspace?.id ?? null,
      isLoading: authLoading || isLoading,
      hasWorkspace: workspace !== null,
      refresh: loadWorkspace,
    }),
    [workspace, authLoading, isLoading, loadWorkspace]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
