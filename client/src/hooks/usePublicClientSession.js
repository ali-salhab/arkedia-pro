import { useEffect, useState } from "react";

const STORAGE_KEY = "travky_public_client_session";
const SESSION_EVENT = "travky-public-client-session";

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function usePublicClientSession() {
  const [session, setSessionState] = useState(readSession);

  useEffect(() => {
    const syncFromStorage = () => setSessionState(readSession());

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(SESSION_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(SESSION_EVENT, syncFromStorage);
    };
  }, []);

  const setSession = (value) => {
    const nextValue = typeof value === "function" ? value(readSession()) : value;

    try {
      if (nextValue) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}

    setSessionState(nextValue || null);
    window.dispatchEvent(new Event(SESSION_EVENT));
  };

  return [session, setSession];
}