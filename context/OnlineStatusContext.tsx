"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnlineStatusContextType {
  isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({ isOnline: true });

interface OnlineStatusProviderProps {
  children: ReactNode;
}

export const OnlineStatusProvider = ({ children }: OnlineStatusProviderProps) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true; // Default to true for SSR
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = (): OnlineStatusContextType => {
  return useContext(OnlineStatusContext);
};

