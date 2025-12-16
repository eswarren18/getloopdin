interface ErrorDisplayProps {
    message: string;
    className?: string;
}

export default function ErrorDisplay({
    message,
    className = '',
}: ErrorDisplayProps) {
    return (
        <div
            className={`flex items-center gap-3 p-4 mb-4 rounded-lg border border-red-300 bg-red-50 text-red-700 shadow-md ${className}`}
            role="alert"
        >
            <svg
                className="w-6 h-6 text-red-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span className="font-semibold">Error:</span>
            <span>{message}</span>
        </div>
    );
}
