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
            address: {
                formattedAddress: event.address.formatted_address,
                lat: event.address.lat,
                lon: event.address.lon,
                placeId: event.address.place_id,
            },
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
        address: {
            formatted_address: eventData.address.formattedAddress,
            lat: eventData.address.lat,
            lon: eventData.address.lon,
            place_id: eventData.address.placeId,
        },
        description: eventData.description,
        end_time: eventData.endTime,
        start_time: eventData.startTime,
        title: eventData.title,
    };
    console.log(
        'transformed data in privateEventService:',
        transformedEventData
    );
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
            console.log('here');
            throw new Error('Failed to create event.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const event: EventOut = {
            address: {
                formattedAddress: data.address.formatted_address,
                lat: data.address.lat,
                lon: data.address.lon,
                placeId: data.address.place_id,
            },
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
            address: {
                formattedAddress: data.address.formatted_address,
                lat: data.address.lat,
                lon: data.address.lon,
                placeId: data.address.place_id,
            },
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
    // Transform data to snake_case for API consumption
    const transformedEventData = {
        address: {
            formatted_address: eventData.address.formattedAddress,
            lat: eventData.address.lat,
            lon: eventData.address.lon,
            place_id: eventData.address.placeId,
        },
        description: eventData.description,
        end_time: eventData.endTime,
        start_time: eventData.startTime,
        title: eventData.title,
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
            address: {
                formattedAddress: data.address.formatted_address,
                lat: data.address.lat,
                lon: data.address.lon,
                placeId: data.address.place_id,
            },
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
