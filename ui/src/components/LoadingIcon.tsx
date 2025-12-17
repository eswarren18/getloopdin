import { useEffect, useState } from 'react';

interface LoadingIconProps {
    delay?: number; // milliseconds
}

export function LoadingIcon({ delay = 0 }: LoadingIconProps) {
    const [show, setShow] = useState(delay === 0);

    useEffect(() => {
        if (delay === 0) {
            setShow(true);
            return;
        }
        setShow(false);
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <svg
                    className="animate-spin h-20 w-20 text-cyan-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    ></path>
                </svg>
            </div>
        </div>
    );
}
