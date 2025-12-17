import { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthContext } from '../providers';
import { signin } from '../services/authService';
import { ErrorDisplay } from '../errors';

export default function SignIn() {
    // Redirect to events if logged in
    const auth = useContext(AuthContext);
    if (auth?.user) {
        return <Navigate to="/events" />;
    }

    // Component state and navigation
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate submission data
        if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!form.password) {
            setError('Please enter your password');
            return;
        }

        // Call services to fetch API data
        try {
            const result = await signin({
                email: form.email,
                password: form.password,
            });
            auth?.setUser(result);
            navigate('/events');
        } catch (e: any) {
            setError(e?.message || 'Incorrect email or password.');
            console.error('Sign in error:', e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-3/10 mx-auto my-8"
        >
            <h1 className="font-bold text-2xl mb-1">Welcome Back!</h1>
            <p className="text-sm font-normal text-gray-600 mb-4">Sign In</p>
            <div className="flex items-center border-2 border-gray-800 py-2 px-3 rounded mb-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                </svg>
                <input
                    autoComplete="email"
                    className="pl-2 outline-none border-none w-full placeholder-gray-400"
                    id="email"
                    name="email"
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Email*"
                    type="text"
                    value={form.email}
                />
            </div>
            <div className="flex items-center border-2 py-2 px-3 mb-3 rounded border-gray-800">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                </svg>
                <input
                    autoComplete="current-password"
                    className="pl-2 outline-none border-none w-full placeholder-gray-400"
                    id="password"
                    name="password"
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Password*"
                    type="password"
                    value={form.password}
                />
            </div>
            {error && <ErrorDisplay message={error} />}
            <div className="flex gap-4">
                <button
                    type="button"
                    className="basis-1/2 bg-gray-200 px-3 py-1 rounded font-medium hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="basis-1/2 bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                >
                    Log In
                </button>
            </div>
        </form>
    );
}
