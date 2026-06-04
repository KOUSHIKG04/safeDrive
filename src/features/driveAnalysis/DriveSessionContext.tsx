import { createContext, type ReactNode, useContext } from "react";
import { useDriveSession } from "./useDriveSession";

type DriveSessionContextValue = ReturnType<typeof useDriveSession>;

const DriveSessionContext = createContext<DriveSessionContextValue | null>(null);

export function DriveSessionProvider({ children }: { children: ReactNode }) {
  const session = useDriveSession();

  return (
    <DriveSessionContext.Provider value={session}>
      {children}
    </DriveSessionContext.Provider>
  );
}

export function useDriveSessionContext() {
  const session = useContext(DriveSessionContext);

  if (!session) {
    throw new Error("useDriveSessionContext must be used inside DriveSessionProvider");
  }

  return session;
}
