import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from './EditFaq';

export function QuestionCard({
    question,
    containerId,
}: {
    question: Question;
    containerId: number | 'published' | 'drafts';
}) {
    const { setNodeRef, attributes, listeners, transform, transition } =
        useSortable({
            id: question.id,
            data: { containerId },
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="border px-3 py-2 mb-2 bg-white cursor-grab rounded"
        >
            {question.text}
        </div>
    );
}
