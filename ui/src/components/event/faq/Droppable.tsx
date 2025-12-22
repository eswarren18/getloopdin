import { useDroppable } from '@dnd-kit/core';

export function Droppable(props: { id: string; children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
        id: props.id,
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };

    return (
        <div
            className="flex border border-black w-full px-4 py-2 mt-6 justify-center text-gray-400"
            ref={setNodeRef}
            style={style}
        >
            {props.children}
        </div>
    );
}
