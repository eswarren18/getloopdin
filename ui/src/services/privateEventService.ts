import { EventCreate, EventOut } from '../types/event';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function fetchEvents(
    role: 'host' | 'participant',
    time: 'upcoming' | 'past' | 'all'
): Promise<EventOut[]> {
    // Sent GET request to the API
    try {
        const response = await fetch(
            `${baseUrl}/api/private/events/?role=${role}&time=${time}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok)
            throw new Error(
                `Failed to fetch ${time} events where the user is a ${role}`
            );

        // Transform Response object to JSON
        const data = await response.json();

        // Transform from snake_case to camelCase
        const events: EventOut[] = data.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            hosts: Array.isArray(event.hosts)
                ? event.hosts.map((host: any) => ({
                      id: host.id,
                      name: host.name,
                  }))
                : [],
            startTime: event.start_time,
            endTime: event.end_time,
        }));
        return events;
    } catch (error) {
        console.error('Unknown error in fetchEvents:', error);
        throw error;
    }
}

export async function createEvent(
    eventData: EventCreate
): Promise<EventOut | Error> {
    // Transform camelCase to snake_case
    const transformedEventData = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
    };

    // Send POST request to the API
    try {
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
        throw error;
    }
}

export async function fetchEventById(
    eventId: number
): Promise<EventOut | Error> {
    // Sent GET request to the API
    try {
        const response = await fetch(
            `${baseUrl}/api/private/events/${eventId}`,
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

export async function updateEvent(
    eventId: number,
    eventData: EventCreate
): Promise<EventOut | Error> {
    // Transform camelCase to snake_case
    const transformedEventData = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
    };

    // Send PUT request to the API
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
            const errorMsg =
                response.status === 404
                    ? 'Event not found'
                    : 'Failed to update event';
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
        return new Error('Could not update event details');
    }
}

export async function deleteEvent(eventId: number): Promise<true | Error> {
    try {
        const response = await fetch(
            `${baseUrl}/api/private/events/${eventId}`,
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );
        if (!response.ok) {
            const errorMsg =
                response.status === 404
                    ? 'Event not found'
                    : 'Failed to delete event';
            throw new Error(errorMsg);
        }
        return true;
    } catch (error) {
        return error instanceof Error ? error : new Error('Unknown error');
    }
}
