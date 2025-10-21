import { useEffect, useRef } from "react";

type AutosaveCallback = () => void | Promise<void>;

export function useAutosave(
  callback: AutosaveCallback,
  enabled: boolean,
  intervalMs: number,
) {
  const savedCallback = useRef<AutosaveCallback>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const tick = () => {
      void savedCallback.current();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}
