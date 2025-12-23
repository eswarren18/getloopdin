import { InviteCreate, InviteOut } from '../types';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function createInvite(
    inviteData: InviteCreate
): Promise<InviteOut> {
    // Transform data to snake_case for API consumption
    const transformedInviteData = {
        email: inviteData.email,
        role: inviteData.role,
        event_id: inviteData.eventId,
    };

    try {
        // Send POST request to the API
        const response = await fetch(`${baseUrl}/api/invites/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedInviteData),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to create invite');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const invite: InviteOut = {
            email: data.email,
            event: {
                address: data.event.address,
                description: data.event.description,
                endTime: data.event.end_time,
                id: data.event.id,
                startTime: data.event.start_time,
                title: data.event.title,
            },
            id: data.id,
            role: data.role,
            status: data.status,
            token: data.token,
            userName: data.user_name,
        };

        return invite;
    } catch (e) {
        throw e;
    }
}

export async function fetchInvites(
    status: 'pending' | 'accepted' | 'declined' | 'all',
    eventId?: number,
    userId?: number
): Promise<InviteOut[]> {
    try {
        // Build query string
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (eventId !== undefined) params.append('event_id', String(eventId));
        if (userId !== undefined) params.append('user_id', String(userId));

        // Send GET request to the API
        const response = await fetch(
            `${baseUrl}/api/invites/?${params.toString()}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) throw new Error('Failed to retrieve invites.');

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const invites: InviteOut[] = data.map((invite: any) => ({
            email: invite.email,
            event: {
                address: invite.event.address,
                description: invite.event.description,
                endTime: invite.event.end_time,
                id: invite.event.id,
                startTime: invite.event.start_time,
                title: invite.event.title,
            },
            id: invite.id,
            role: invite.role,
            status: invite.status,
            token: invite.token,
            userName: invite.user_name,
        }));

        return invites;
    } catch (e) {
        throw e;
    }
}

export async function respondToInvite(
    token: string,
    status: 'accepted' | 'declined'
): Promise<InviteOut> {
    try {
        // Send PUT request to the API
        const response = await fetch(`${baseUrl}/api/invites/${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Failed to RSVP.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const invite: InviteOut = {
            email: data.email,
            event: {
                address: data.event.address,
                description: data.event.description,
                endTime: data.event.end_time,
                id: data.event.id,
                startTime: data.event.start_time,
                title: data.event.title,
            },
            id: data.id,
            role: data.role,
            status: data.status,
            token: data.token,
            userName: data.user_name,
        };

        return invite;
    } catch (e) {
        throw e;
    }
}
