import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { Question } from './FaqApp';

export function QuestionCard({ question }: { question: Question }) {
    const { setNodeRef, listeners, attributes, transform } = useDraggable({
        id: question.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="border px-3 py-2 mb-2 bg-white cursor-grab"
        >
            {question.text}
        </div>
    );
}
