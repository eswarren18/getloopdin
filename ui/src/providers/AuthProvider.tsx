import { createContext, useEffect, useState, ReactNode } from 'react';
import { UserResponse } from '../types';
import { authenticate, signOut as signOutApi } from '../services/authService';
import { LoadingIcon } from '../components';

interface AuthContextType {
    user: UserResponse | undefined;
    setUser: (user: UserResponse | undefined) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: any;
    setError: (error: any) => void;
    isLoggedIn: boolean;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserResponse | undefined>();
    const [error, setError] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);

    // Authenticate user on mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const result = await authenticate();
                setUser(result);
            } catch (e) {
                setUser(undefined); // Not logged in or error
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const signOut = async () => {
        await signOutApi();
        setUser(undefined);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                setIsLoading,
                error,
                setError,
                isLoggedIn: !!user,
                signOut,
            }}
        >
            {isLoading ? <LoadingIcon /> : children}
        </AuthContext.Provider>
    );
}
