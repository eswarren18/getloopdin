import { useState } from 'react';
import { EditFaq } from './EditFaq';
import { PublishedFaq } from './PublishedFaq';

export function Faq() {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mt-8 mb-4 gap-6">
                <h2 className="text-2xl font-bold">
                    Frequently Asked Questions
                </h2>
                <button
                    className="bg-cyan-600 text-white px-6 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                    onClick={() => setIsEditing((prev) => !prev)}
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>
            </div>

            {/* FAQ content */}
            {isEditing ? <EditFaq /> : <PublishedFaq />}
        </div>
    );
}
