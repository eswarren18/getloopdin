import { useContext, useEffect, useState } from 'react';
import {
    useLocation,
    useParams,
    useNavigate,
    Navigate,
} from 'react-router-dom';

import {
    ConfirmDelete,
    ErrorSuccessAlert,
    EventFeaturesBar,
    LoadingIcon,
} from '../components';
import { AuthContext, useSidebar } from '../providers';
import {
    deleteEvent,
    fetchEventById,
    fetchEventByToken,
    fetchParticipants,
    fetchParticipantsByToken,
    respondToInvite,
} from '../services';
import { EventOut, ParticipantOut } from '../types';
import { NotFound } from '../errors';

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
    const showErrorSuccessAlert = location.state?.showErrorSuccessAlert;
    const navigate = useNavigate();
    const collapsed = useSidebar();
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<EventOut | null>(null);
    const [hosts, setHosts] = useState<ParticipantOut[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [dataLoading, setDataLoading] = useState<boolean>(true);

    // Fetch event and host details
    const fetchData = async () => {
        setDataLoading(true);
        try {
            let eventData;
            let hostData;

            // Call services to fetch API data
            if (eventId) {
                eventData = await fetchEventById(Number(eventId));
                hostData = await fetchParticipants(Number(eventId), 'host');
            } else if (token) {
                eventData = await fetchEventByToken(token);
                hostData = await fetchParticipantsByToken(token, 'host');
            } else {
                setError('No event ID or token provided');
                console.warn('No event ID or token provided');
                setDataLoading(false);
                return;
            }

            // Update state with API data
            setEvent(eventData);
            setHosts(hostData);
        } catch (e: any) {
            setError(e?.message || 'Failed to retrieve event.');
            console.error('Fetch event error:', e);
        } finally {
            setDataLoading(false);
        }
    };

    // Handle user's RSVP
    const handleRsvp = async (token: string, rsvp: 'accepted' | 'declined') => {
        try {
            const data = await respondToInvite(token, rsvp);
            if (rsvp === 'accepted' && data?.event?.id) {
                navigate(`/events/${data.event.id}`);
            }
            if (rsvp === 'declined') {
                navigate('/invites');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to RSVP.');
            console.error('RSVP error:', e);
        }
    };

    // Handle event deletion
    const handleDeleteEvent = async () => {
        if (!event) {
            setError('No event to delete.');
            return;
        }
        try {
            await deleteEvent(event.id);
            setShowDeleteDialog(false);
            navigate('/events');
        } catch (e: any) {
            setShowDeleteDialog(false);
            setError(e?.message || 'Failed to delete event.');
            console.error('Delete event error:', e);
        }
    };

    // Run the fetchData function on component mount or when url params change
    useEffect(() => {
        fetchData();
    }, [eventId, token]);

    if (auth?.isLoading || dataLoading) {
        return <LoadingIcon />;
    }

    if (!event) {
        return (
            <NotFound
                headline="Nothing to see here"
                message="The event may have been deleted, or the link is incorrect."
            />
        );
    }

    // Format start and end times to display
    const formattedStart = event?.startTime
        ? new Date(event.startTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '';
    const formattedEnd = event?.endTime
        ? new Date(event.endTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '';

    return (
        <>
            {showErrorSuccessAlert && (
                <ErrorSuccessAlert message="Invite Sent" type="success" />
            )}
            {error && <ErrorSuccessAlert message={error} type="error" />}
            <div className="flex bg-gray-50 min-h-screen z-10">
                {/* Event content */}
                <div
                    className={`main-content-container hide-scrollbar flex justify-center items-center ${!auth?.user ? 'w-full' : collapsed ? 'collapsed' : 'uncollapsed'}`}
                >
                    {token && (
                        <div className="flex flex-col items-center w-full mb-6">
                            <div className="flex  items-center gap-3 bg-white shadow rounded-xl px-4 py-2 border border-gray-200">
                                <span className="text-lg font-semibold">
                                    RSVP:
                                </span>
                                <button
                                    className="basis-1/2 bg-green-600 text-white px-3 py-1 rounded font-medium hover:bg-green-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
                                    onClick={() =>
                                        handleRsvp(token, 'accepted')
                                    }
                                >
                                    Accept
                                </button>
                                <button
                                    className="basis-1/2 bg-red-600 text-white px-3 py-1 rounded font-medium hover:bg-red-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
                                    onClick={() =>
                                        handleRsvp(token, 'declined')
                                    }
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Image and summary */}
                    <div className="flex w-4/5 gap-4 items-center">
                        {/* Image */}
                        <div className="w-72 h-72 bg-gray-200 rounded-2xl"></div>
                        {/* Summary: title, description, datetime, location, host */}
                        <div className="flex w-2/3 flex-col mt-4 mb-6">
                            {/* Title */}
                            <div className="flex items-center mb-2">
                                <h1 className="text-2xl font-bold mr-6">
                                    {event?.title}
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
                                                    `/event-form/${event?.id}`
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
                            {event?.description ? (
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
                    {eventId && (
                        <EventFeaturesBar
                            eventId={eventId}
                            hosts={hosts}
                            authUserId={auth?.user?.id}
                        />
                    )}
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
