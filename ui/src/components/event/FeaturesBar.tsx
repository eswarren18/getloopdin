import { useState } from 'react';

import {
    Chat,
    Invites,
    Participants,
    Itinerary,
    Packing,
    Polls,
    Faq,
} from '..';

interface FeaturesBarProps {
    eventId?: string;
    hosts: { id: number }[];
    authUserId?: number;
}

export function FeaturesBar({ eventId, hosts, authUserId }: FeaturesBarProps) {
    // Page state and hooks
    const [featureSelection, setFeatureSelection] = useState<
        | 'participants'
        | 'invites'
        | 'faq'
        | 'chat'
        | 'packing'
        | 'itinerary'
        | 'polls'
    >('participants');

    return (
        <div className="flex flex-col w-5/6 my-4">
            <div className="flex w-full border border-gray-200 mb-4" />
            <div className="flex gap-4 mb-4 justify-center">
                {/* Participants */}
                <div>
                    <button
                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'participants' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'participants' ? 'hover:bg-indigo-400' : ''}`}
                        onClick={() => setFeatureSelection('participants')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-10 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                            />
                        </svg>
                    </button>
                    <div className="text-xs text-center">Participants</div>
                </div>
                {/* Invites */}
                {hosts.some((host) => host.id === authUserId) && (
                    <div>
                        <button
                            className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'invites' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'invites' ? 'hover:bg-indigo-400' : ''}`}
                            onClick={() => setFeatureSelection('invites')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-10 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                />
                            </svg>
                        </button>
                        <div className="text-xs text-center">Invites</div>
                    </div>
                )}
                {/* FAQ */}
                <div>
                    <button
                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'faq' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'faq' ? 'hover:bg-indigo-400' : ''}`}
                        onClick={() => setFeatureSelection('faq')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-13 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 17.25h.008v.008H12v-.008Z"
                            />
                        </svg>
                    </button>
                    <div className="text-xs text-center">FAQ</div>
                </div>
                {/* Chat */}
                <div>
                    <button
                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'chat' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'chat' ? 'hover:bg-indigo-400' : ''}`}
                        onClick={() => setFeatureSelection('chat')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-10 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                            />
                        </svg>
                    </button>
                    <div className="text-xs text-center">Chat</div>
                </div>
                {/* Packing */}
                <div>
                    <button
                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'packing' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'packing' ? 'hover:bg-indigo-400' : ''}`}
                        onClick={() => setFeatureSelection('packing')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-10 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                        </svg>
                    </button>
                    <div className="text-xs text-center">Packing</div>
                </div>
                {/* Itinerary */}
                <div>
                    <button
                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'itinerary' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'itinerary' ? 'hover:bg-indigo-400' : ''}`}
                        onClick={() => setFeatureSelection('itinerary')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-10 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                            />
                        </svg>
                    </button>
                    <div className="text-xs text-center">Itinerary</div>
                </div>
                {/* Polls */}
                <div>
                    <button
                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'polls' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'polls' ? 'hover:bg-indigo-400' : ''}`}
                        onClick={() => setFeatureSelection('polls')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-10 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.35 12.05c.72-.62 1.85-.62 2.55 0 .7.62.7 1.6 0 2.22-.13.11-.26.2-.41.27-.45.22-.86.63-.86 1.15v.5"
                            />
                            <circle
                                cx="9.65"
                                cy="17.7"
                                r="0.18"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <div className="text-xs text-center">Polls</div>
                </div>
            </div>
            <div className="w-full border border-gray-200" />
            {/* Event feature displays */}
            {featureSelection === 'participants' && (
                <Participants
                    eventId={eventId?.toString() ?? ''}
                    authUserId={authUserId}
                />
            )}
            {/* Render FeaturesBar if selected */}
            {featureSelection === 'invites' &&
                hosts.some((host) => host.id === authUserId) && (
                    <Invites eventId={eventId} />
                )}
            {featureSelection === 'faq' && (
                <Faq eventId={eventId} authUserId={authUserId} hosts={hosts} />
            )}
            {featureSelection === 'chat' && <Chat />}
            {featureSelection === 'packing' && <Packing />}
            {featureSelection === 'itinerary' && <Itinerary />}
            {featureSelection === 'polls' && <Polls />}
        </div>
    );
}
