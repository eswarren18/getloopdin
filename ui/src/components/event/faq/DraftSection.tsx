import { useDroppable } from '@dnd-kit/core';

export function DraftSection({ children }: { children?: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'drafts',
        data: { containerId: 'drafts' },
    });

    return (
        <div
            ref={setNodeRef}
            className={`border rounded p-4 ${
                isOver ? 'bg-yellow-50' : 'bg-gray-50'
            }`}
        >
            <h3 className="font-semibold">User Submitted Questions (Draft)</h3>
            {children ?? (
                <p className="text-sm text-gray-400">
                    No draft questions remaining
                </p>
            )}
        </div>
    );
}
