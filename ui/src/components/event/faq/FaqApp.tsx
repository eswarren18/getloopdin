import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';

import { Question } from './Question';
import { CategorySection } from './CategorySection';
import { PublishedSection } from './PublishedSection';
import { DraftSection } from './DraftSection';

export function FaqApp() {
    const [categories] = useState([
        { id: 'cat-1', name: 'Category One' },
        { id: 'cat-2', name: 'Category Two' },
    ]);

    const [questions, setQuestions] = useState([
        {
            id: 'q1',
            text: 'What is this app?',
            categoryId: 'cat-1',
            isPublished: true,
        },
        {
            id: 'q2',
            text: 'How do I submit a question?',
            categoryId: null,
            isPublished: true,
        },
        {
            id: 'q3',
            text: 'Is this published yet?',
            categoryId: null,
            isPublished: false,
        },
    ]);

    const handleDragEnd = (event: any) => {
        // active → what is being dragged (its id, data you attached)
        // over → what it is currently dropped over (the droppable’s id)
        const { active, over } = event;

        // Exit early if no valid drop target
        if (!over) return;

        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== active.id) return q;

                // Drafts
                if (over.id === 'drafts') {
                    return { ...q, isPublished: false, categoryId: null };
                }

                // Published uncategorized
                if (over.id === 'published') {
                    return { ...q, isPublished: true, categoryId: null };
                }

                // Category
                return {
                    ...q,
                    isPublished: true,
                    categoryId: over.id,
                };
            })
        );
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

            <DndContext onDragEnd={handleDragEnd}>
                {/* Categories */}
                {categories.map((cat) => (
                    <CategorySection key={cat.id} id={cat.id} title={cat.name}>
                        {questions
                            .filter(
                                (q) => q.isPublished && q.categoryId === cat.id
                            )
                            .map((q) => (
                                <Question key={q.id} id={q.id}>
                                    {q.text}
                                </Question>
                            ))}
                    </CategorySection>
                ))}

                {/* Published uncategorized */}
                <PublishedSection>
                    {questions
                        .filter((q) => q.isPublished && q.categoryId === null)
                        .map((q) => (
                            <Question key={q.id} id={q.id}>
                                {q.text}
                            </Question>
                        ))}
                </PublishedSection>

                {/* Drafts */}
                <DraftSection>
                    {questions
                        .filter((q) => !q.isPublished)
                        .map((q) => (
                            <Question key={q.id} id={q.id}>
                                {q.text}
                            </Question>
                        ))}
                </DraftSection>
            </DndContext>
        </div>
    );
}
