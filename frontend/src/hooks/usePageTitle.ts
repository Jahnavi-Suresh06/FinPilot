import { useEffect } from "react";

/**
 * Sets the browser tab's title for the current page. Call this once
 * near the top of any page component, e.g. usePageTitle("Dashboard").
 */
export function usePageTitle(title: string) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = `${title} — FinPilot`;

        // Restore the previous title on unmount — mostly relevant if a
        // component ever gets conditionally swapped without a full route
        // change, keeping the tab title accurate in edge cases.
        return () => {
            document.title = previousTitle;
        };
    }, [title]);
}