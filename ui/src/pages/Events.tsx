import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthContext } from '../providers';
import { fetchEvents } from '../services';
import { EventOut } from '../types';
import '../styles/main-content-container.css';
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
            <div className="flex bg-gray-50 min-h-screen z-10">
                <div className="w-5/6 mx-auto mt-8">
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
                        <div className="flex justify-center gap-4">
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
                            <table className="w-full bg-white rounded-lg shadow-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-2 px-4">Title</th>
                                        <th className="py-2 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr
                                            key={event.id}
                                            className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-2 px-4">
                                                <button
                                                    className="cursor-pointer hover:text-cyan-500 text-left w-full"
                                                    onClick={() => {
                                                        navigate(
                                                            `/events/${event.id}`,
                                                            {
                                                                state: {
                                                                    from: '/events',
                                                                },
                                                            }
                                                        );
                                                    }}
                                                >
                                                    {event.title}
                                                </button>
                                            </td>
                                            <td className="py-2 px-4 border-l border-gray-200">
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
