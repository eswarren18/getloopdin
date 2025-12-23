import { useEffect, useState } from 'react';
import {
    fetchQuestions,
    fetchQuestionCategories,
} from '../../../services/questionService';
import { QuestionOut, QuestionCategoryOut } from '../../../types';

interface PublishedFaqProps {
    eventId?: string;
    authUserId?: number;
}

type CategoryWithQuestions = QuestionCategoryOut & {
    questions: QuestionOut[];
};

export function PublishedFaq({ eventId, authUserId }: PublishedFaqProps) {
    const [categories, setCategories] = useState<CategoryWithQuestions[]>([]);
    const [uncategorized, setUncategorized] = useState<QuestionOut[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [questions, categories] = await Promise.all([
                fetchQuestions(Number(eventId)),
                fetchQuestionCategories(Number(eventId)),
            ]);

            // Only published questions should ever render here
            const publishedQuestions = questions.filter((q) => q.isPublished);

            // Group questions by category
            const categoryMap: Record<number, QuestionOut[]> = {};
            const uncategorized: QuestionOut[] = [];

            publishedQuestions.forEach((q) => {
                if (q.categoryId) {
                    if (!categoryMap[q.categoryId]) {
                        categoryMap[q.categoryId] = [];
                    }
                    categoryMap[q.categoryId].push(q);
                } else {
                    uncategorized.push(q);
                }
            });

            // Attach questions to categories (already ordered by backend)
            const categoriesWithQuestions: CategoryWithQuestions[] =
                categories.map((cat) => ({
                    ...cat,
                    questions: categoryMap[cat.id] ?? [],
                }));

            setCategories(categoriesWithQuestions);
            setUncategorized(uncategorized);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [eventId]);

    if (loading) {
        return <div className="text-center mt-6">Loading FAQs…</div>;
    }

    if (categories.length === 0 && uncategorized.length === 0) {
        return (
            <p className="text-gray-500 text-center mt-6">
                No published FAQs available yet.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {/* Categories */}
            {categories.map((cat) =>
                cat.questions.length > 0 ? (
                    <div
                        key={cat.id}
                        className="border border-gray-300 rounded"
                    >
                        <h3 className="text-xl font-bold p-4 bg-cyan-100">
                            {cat.name}
                        </h3>
                        <ul className="p-4 space-y-6">
                            {cat.questions.map((q) => (
                                <li key={q.id} className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span>{q.questionText}</span>
                                        {authUserId &&
                                            authUserId &&
                                            q.askerUserIds.includes(
                                                authUserId
                                            ) && (
                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                                    You asked this
                                                </span>
                                            )}
                                    </div>
                                    {/* If you have an answer, render it here. Example: */}
                                    <div className="text-gray-600 text-sm mt-1">
                                        {q.answerText}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null
            )}

            {/* Uncategorized questions */}
            {uncategorized.length > 0 && (
                <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Other Questions</h3>
                    <ul className="space-y-2">
                        {uncategorized.map((q) => (
                            <li key={q.id} className="flex gap-2">
                                <span>{q.questionText}</span>
                                {authUserId && q.userId === authUserId && (
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                        You asked this
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
