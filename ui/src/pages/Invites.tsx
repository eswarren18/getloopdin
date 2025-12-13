import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthContext } from '../providers/AuthProvider';
import { fetchInvites, respondToInvite } from '../services';
import { InviteOut } from '../types/invite';

export default function Invites() {
    // Redirect to home if not logged in
    const auth = useContext(AuthContext);
    if (!auth?.user) {
        return <Navigate to="/" />;
    }

    // Page state and hooks
    const navigate = useNavigate();
    const [invites, setInvites] = useState<InviteOut[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch invite details
    const fetchData = async () => {
        try {
            const data = await fetchInvites('pending');
            setInvites(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Handle user response to an invite
    const handleResponse = async (
        token: string,
        response: 'accepted' | 'declined'
    ) => {
        try {
            const invite = await respondToInvite(token, response);
            if (
                response === 'accepted' &&
                invite &&
                invite.event &&
                invite.event.id
            ) {
                navigate(`/events/${invite.event.id}`);
            }
            if (response === 'declined') {
                await fetchData();
            }
        } catch (error) {
            alert('Failed to respond to invite.');
        }
    };

    // Run the fetchData function on component mount
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen z-10">
            <div className="flex flex-col gap-4 w-4/5 mx-auto mt-8">
                <h2 className="text-2xl font-bold mt-4 mb-2">Invites</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : invites.length === 0 ? (
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
                                        {invite.event.title}
                                    </td>
                                    <td className="py-2 px-4 border-l border-gray-200">
                                        {invite.event.description}
                                    </td>
                                    <td className="py-2 px-4 border-l border-gray-200">
                                        {invite.role}
                                    </td>
                                    <td className="flex gap-2 py-2 px-4 border-l border-gray-200">
                                        <button
                                            className="cursor-pointer bg-green-400 text-white px-3 py-1 rounded font-medium hover:bg-green-500 transition"
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
                                            className="cursor-pointer bg-red-400 text-white px-3 py-1 rounded font-medium hover:bg-red-500 transition"
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
    );
}
