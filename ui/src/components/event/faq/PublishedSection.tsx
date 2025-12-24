import { useDroppable } from '@dnd-kit/core';

export function PublishedSection({ children }: { children?: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'published',
        data: { containerId: 'published' },
    });

    return (
        <div
            ref={setNodeRef}
            className={`border rounded p-4 ${
                isOver ? 'bg-blue-50' : 'bg-gray-50'
            }`}
        >
            <h3 className="font-semibold">Other Questions</h3>
            {children ?? (
                <p className="text-sm text-gray-400">
                    Uncategorized published questions
                </p>
            )}
        </div>
    );
}
