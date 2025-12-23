import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EditFaq } from './EditFaq';
import { PublishedFaq } from './PublishedFaq';

interface FaqProps {
    eventId?: string;
    authUserId?: number;
    hosts?: { id: number }[];
}

export function Faq({ eventId, authUserId, hosts }: FaqProps) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="w-full mt-6 mx-auto">
            {/* Header */}
            <div className="flex flex-col mb-6">
                <div className="flex justify-between mb-4 gap-6">
                    <h2 className="text-2xl font-bold">
                        Frequently Asked Questions
                    </h2>
                    {/* Only show edit button if user is a host */}
                    {Array.isArray(hosts) &&
                        hosts.some((host) => host.id === authUserId) && (
                            <div className="relative inline-block">
                                <button
                                    className="bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                                    onClick={() =>
                                        setIsEditing((prev) => !prev)
                                    }
                                >
                                    {isEditing ? 'Save' : 'Edit'}
                                </button>
                                {!isEditing && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs font-semibold px-1.5 py-0.5 rounded-full border-gray-300 shadow-sm select-none flex items-center justify-center h-5 min-w-5">
                                        x
                                    </span>
                                )}
                            </div>
                        )}
                </div>
                <div className="flex items-center justify-start gap-2">
                    <span className="text-sm font-normal text-gray-600">
                        Not the answer you're looking for?{' '}
                        <button
                            className="underline underline-offset-2 decoration-gray-300 hover:decoration-indigo-300 hover:text-indigo-500 transition-colors duration-150 focus:outline-none cursor-pointer px-0 py-0 bg-transparent border-none"
                            style={{ boxShadow: 'none' }}
                            onClick={() =>
                                navigate(`/question-form/${eventId}`)
                            }
                            type="button"
                        >
                            Ask the host!
                        </button>
                    </span>
                </div>
            </div>

            {/* FAQ content */}
            {isEditing ? (
                <EditFaq eventId={eventId} authUserId={authUserId} />
            ) : (
                <PublishedFaq eventId={eventId} authUserId={authUserId} />
            )}
        </div>
    );
}
