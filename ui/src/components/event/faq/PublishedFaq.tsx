import { useEffect, useState } from 'react';

type Question = {
    id: number;
    text: string;
};

type Category = {
    id: number;
    name: string;
    questions: Question[];
};

export function PublishedFaq() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [publishedUncategorized, setPublishedUncategorized] = useState<
        Question[]
    >([]);

    // For now, dummy fetch simulation
    useEffect(() => {
        // TODO: Fetch categories and questions from backend
        setCategories([
            {
                id: 1,
                name: 'Sample Category',
                questions: [
                    { id: 101, text: 'Sample Question 1' },
                    { id: 102, text: 'Sample Question 2' },
                ],
            },
        ]);
        setPublishedUncategorized([
            { id: 201, text: 'Uncategorized Question' },
        ]);
    }, []);

    return (
        <div className="space-y-6">
            {/* Categories */}
            {categories.map((cat) => (
                <div key={cat.id} className="border rounded p-4">
                    <h3 className="font-semibold mb-2">{cat.name}</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {cat.questions.map((q) => (
                            <li key={q.id}>{q.text}</li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Published uncategorized */}
            {publishedUncategorized.length > 0 && (
                <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Other Questions</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {publishedUncategorized.map((q) => (
                            <li key={q.id}>{q.text}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No questions fallback */}
            {categories.length === 0 && publishedUncategorized.length === 0 && (
                <p className="text-gray-500 text-center">
                    No published FAQs available yet.
                </p>
            )}
        </div>
    );
}
