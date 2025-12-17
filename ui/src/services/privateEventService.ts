import { EventCreate, EventOut, ParticipantOut } from '../types';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function fetchEvents(
    role: 'host' | 'participant',
    time: 'upcoming' | 'past' | 'all'
): Promise<EventOut[]> {
    try {
        // Send GET request to the API
        const response = await fetch(
            `${baseUrl}/api/private/events/?role=${role}&time=${time}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) throw new Error('Failed to retrieve events.');

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const events: EventOut[] = data.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            startTime: event.start_time,
            endTime: event.end_time,
        }));

        return events;
    } catch (e) {
        console.error('Unknown error in fetchEvents:', e);
        throw e;
    }
}

export async function createEvent(eventData: EventCreate): Promise<EventOut> {
    // Transform data to snake_case for API consumption
    const transformedEventData = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
    };

    try {
        // Send POST request to the API
        const response = await fetch(`${baseUrl}/api/private/events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedEventData),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to create event');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const event: EventOut = {
            id: data.id,
            title: data.title,
            description: data.description,
            startTime: data.start_time,
            endTime: data.end_time,
        };

        return event;
    } catch (e) {
        throw e;
    }
}

export async function fetchEventById(eventId: number): Promise<EventOut> {
    try {
        // Send GET request to the API
        const response = await fetch(
            `${baseUrl}/api/private/events/${eventId}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to retrieve event.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const event: EventOut = {
            id: data.id,
            title: data.title,
            description: data.description,
            startTime: data.start_time,
            endTime: data.end_time,
        };

        return event;
    } catch (e) {
        throw e;
    }
}

export async function updateEvent(
    eventId: number,
    eventData: EventCreate
): Promise<EventOut> {
    // Transform data to snake_case for API consumption
    const transformedEventData = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
    };

    try {
        // Send PUT request to the API
        const response = await fetch(
            `${baseUrl}/api/private/events/${eventId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transformedEventData),
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to update event.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const event: EventOut = {
            id: data.id,
            title: data.title,
            description: data.description,
            startTime: data.start_time,
            endTime: data.end_time,
        };

        return event;
    } catch (e) {
        throw e;
    }
}

export async function deleteEvent(eventId: number): Promise<true> {
    // Send DELETE request to the API
    try {
        const response = await fetch(
            `${baseUrl}/api/private/events/${eventId}`,
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to delete event.');
        }

        return true;
    } catch (e) {
        throw e;
    }
}

export async function fetchParticipants(
    eventId: number,
    role?: 'host' | 'participant'
): Promise<ParticipantOut[]> {
    // Send GET request to the API
    try {
        const url = role
            ? `${baseUrl}/api/private/events/${eventId}/participants?role=${role}`
            : `${baseUrl}/api/private/events/${eventId}/participants`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to retrieve participants.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        return data;
    } catch (e) {
        throw e;
    }
}
