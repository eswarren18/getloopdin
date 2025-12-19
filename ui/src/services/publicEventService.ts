import { EventOut, ParticipantOut } from '../types';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function fetchEventByToken(token: string): Promise<EventOut> {
    try {
        // Send GET request to the API
        const response = await fetch(
            `${baseUrl}/api/public/events/token/${token}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch event');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const event: EventOut = {
            address: data.address,
            description: data.description,
            endTime: data.end_time,
            id: data.id,
            startTime: data.start_time,
            title: data.title,
        };

        return event;
    } catch (e) {
        throw e;
    }
}

export async function fetchParticipantsByToken(
    token: string,
    role?: 'host' | 'participant'
): Promise<ParticipantOut[]> {
    try {
        // Send GET request to the API
        const response = await fetch(
            `${baseUrl}/api/public/events/token/${token}/participants?role=${role}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch participants');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const participants: ParticipantOut[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            role: item.role,
        }));

        return participants;
    } catch (e) {
        throw e;
    }
}
