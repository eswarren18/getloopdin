import { useContext, useEffect, useState } from 'react';
import {
    useLocation,
    useParams,
    useNavigate,
    Navigate,
} from 'react-router-dom';

import {
    Chat,
    ConfirmDelete,
    EventInvites,
    EventParticipants,
    Faq,
    InviteSentAlert,
    Itinerary,
    Packing,
    Polls,
} from '../components';
import { AuthContext } from '../providers/AuthProvider';
import { useSidebar } from '../providers/SidebarProvider';
import {
    deleteEvent,
    fetchEventById,
    fetchEventByToken,
    fetchParticipants,
    fetchParticipantsByToken,
} from '../services';
import { EventOut, ParticipantOut } from '../types/event';

export default function Event() {
    // Redirect to home if user is not logged in or unregistered user doesn't have a token
    const auth = useContext(AuthContext);
    const { eventId, token } = useParams<{
        eventId?: string;
        token?: string;
    }>();
    if (!auth?.user && !token) {
        return <Navigate to="/" />;
    }

    // Page state and hooks
    const location = useLocation();
    const showInviteSentAlert = location.state?.showInviteSentAlert;
    const navigate = useNavigate();
    const collapsed = useSidebar();
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<EventOut | null>(null);
    const [featureSelection, setFeatureSelection] = useState<
        | 'participants'
        | 'invites'
        | 'faq'
        | 'chat'
        | 'packing'
        | 'itinerary'
        | 'polls'
    >('participants');
    const [hosts, setHosts] = useState<ParticipantOut[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch event and host details
    async function fetchData() {
        try {
            let eventData;
            let hostData;
            if (eventId) {
                eventData = await fetchEventById(Number(eventId));
                hostData = await fetchParticipants(Number(eventId), 'host');
            } else if (token) {
                eventData = await fetchEventByToken(token);
                hostData = await fetchParticipantsByToken(token, 'host');
            } else {
                setError('No event ID or token provided');
                return;
            }

            // Update state
            if (!(eventData instanceof Error)) {
                setEvent(eventData);
                setHosts(hostData);
            } else {
                setError(eventData.message);
            }
        } catch (err) {
            setError('Failed to load event');
        }
    }

    // handle event deletion
    async function handleDeleteEvent() {
        if (!event) {
            console.error('No event to delete.');
            return;
        }
        try {
            const result = await deleteEvent(event.id);
            if (result === true) {
                setShowDeleteDialog(false);
                navigate('/events');
            } else {
                console.error('Failed to delete event.');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    }

    // Run the fetchData function on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // TODO: Error should use the error component
    if (error) return <div>{error}</div>;
    if (!event) return <div>Event not found.</div>;

    // Format start and end times to display
    const formattedStart = event.startTime
        ? new Date(event.startTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '';
    const formattedEnd = event.endTime
        ? new Date(event.endTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '';

    return (
        <>
            {showInviteSentAlert && <InviteSentAlert message="Invite Sent" />}
            <div className="flex bg-gray-50 min-h-screen z-10">
                {/* Event content */}
                <div
                    className={`main-content-container hide-scrollbar flex justify-center items-center ${!auth?.user ? 'w-full' : collapsed ? 'collapsed' : 'uncollapsed'}`}
                >
                    {/* Image and summary */}
                    <div className="flex w-4/5 gap-4 items-center">
                        {/* Image */}
                        <div className="w-72 h-72 bg-gray-200 rounded-2xl"></div>
                        {/* Summary: title, description, datetime, location, host */}
                        <div className="flex w-2/3 flex-col mt-4 mb-6">
                            {/* Title */}
                            <div className="flex items-center mb-2">
                                <h1 className="text-2xl font-bold mr-6">
                                    {event.title}
                                </h1>
                                {hosts.some(
                                    (host) => host.id === auth?.user?.id
                                ) && (
                                    <>
                                        <button
                                            title="Edit Event"
                                            className="rounded hover:bg-cyan-200 hover:text-cyan-800 p-1"
                                            onClick={() =>
                                                navigate(
                                                    `/event-form/${event.id}`
                                                )
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            title="Delete Event"
                                            className="rounded hover:bg-cyan-200 hover:text-cyan-800 p-1"
                                            onClick={() =>
                                                setShowDeleteDialog(true)
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Description */}
                            {event.description ? (
                                <div className="mb-6">{event.description}</div>
                            ) : (
                                <div className="text-gray-500 py-2 mb-4">
                                    No event description
                                </div>
                            )}
                            {/* Datetime */}
                            <div className="flex items-center gap-2 mb-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                                    />
                                </svg>
                                <div className="text-lg">
                                    {event?.startTime
                                        ? new Date(
                                              event.startTime
                                          ).toLocaleString('en-US', {
                                              dateStyle: 'medium',
                                              timeStyle: 'short',
                                          })
                                        : ''}
                                    {' - '}
                                    {event?.endTime
                                        ? new Date(
                                              event.endTime
                                          ).toLocaleString('en-US', {
                                              dateStyle: 'medium',
                                              timeStyle: 'short',
                                          })
                                        : ''}
                                </div>
                            </div>
                            {/* Location */}
                            <div className="flex items-center gap-2 mb-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                    />
                                </svg>

                                <div className="text-lg text-red-400">
                                    Placeholder Location
                                </div>
                            </div>
                            {/* Hosts */}
                            <h2 className="text-lg font-bold mb-2">Hosts</h2>
                            <div className="flex gap-6 flex-wrap justify-start items-end">
                                {hosts.map((host) => (
                                    <div
                                        className="flex flex-col items-center"
                                        key={host.id}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-cyan-300 flex items-center justify-center text-white text-xl font-semibold mb-1">
                                            {host.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-xs font-medium mb-1">
                                            {host.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Event Features */}
                    <div className="flex flex-col w-4/5 mt-8 mb-6">
                        <div className="w-full border border-gray-200 mb-4" />
                        <div className="flex gap-4 mb-4 justify-center">
                            {/* Participants */}
                            <div>
                                <button
                                    className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'participants' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'participants' ? 'hover:bg-indigo-400' : ''}`}
                                    onClick={() =>
                                        setFeatureSelection('participants')
                                    }
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
                                <div className="text-xs text-center">
                                    Participants
                                </div>
                            </div>
                            {/* Invites */}
                            {hosts.some(
                                (host) => host.id === auth?.user?.id
                            ) && (
                                <div>
                                    <button
                                        className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'invites' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'invites' ? 'hover:bg-indigo-400' : ''}`}
                                        onClick={() =>
                                            setFeatureSelection('invites')
                                        }
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
                                    <div className="text-xs text-center">
                                        Invites
                                    </div>
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
                                    onClick={() =>
                                        setFeatureSelection('packing')
                                    }
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
                                <div className="text-xs text-center">
                                    Packing
                                </div>
                            </div>
                            {/* Itinerary */}
                            <div>
                                <button
                                    className={`w-16 h-16 mb-1 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${featureSelection === 'itinerary' ? 'bg-indigo-500' : 'bg-indigo-300'} ${featureSelection !== 'itinerary' ? 'hover:bg-indigo-400' : ''}`}
                                    onClick={() =>
                                        setFeatureSelection('itinerary')
                                    }
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
                                <div className="text-xs text-center">
                                    Itinerary
                                </div>
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
                    </div>
                    {/* Event feature displays */}
                    {featureSelection === 'participants' && (
                        <EventParticipants eventId={event.id.toString()} />
                    )}
                    {/* Render EventInvites if selected */}
                    {featureSelection === 'invites' &&
                        hosts.some((host) => host.id === auth?.user?.id) && (
                            <EventInvites eventId={eventId} />
                        )}
                    {featureSelection === 'faq' && <Faq />}
                    {featureSelection === 'chat' && <Chat />}
                    {featureSelection === 'packing' && <Packing />}
                    {featureSelection === 'itinerary' && <Itinerary />}
                    {featureSelection === 'polls' && <Polls />}
                </div>
            </div>
            {/* ConfirmDialog for delete */}
            <ConfirmDelete
                open={showDeleteDialog}
                title="Delete Event?"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmText={'Delete'}
                cancelText="Cancel"
                onConfirm={handleDeleteEvent}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </>
    );
}
