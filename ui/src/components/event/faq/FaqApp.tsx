import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';

import { Question, Droppable } from '../faq';

export function FaqApp() {
    const containers = ['A', 'B', 'C'];
    const [parent, setParent] = useState(null);
    const draggableMarkup = <Question>Am I a question?</Question>;

    // fix any
    const handleDragEnd = (event: any) => {
        const { over } = event;
        setParent(over ? over.id : null);
    };

    return (
        <>
            <div className="w-full mt-6 justify-center mx-auto">
                <h2 className="text-2xl font-bold mb-2">
                    Frequently Asked Questions
                </h2>
            </div>
            <DndContext onDragEnd={handleDragEnd}>
                {parent === null ? draggableMarkup : null}
                {containers.map((id) => (
                    <Droppable key={id} id={id}>
                        {parent === id ? draggableMarkup : `Container ${id}`}
                    </Droppable>
                ))}
                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-2">
                        User Submitted Questions (Unpublished)
                    </h3>
                    <Droppable id="drafts">
                        {parent === 'drafts'
                            ? draggableMarkup
                            : `No draft questions remaining`}
                    </Droppable>
                </div>
            </DndContext>
        </>
    );
}
