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
            hosts: Array.isArray(data.hosts)
                ? data.hosts.map((host: any) => ({
                      id: host.id,
                      name: host.name,
                  }))
                : [],
            startTime: data.start_time,
            endTime: data.end_time,
        };
        return event;
    } catch (error) {
        return error instanceof Error ? error : new Error('Unknown error');
    }
}

export async function fetchParticipants(
    eventId: number
): Promise<ParticipantOut[]> {
    // Sent GET request to the API
    try {
        const response = await fetch(
            `${baseUrl}/api/public/events/${eventId}/participants/`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch participants');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform from snake_case to camelCase
        const participants: ParticipantOut[] = data.map((participant: any) => ({
            name: participant.name,
            role: participant.role,
        }));
        return participants;
    } catch (error) {
        console.error('Unknown error in fetchParticipants:', error);
        throw error;
    }
}
