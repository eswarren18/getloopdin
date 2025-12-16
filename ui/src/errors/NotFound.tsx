import React from 'react';

interface NotFoundProps {
    image?: React.ReactNode;
    headline: string;
    message: string;
}

export default function NotFound({ image, headline, message }: NotFoundProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="mb-8">
                {image || (
                    <div className="w-32 h-32 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-300 text-6xl font-bold">
                        404
                    </div>
                )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{headline}</h1>
            <p className="text-lg text-gray-500 text-center max-w-md">
                {message}
            </p>
        </div>
    );
}
