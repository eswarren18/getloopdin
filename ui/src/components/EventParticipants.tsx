import { useEffect, useState } from 'react';
import { fetchParticipants } from '../services';
import { ErrorDisplay } from '../errors';
import { ParticipantOut } from '../types';

interface EventParticipantsProps {
    eventId: string | undefined;
    authUserId?: number;
}

export function EventParticipants({
    eventId,
    authUserId,
}: EventParticipantsProps) {
    // Component state and hooks
    const [error, setError] = useState<string | null>(null);
    const [participants, setParticipants] = useState<ParticipantOut[]>([]);

    // Fetch invite details
    const fetchData = async () => {
        try {
            // Call services to fetch API data
            const data = await fetchParticipants(
                Number(eventId),
                'participant'
            );
            // Update state with API data
            setParticipants(data);
        } catch (e: any) {
            setError(e?.message || 'Failed to retrieve participants');
            console.error('Fetch participants error:', e);
        }
    };

    // Run the fetchData function on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Display error if present
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div className="w-full mt-6 justify-center mx-auto">
            <h3 className="text-2xl font-bold mb-2">Participants</h3>
            {participants.length === 0 ? (
                <div>No RSVPs yet!</div>
            ) : (
                <div className="flex gap-4 flex-wrap justify-start">
                    {participants.map((participant, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-300 flex items-center justify-center text-white text-lg font-semibold">
                                {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-xs font-medium">
                                {participant.name.split(' ')[0]}
                            </div>
                            {authUserId === participant.id && (
                                <div
                                    className="px-2 py-0.5 bg-green-200 text-green-700 text-[10px] rounded-full font-semibold mt-1"
                                    style={{
                                        lineHeight: '1',
                                        display: 'inline-block',
                                    }}
                                >
                                    You
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
