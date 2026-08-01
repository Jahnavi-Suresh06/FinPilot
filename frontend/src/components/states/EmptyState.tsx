import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

/**
 * Shown when a page has successfully loaded, but there's simply no
 * data to display yet (e.g. a brand-new user with zero transactions).
 * A good empty state guides the user toward their next action,
 * rather than just showing a blank page.
 */
export default function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                <Icon className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
