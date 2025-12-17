import { useEffect, useState } from 'react';
import { InviteOut } from '../types';
import { useNavigate } from 'react-router-dom';
import { fetchInvites } from '../services/inviteService';
import { ErrorDisplay } from '../errors';

interface EventParticipantsProps {
    eventId: string | undefined;
}

export function EventInvites({ eventId }: EventParticipantsProps) {
    // Component state and hooks
    const [selectedStatus, setSelectedStatus] = useState<
        'all' | 'accepted' | 'declined' | 'pending'
    >('all');
    const [error, setError] = useState<string | null>(null);
    const [invites, setInvites] = useState<InviteOut[]>([]);
    const navigate = useNavigate();

    // Fetch invite details
    const fetchData = async () => {
        try {
            // Call services to fetch API data
            const data = await fetchInvites(selectedStatus, Number(eventId));

            // Update state with API data
            setInvites(data);
        } catch (e: any) {
            setError(e?.message || 'Failed to retrieve invites.');
            console.error('Fetch invites error:', e);
        }
    };

    // Run the fetchData function on component mount and when dependencies change
    useEffect(() => {
        fetchData();
    }, [eventId, selectedStatus]);

    return (
        <div className="w-4/5 mt-6 justify-center mx-auto">
            <h2 className="text-2xl font-bold mb-2">Invites</h2>
            {error ? (
                <ErrorDisplay message={error} />
            ) : (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex bg-gray-100 rounded-xl shadow p-1">
                            {['all', 'pending', 'accepted', 'declined'].map(
                                (status, idx, arr) => {
                                    const isActive = selectedStatus === status;
                                    const baseClasses =
                                        'px-4 py-1 font-medium transition-colors duration-150 focus:outline-none';
                                    const activeClasses = isActive
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-50 text-gray-700';
                                    // Rounded corners for first and last buttons
                                    const rounded =
                                        idx === 0
                                            ? 'rounded-l-lg'
                                            : idx === arr.length - 1
                                              ? 'rounded-r-lg'
                                              : '';
                                    return (
                                        <button
                                            key={status}
                                            className={`${baseClasses} ${activeClasses} ${rounded}`}
                                            onClick={() =>
                                                setSelectedStatus(
                                                    status as typeof selectedStatus
                                                )
                                            }
                                        >
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                        <button
                            className="bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                            onClick={() => navigate(`/invite-form/${eventId}`)}
                        >
                            Invite
                        </button>
                    </div>

                    {invites.length === 0 ? (
                        <div>No invites found.</div>
                    ) : (
                        <table className="w-full bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="py-2 px-4">Name or Email</th>
                                    <th className="py-2 px-4">Role</th>
                                    <th className="py-2 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((invite) => (
                                    <tr
                                        key={invite.id}
                                        className="border-b last:border-b-0 border-gray-200"
                                    >
                                        <td className="py-2 px-4">
                                            {invite.userName
                                                ? invite.userName
                                                : invite.email}
                                        </td>
                                        <td className="py-2 px-4">
                                            {invite.role}
                                        </td>
                                        <td className="py-2 px-4">
                                            {selectedStatus === 'all'
                                                ? (invite.status ?? '')
                                                : selectedStatus}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
