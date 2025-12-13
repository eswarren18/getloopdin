import { InviteCreate, InviteOut } from '../types/invite';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function createInvite(
    inviteData: InviteCreate
): Promise<InviteOut | Error> {
    // Transform camelCase to snake_case
    const transformedInviteData = {
        email: inviteData.email,
        role: inviteData.role,
        event_id: inviteData.eventId,
    };

    // Send POST request to the API
    try {
        const response = await fetch(`${baseUrl}/api/invites/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedInviteData),
            credentials: 'include',
        });
        if (!response.ok) {
            let errorDetail =
                'Could not create invite. Please try again later.';
            const errorData = await response.json();
            if (errorData && errorData.detail) {
                errorDetail = errorData.detail;
            }
            return new Error(errorDetail);
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform from snake_case to camelCase
        const invite: InviteOut = {
            id: data.id,
            token: data.token,
            userName: data.user_name,
            email: data.email,
            role: data.role,
            status: data.status,
            event: {
                description: data.event.description,
                endTime: data.event.end_time,
                hosts: Array.isArray(data.event.hosts)
                    ? data.event.hosts.map((host: any) => ({
                          id: host.id,
                          name: host.name,
                      }))
                    : [],
                id: data.event.id,
                startTime: data.event.start_time,
                title: data.event.title,
            },
        };
        return invite;
    } catch (error) {
        console.error('Error in createInvite:', error);
        return error instanceof Error
            ? error
            : new Error('Could not create invite. Please try again later.');
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
        const response = await fetch(
            `${baseUrl}/api/invites/?${params.toString()}`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) throw new Error('Failed to fetch invites');

        // Transform Response object to JSON
        const data = await response.json();

        // Transform from snake_case to camelCase
        const invites: InviteOut[] = data.map((invite: any) => ({
            id: invite.id,
            token: invite.token,
            userName: invite.user_name,
            email: invite.email,
            role: invite.role,
            status: invite.status,
            event: {
                description: invite.event.description,
                endTime: invite.event.end_time,
                hosts: Array.isArray(invite.event.hosts)
                    ? invite.event.hosts.map((host: any) => ({
                          id: host.id,
                          name: host.name,
                      }))
                    : [],
                id: invite.event.id,
                startTime: invite.event.start_time,
                title: invite.event.title,
            },
        }));

        return invites;
    } catch (error) {
        console.error(`Error in fetchInvites:`, error);
        throw error;
    }
}

export async function respondToInvite(
    token: string,
    status: 'accepted' | 'declined'
): Promise<InviteOut> {
    try {
        const response = await fetch(`${baseUrl}/api/invites/${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to respond to invite: ${errorText}`);
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform snake_case to camelCase
        const invite: InviteOut = {
            id: data.id,
            token: data.token,
            userName: data.user_name,
            email: data.email,
            role: data.role,
            status: data.status,
            event: {
                description: data.event.description,
                endTime: data.event.end_time,
                hosts: Array.isArray(data.event.hosts)
                    ? data.event.hosts.map((host: any) => ({
                          id: host.id,
                          name: host.name,
                      }))
                    : [],
                id: data.event.id,
                startTime: data.event.start_time,
                title: data.event.title,
            },
        };

        return invite;
    } catch (error) {
        console.error('Error in respondToInvite:', error);
        throw error;
    }
}
