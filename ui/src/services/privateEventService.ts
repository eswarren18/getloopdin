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
        const response = await fetch(
            `${baseUrl}/api/private/events/?role=${role}&time=${time}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) throw new Error('Failed to retrieve events.');
        const data = await response.json();
        const events: EventOut[] = data.map((event: any) => ({
            address: event.address,
            description: event.description,
            endTime: event.end_time,
            id: event.id,
            startTime: event.start_time,
            title: event.title,
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
        address: eventData.address,
        description: eventData.description,
        end_time: eventData.endTime,
        start_time: eventData.startTime,
        title: eventData.title,
    };
    console.log('transformeddata', transformedEventData);
    try {
        const response = await fetch(`${baseUrl}/api/private/events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedEventData),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to create event.');
        const data = await response.json();
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

export async function fetchEventById(eventId: number): Promise<EventOut> {
    try {
        const response = await fetch(
            `${baseUrl}/api/private/events/${eventId}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to retrieve event.');
        }
        const data = await response.json();
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

export async function updateEvent(
    eventId: number,
    eventData: EventCreate
): Promise<EventOut> {
    const transformedEventData = {
        address: eventData.address,
        description: eventData.description,
        end_time: eventData.endTime,
        start_time: eventData.startTime,
        title: eventData.title,
    };

    try {
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
        const data = await response.json();
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

export async function deleteEvent(eventId: number): Promise<true> {
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
    try {
        const url = role
            ? `${baseUrl}/api/private/events/${eventId}/participants?role=${role}`
            : `${baseUrl}/api/private/events/${eventId}/participants`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to retrieve participants.');
        }
        const data = await response.json();
        return data;
    } catch (e) {
        throw e;
    }
}
