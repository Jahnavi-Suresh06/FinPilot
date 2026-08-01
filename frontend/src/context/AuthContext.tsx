import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import { fetchCurrentUser } from "../services/authService";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

// Created with 'undefined' as the default so we can detect (and error
// loudly on) any component that tries to use this context OUTSIDE
// of the provider — see useAuth() below.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "finpilot_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Starts true: while we check "is there a saved token, and is it
    // still valid," we don't yet know if the user is logged in or not.
    // This prevents a flash of the login page before we've even checked.
    const [isLoading, setIsLoading] = useState(true);

    // On first app load, check if we have a saved token from a previous
    // session, and if so, try to restore the logged-in user automatically.
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            setIsLoading(false);
            return;
        }

        fetchCurrentUser()
            .then((fetchedUser) => {
                setUser(fetchedUser);
            })
            .catch(() => {
                // Token exists but is invalid/expired — clear it out.
                localStorage.removeItem(TOKEN_KEY);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function login(loggedInUser: User, token: string) {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(loggedInUser);
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * The hook every component will actually use to access auth state,
 * e.g.: const { user, logout } = useAuth();
 * Throws a clear error if used outside <AuthProvider>, instead of a
 * confusing "cannot read property of undefined" error somewhere else.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}