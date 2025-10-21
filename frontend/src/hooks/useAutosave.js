import { useEffect, useRef } from "react";
export function useAutosave(callback, enabled, intervalMs) {
    const savedCallback = useRef(callback);
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
