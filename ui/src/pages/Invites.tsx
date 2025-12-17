import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthContext } from '../providers';
import { fetchInvites, respondToInvite } from '../services';
import { InviteOut } from '../types';
import { ErrorSuccessAlert, LoadingIcon } from '../components';
import { set } from 'date-fns';

export default function Invites() {
    // Redirect to home if not logged in
    const auth = useContext(AuthContext);
    if (!auth?.user) {
        return <Navigate to="/" />;
    }

    // Page state and hooks
    const navigate = useNavigate();
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [invites, setInvites] = useState<InviteOut[]>([]);

    // Fetch invite details
    const fetchData = async () => {
        setDataLoading(true);
        try {
            // Call services to fetch API data
            const data = await fetchInvites('pending');

            // Update state with API data
            setInvites(data);
        } catch (e: any) {
            setError(e?.message || 'Failed to fetch invites.');
            console.error('Fetch invites error:', e);
        } finally {
            setDataLoading(false);
        }
    };

    // Handle user's RSVP
    const handleResponse = async (
        token: string,
        rsvp: 'accepted' | 'declined'
    ) => {
        try {
            const data = await respondToInvite(token, rsvp);
            if (rsvp === 'accepted' && data?.event?.id) {
                navigate(`/events/${data.event.id}`);
            }
            if (rsvp === 'declined') {
                await fetchData();
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to RSVP.');
            console.error('RSVP error:', e);
        }
    };

    // Run the fetchData function on component mount
    useEffect(() => {
        fetchData();
    }, []);

    if (auth?.isLoading || dataLoading) {
        return <LoadingIcon delay={500} />;
    }

    return (
        <>
            {error && <ErrorSuccessAlert message={error} type="error" />}
            <div className="flex bg-gray-50 min-h-screen z-10">
                <div className="flex flex-col gap-4 w-4/5 mx-auto mt-8">
                    <h2 className="text-2xl font-bold mt-4 mb-2">Invites</h2>
                    {invites.length === 0 ? (
                        <div>No invites found.</div>
                    ) : (
                        <table className="w-full bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="py-2 px-4">Title</th>
                                    <th className="py-2 px-4">Description</th>
                                    <th className="py-2 px-4">Your Role</th>
                                    <th className="py-2 px-4">Response</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((invite: InviteOut, idx) => (
                                    <tr
                                        key={invite.id || idx}
                                        className="border-b last:border-b-0 border-gray-200"
                                    >
                                        <td className="py-2 px-4">
                                            <button
                                                className="cursor-pointer hover:text-cyan-500 text-left w-full"
                                                onClick={() =>
                                                    navigate(
                                                        `/events/token/${invite.token}`,
                                                        {
                                                            state: {
                                                                from: '/invites',
                                                            },
                                                        }
                                                    )
                                                }
                                            >
                                                {invite.event.title}
                                            </button>
                                        </td>
                                        <td className="py-2 px-4 border-l border-gray-200">
                                            {invite.event.description}
                                        </td>
                                        <td className="py-2 px-4 border-l border-gray-200">
                                            {invite.role}
                                        </td>
                                        <td className="flex gap-2 py-2 px-4 border-l border-gray-200">
                                            <button
                                                className="basis-1/2 bg-green-600 text-white px-3 py-1 rounded font-medium hover:bg-green-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
                                                onClick={() =>
                                                    handleResponse(
                                                        invite.token,
                                                        'accepted'
                                                    )
                                                }
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="basis-1/2 bg-red-600 text-white px-3 py-1 rounded font-medium hover:bg-red-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
                                                onClick={() =>
                                                    handleResponse(
                                                        invite.token,
                                                        'declined'
                                                    )
                                                }
                                            >
                                                Decline
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
