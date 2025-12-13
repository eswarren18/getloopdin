import { EventOut, ParticipantOut } from '../types/event';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function fetchEventByToken(
    token: string
): Promise<EventOut | Error> {
    // Sent GET request to the API
    try {
        const response = await fetch(
            `${baseUrl}/api/public/events/token/${token}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            const errorMsg =
                response.status === 404
                    ? 'Event not found'
                    : 'Failed to fetch event';
            throw new Error(errorMsg);
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform from snake_case to camelCase
        const event: EventOut = {
            id: data.id,
            title: data.title,
            description: data.description,
            startTime: data.start_time,
            endTime: data.end_time,
        };
        return event;
    } catch (error) {
        return error instanceof Error ? error : new Error('Unknown error');
    }
}

export async function fetchParticipantsByToken(
    token: string,
    role?: 'host' | 'participant'
): Promise<ParticipantOut[]> {
    try {
        const response = await fetch(
            `${baseUrl}/api/public/events/token/${token}/participants?role=${role}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch participants');
        }

        const data = await response.json();

        // Transform from snake_case to camelCase
        const participants: ParticipantOut[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            role: item.role,
        }));
        return participants;
    } catch (error) {
        console.error('Error fetching participants by token:', error);
        return [];
    }
}
