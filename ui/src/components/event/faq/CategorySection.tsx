import { useDroppable } from '@dnd-kit/core';

export function CategorySection({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children?: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'category', categoryId: id },
    });

    return (
        <div
            ref={setNodeRef}
            className={`border rounded p-4 space-y-2 ${
                isOver ? 'bg-green-50' : 'bg-gray-50'
            }`}
        >
            <h3 className="font-semibold">{title}</h3>
            {children ?? (
                <p className="text-sm text-gray-400">Drop questions here</p>
            )}
        </div>
    );
}
