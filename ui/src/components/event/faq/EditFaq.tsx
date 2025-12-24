import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { CategoryContainer, DraftSection, QuestionCard } from './';

export type Question = {
    id: number;
    text: string;
};

export type Category = {
    id: number;
    name: string;
    questions: Question[];
};

interface EditFaqProps {
    eventId?: string;
    authUserId?: number;
}

export function EditFaq({ eventId, authUserId }: EditFaqProps) {
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const sourceContainer = active.data.current?.containerId;
        const targetContainer = over.data.current?.containerId;

        if (!sourceContainer || !targetContainer) return;

        // Reordering inside the same category
        if (sourceContainer === targetContainer) {
            if (sourceContainer === 'drafts') {
                setDrafts((prev) => {
                    const oldIndex = prev.findIndex((q) => q.id === activeId);
                    const newIndex = prev.findIndex((q) => q.id === overId);
                    return arrayMove(prev, oldIndex, newIndex);
                });
            } else {
                setCategories((prev) =>
                    prev.map((cat) => {
                        if (cat.id !== sourceContainer) return cat;
                        const oldIndex = cat.questions.findIndex(
                            (q) => q.id === activeId
                        );
                        const newIndex = cat.questions.findIndex(
                            (q) => q.id === overId
                        );
                        return {
                            ...cat,
                            questions: arrayMove(
                                cat.questions,
                                oldIndex,
                                newIndex
                            ),
                        };
                    })
                );
            }
            return;
        }

        // Moving between containers
        let movedQuestion: Question | null = null;

        setCategories((prev) =>
            prev.map((cat) => {
                const remaining = cat.questions.filter((q) => {
                    if (q.id === activeId) {
                        movedQuestion = q;
                        return false;
                    }
                    return true;
                });
                return { ...cat, questions: remaining };
            })
        );

        setDrafts((prev) => {
            const remaining = prev.filter((q) => {
                if (q.id === activeId) {
                    movedQuestion = q;
                    return false;
                }
                return true;
            });
            return remaining;
        });

        if (!movedQuestion) return;

        if (targetContainer === 'drafts') {
            setDrafts((prev) => [...prev, movedQuestion!]);
        } else {
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === targetContainer
                        ? {
                              ...cat,
                              questions: [...cat.questions, movedQuestion!],
                          }
                        : cat
                )
            );
        }
    };

    function buildQuestionOrderPayload(
        categories: Category[],
        drafts: Question[]
    ) {
        const items: any[] = [];

        categories.forEach((cat) => {
            cat.questions.forEach((q, index) => {
                items.push({
                    question_id: q.id,
                    is_published: true,
                    category_id: cat.id,
                    published_order: index + 1,
                    draft_order: null,
                });
            });
        });

        drafts.forEach((q, index) => {
            items.push({
                question_id: q.id,
                is_published: false,
                category_id: null,
                published_order: null,
                draft_order: index + 1,
            });
        });

        return { items };
    }

    function buildCategoryOrderPayload(categories: Category[]) {
        return {
            items: categories.map((cat, index) => ({
                category_id: cat.id,
                display_order: index + 1,
            })),
        };
    }

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            {/* Categories */}
            {categories.map((cat) => (
                <CategoryContainer key={cat.id} category={cat}>
                    <SortableContext
                        items={cat.questions.map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {cat.questions.map((q) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                containerId={cat.id}
                            />
                        ))}
                    </SortableContext>
                </CategoryContainer>
            ))}

            {/* Drafts */}
            <DraftSection>
                <SortableContext
                    items={drafts.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {drafts.map((q) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            containerId="drafts"
                        />
                    ))}
                </SortableContext>
            </DraftSection>
        </DndContext>
    );
}
