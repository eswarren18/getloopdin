import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';

import { QuestionCard } from './QuestionCard';
import { CategoryContainer } from './CategoryContainer';
import { DraftSection } from './DraftSection';

export type Question = {
    id: number;
    text: string;
};

export type Category = {
    id: number;
    name: string;
    questions: Question[];
};

export function FaqApp() {
    const [categories, setCategories] = useState<Category[]>([
        {
            id: 1,
            name: 'Cat 1',
            questions: [
                { id: 101, text: 'Q1' },
                { id: 102, text: 'Q2' },
            ],
        },
        {
            id: 2,
            name: 'Cat 2',
            questions: [{ id: 103, text: 'Q3' }],
        },
    ]);

    const [drafts, setDrafts] = useState<Question[]>([
        { id: 201, text: 'Draft Q1' },
    ]);

    const handleDragEnd = (event: any) => {
        // Metadata
        // active → what is being dragged (its id, data you attached)
        // over → what it is currently dropped over (the droppable’s id)
        const { active, over } = event;
        // Return early if not dropped over valid target
        if (!over) return;

        const draggedId = active.id;
        const targetContainerId = over.data.current?.containerId;

        let movedQuestion: Question | null = null;

        // Find the dragged question
        categories.forEach((cat) => {
            const found = cat.questions.find((q) => q.id === draggedId);
            if (found) movedQuestion = found;
        });

        if (!movedQuestion) {
            const foundDraft = drafts.find((q) => q.id === draggedId);
            if (foundDraft) movedQuestion = foundDraft;
        }

        if (!movedQuestion) return;

        // Remove from all categories
        setCategories((prev) =>
            prev.map((cat) => ({
                ...cat,
                questions: cat.questions.filter((q) => q.id !== draggedId),
            }))
        );

        // Remove from drafts
        setDrafts((prev) => prev.filter((q) => q.id !== draggedId));

        // Insert into destination
        if (targetContainerId === 'drafts') {
            setDrafts((prev) => [...prev, movedQuestion!]);
        } else {
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === targetContainerId
                        ? {
                              ...cat,
                              questions: [...cat.questions, movedQuestion!],
                          }
                        : cat
                )
            );
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

            <DndContext onDragEnd={handleDragEnd}>
                {/* Categories */}
                {categories.map((cat) => (
                    <CategoryContainer key={cat.id} category={cat}>
                        {cat.questions.map((q) => (
                            <QuestionCard key={q.id} question={q} />
                        ))}
                    </CategoryContainer>
                ))}

                {/* Drafts */}
                <DraftSection>
                    {drafts.map((q) => (
                        <QuestionCard key={q.id} question={q} />
                    ))}
                </DraftSection>
            </DndContext>
        </div>
    );
}
