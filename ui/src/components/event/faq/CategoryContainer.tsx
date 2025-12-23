import { useDroppable } from '@dnd-kit/core';
import { Category } from './FaqApp';

export function CategoryContainer({
    category,
    children,
}: {
    category: Category;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `category-${category.id}`,
        data: { containerId: category.id },
    });

    return (
        <div
            ref={setNodeRef}
            className={`border p-4 rounded ${
                isOver ? 'bg-blue-50' : 'bg-gray-50'
            }`}
        >
            <h3 className="font-semibold mb-2">{category.name}</h3>
            {children}
        </div>
    );
}
