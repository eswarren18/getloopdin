import { useEffect, useState } from 'react';
import { fetchParticipants } from '../services';
import { ErrorDisplay } from './ErrorDisplay';
import { ParticipantOut } from '../types/event';

interface EventParticipantsProps {
    eventId: string | undefined;
}

export function EventParticipants({ eventId }: EventParticipantsProps) {
    // Component state and hooks
    const [error, setError] = useState<string | null>(null);
    const [participants, setParticipants] = useState<ParticipantOut[]>([]);

    // Fetch invite details
    const fetchData = async () => {
        try {
            if (!eventId) {
                setError('No event ID provided.');
                return;
            }
            const data = await fetchParticipants(
                parseInt(eventId),
                'participant'
            );
            setParticipants(data);
        } catch {
            setError('Failed to load participants');
        }
    };

    // Run the fetchData function on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Display error if present
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div className="w-4/5 mb-6">
            <h3 className="text-2xl font-bold mb-2">Participants</h3>
            {participants.length === 0 ? (
                <div>No RSVPs yet!</div>
            ) : (
                <div className="flex gap-6 flex-wrap justify-start items-end">
                    {participants.map((participant, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-300 flex items-center justify-center text-white text-lg font-semibold mb-1">
                                {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-xs font-medium mb-1">
                                {participant.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
