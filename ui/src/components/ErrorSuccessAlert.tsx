import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error';

interface ErrorSuccessAlertProps {
    message?: string;
    duration?: number;
    type?: ToastType;
}

export function ErrorSuccessAlert({
    message = 'Success!',
    duration = 6000,
    type = 'success',
}: ErrorSuccessAlertProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    // Color and icon based on type
    const colorStyles =
        type === 'success'
            ? {
                  border: 'border-green-300',
                  bg: 'bg-green-50',
                  text: 'text-green-700',
                  icon: 'text-green-500',
                  label: 'Success:',
              }
            : {
                  border: 'border-red-300',
                  bg: 'bg-red-50',
                  text: 'text-red-700',
                  icon: 'text-red-500',
                  label: 'Error:',
              };

    const iconSvg =
        type === 'success' ? (
            <svg
                className={`w-6 h-6 ${colorStyles.icon} shrink-0`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ) : (
            <svg
                className={`w-6 h-6 ${colorStyles.icon} shrink-0`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        );

    return (
        <div
            className={`fixed bottom-10 left-10 z-50 min-w-[200px] flex items-center gap-2 p-4 rounded-lg border ${colorStyles.border} ${colorStyles.bg} ${colorStyles.text} shadow-md animate-alert-in`}
            role="alert"
        >
            {iconSvg}
            <span className="font-semibold">{colorStyles.label}</span>
            <span>{message}</span>
            <style>{`
                @keyframes alert-in {
                    0% { transform: translateX(-100%); opacity: 0; }
                    20% { opacity: 1; transform: translateX(0); }
                    80% { opacity: 1; transform: translateX(0); }
                    100% { transform: translateX(-100%); opacity: 0; }
                }
                .animate-alert-in {
                    animation: alert-in ${duration}ms forwards;
                }
            `}</style>
        </div>
    );
}
