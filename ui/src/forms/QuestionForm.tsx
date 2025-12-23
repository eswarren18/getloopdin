import { useState, useContext } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { ErrorDisplay } from '../errors';
import { AuthContext } from '../providers';
import { createQuestion } from '../services';
import { QuestionCreate } from '../types';

export default function QuestionForm() {
    // Redirect to home if not logged in
    const auth = useContext(AuthContext);
    if (!auth?.user) {
        return <Navigate to="/" />;
    }

    // Form state and hooks
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId?: string }>();
    const [error, setError] = useState('');
    const [form, setForm] = useState<{ question: string }>({
        question: '',
    });

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate submission data
        if (!form.question) {
            setError('Please enter a question');
            return;
        }

        // Call services to create question
        try {
            const payload: QuestionCreate = {
                questionText: form.question,
                isPublished: false,
            };
            await createQuestion(Number(eventId), payload);
            navigate(`/events/${eventId}`, {
                state: {
                    showErrorSuccessAlert: true,
                    alertMessage: 'Question sent',
                },
            });
        } catch (e: any) {
            setError(e?.message || 'Failed to create question.');
            console.error('Create question error:', e);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-3/10 mx-auto my-8"
            >
                <h1 className="font-bold text-2xl mb-1">Ask a question</h1>
                <p className="text-sm font-normal text-gray-600 mb-4">
                    Question Details
                </p>
                <div className="flex items-center border-2 py-2 px-3 rounded mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5 shrink-0"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                    </svg>
                    <textarea
                        autoComplete="question"
                        className="pl-2 outline-none border-none w-full placeholder-gray-400"
                        id="question"
                        maxLength={200}
                        name="question"
                        onChange={(e) =>
                            setForm({ ...form, question: e.target.value })
                        }
                        placeholder="Question*"
                        value={form.question}
                    ></textarea>
                </div>
                {error && <ErrorDisplay message={error} className="my-2" />}
                <div className="flex gap-4 mt-4">
                    <button
                        type="button"
                        className="basis-1/2 bg-gray-200 px-3 py-1 rounded font-medium hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        onClick={() => navigate(`/events/${eventId}`)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="basis-1/2 bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                    >
                        Ask
                    </button>
                </div>
            </form>
        </div>
    );
}
