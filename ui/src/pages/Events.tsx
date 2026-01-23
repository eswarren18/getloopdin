import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthContext } from '../providers';
import { fetchEvents } from '../services';
import { EventOut } from '../types';
import { ErrorSuccessAlert, LoadingIcon } from '../components';

export default function Events() {
    // Redirect to home if not logged in
    const auth = useContext(AuthContext);
    if (!auth?.user) {
        return <Navigate to="/" />;
    }

    // Page state and hooks
    const navigate = useNavigate();
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<EventOut[]>([]);
    const [roleFilter, setRoleFilter] = useState<'host' | 'participant'>(
        'participant'
    );
    const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past' | 'all'>(
        'upcoming'
    );

    // Fetch event details
    const fetchData = async () => {
        setDataLoading(true);
        try {
            // Call services to fetch API data
            const data = await fetchEvents(roleFilter, timeFilter);

            // Update state with API data
            setEvents(data);
        } catch (e: any) {
            setError(e?.message || 'Failed to retrieve events.');
            console.error(e);
        } finally {
            setDataLoading(false);
        }
    };

    // Run fetchData function on component mount
    useEffect(() => {
        fetchData();
    }, [roleFilter, timeFilter]);

    if (auth?.isLoading || dataLoading) {
        return <LoadingIcon delay={500} />;
    }

    return (
        <>
            {error && <ErrorSuccessAlert message={error} type="error" />}
            <div className="flex bg-gray-50 min-h-full z-10">
                <div className="w-5/6 mx-auto mt-8 lg:w-2/3 xl:w-1/2">
                    <div className="flex flex-col gap-4 mt-4 mb-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-center">
                                Events
                            </h2>
                            <button
                                className="bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                                onClick={() => navigate('/event-form')}
                            >
                                Create Event
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                            <div className="flex bg-gray-100 rounded-xl shadow p-1">
                                <button
                                    className={`px-4 py-1 rounded-l-lg font-medium transition-colors duration-150 ${roleFilter === 'participant' ? 'bg-cyan-500 text-white' : 'bg-gray-50 text-gray-700'}`}
                                    onClick={() => setRoleFilter('participant')}
                                >
                                    Participant
                                </button>
                                <button
                                    className={`px-4 py-1 rounded-r-lg font-medium transition-colors duration-150 ${roleFilter === 'host' ? 'bg-cyan-500 text-white' : 'bg-gray-50 text-gray-700'}`}
                                    onClick={() => setRoleFilter('host')}
                                >
                                    Host
                                </button>
                            </div>
                            <div className="flex bg-gray-100 rounded-xl shadow p-1">
                                <button
                                    className={`px-4 py-1 rounded-l-lg font-medium transition-colors duration-150 ${timeFilter === 'upcoming' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-700'}`}
                                    onClick={() => setTimeFilter('upcoming')}
                                >
                                    Upcoming
                                </button>
                                <button
                                    className={`px-4 py-1 font-medium transition-colors duration-150 ${timeFilter === 'past' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-700'}`}
                                    onClick={() => setTimeFilter('past')}
                                >
                                    Past
                                </button>
                                <button
                                    className={`px-4 py-1 rounded-r-lg font-medium transition-colors duration-150 ${timeFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-700'}`}
                                    onClick={() => setTimeFilter('all')}
                                >
                                    All
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        {events.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                                No events found.
                            </div>
                        ) : (
                            <div
                                id="event-cards"
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full"
                            >
                                {events.map((event) => (
                                    <button
                                        key={event.id}
                                        className="flex flex-col relative text-cyan-900 bg-white rounded-lg shadow-md transform hover:bg-cyan-50 hover:scale-105 hover:ring-2 hover:ring-cyan-500 transition-all duration-200 min-h-48 overflow-hidden"
                                        onClick={() => {
                                            navigate(`/events/${event.id}`, {
                                                state: {
                                                    from: '/events',
                                                },
                                            });
                                        }}
                                    >
                                        <div className="flex flex-col justify-between h-full w-full p-4">
                                            <div>
                                                <h1 className="font-bold text-lg mb-1 text-cyan-700 truncate">
                                                    {event.title}
                                                </h1>
                                                {event.description ? (
                                                    <p className="text-sm text-gray-500 mb-2 line-clamp-3">
                                                        {event.description
                                                            .length > 100
                                                            ? event.description.slice(
                                                                  0,
                                                                  100
                                                              ) + '...'
                                                            : event.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 mb-2 italic">
                                                        No event description
                                                    </p>
                                                )}
                                            </div>
                                            <div className="border-t border-cyan-300 w-3/4 mx-auto mt-2 justify-center"></div>
                                            <div className="mt-auto flex items-center gap-2">
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {event.startTime
                                                        ? new Date(
                                                              event.startTime
                                                          ).toLocaleDateString(
                                                              'en-US',
                                                              {
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                                  year: 'numeric',
                                                              }
                                                          )
                                                        : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
