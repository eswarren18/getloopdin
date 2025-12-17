import { SignUpRequest, UserRequest, UserResponse } from '../types';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function authenticate(): Promise<UserResponse> {
    try {
        // Send GET request to the API
        const response = await fetch(`${baseUrl}/api/users/me`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Not logged in');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform snake_case to camelCase for UI consumption
        const user: UserResponse = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            isRegistered: data.isRegistered ?? true,
        };

        return user;
    } catch (e) {
        throw e;
    }
}

export async function signin(userRequest: UserRequest): Promise<UserResponse> {
    try {
        // Send POST request to the API
        const response = await fetch(`${baseUrl}/api/auth/signin`, {
            method: 'POST',
            body: JSON.stringify(userRequest),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Incorrect email or password.');
        }

        // Transform response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const user: UserResponse = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            isRegistered: data.isRegistered ?? true,
        };

        return user;
    } catch (e) {
        throw e;
    }
}

export async function signOut(): Promise<void> {
    try {
        // Send DELETE request to the API
        const response = await fetch(`${baseUrl}/api/auth/signout`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to logout');
        }
    } catch (e) {
        throw e;
    }
}

export async function signup(
    signUpRequest: SignUpRequest
): Promise<UserResponse> {
    try {
        // Transform data to snake_case for API consumption
        const payload = {
            email: signUpRequest.email,
            password: signUpRequest.password,
            first_name: signUpRequest.firstName,
            last_name: signUpRequest.lastName,
        };

        // Send POST request to the API
        const response = await fetch(`${baseUrl}/api/users/`, {
            method: 'POST',
            body: JSON.stringify(payload),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to sign up');
        }

        // Transform response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const user: UserResponse = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            isRegistered: data.isRegistered ?? true,
        };

        return user;
    } catch (e) {
        throw e;
    }
}
