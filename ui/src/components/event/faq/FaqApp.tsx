import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';

import {
    CategorySection,
    DraftSection,
    PublishedSection,
    Question,
} from '../faq';

export function FaqApp() {
    const [location, setLocation] = useState<string | null>(null);

    const handleDragEnd = (event: any) => {
        const { over } = event;
        setLocation(over ? over.id : null);
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <DndContext onDragEnd={handleDragEnd}>
                {/* Categories */}
                <CategorySection id="cat-1" title="Category One">
                    {location === 'cat-1' && (
                        <Question id="q1">Am I a question?</Question>
                    )}
                </CategorySection>
                <CategorySection id="cat-2" title="Category Two">
                    {location === 'cat-2' && (
                        <Question id="q1">Am I a question?</Question>
                    )}
                </CategorySection>
                {/* Published but uncategorized */}
                <PublishedSection>
                    {location === 'published' && (
                        <Question id="q1">Am I a question?</Question>
                    )}
                </PublishedSection>
                {/* Drafts */}
                <DraftSection>
                    {location === 'drafts' && (
                        <Question id="q1">Am I a question?</Question>
                    )}
                </DraftSection>
                {/* Floating question (when not dropped yet) */}
                {location === null && (
                    <Question id="q1">Am I a question?</Question>
                )}
            </DndContext>
        </div>
    );
}
