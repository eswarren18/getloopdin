import { useState, useContext, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../providers';
import {
    createEvent,
    fetchEventById,
    updateEvent,
} from '../services/privateEventService';

export default function EventForm() {
    // Redirect to home if not logged in
    const auth = useContext(AuthContext);
    if (!auth?.user) {
        return <Navigate to="/" />;
    }

    // Form state and hooks
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId?: string }>();
    const isEdit = !!eventId;
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        startTime: null as Date | null,
        endTime: null as Date | null,
    });
    const [loading, setLoading] = useState(isEdit);

    // Fetch event for editing
    const fetchEvent = async () => {
        if (isEdit && eventId) {
            setLoading(true);
            const result = await fetchEventById(Number(eventId));
            if (result instanceof Error) {
                setError(result.message);
            } else {
                setForm({
                    title: result.title ?? '',
                    description: result.description ?? '',
                    startTime: result.startTime
                        ? new Date(result.startTime)
                        : null,
                    endTime: result.endTime ? new Date(result.endTime) : null,
                });
            }
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate submission data
        if (!form.title) {
            setError('Please enter a title');
            return;
        }
        if (!form.startTime || !form.endTime) {
            setError('Please select start and end times');
            return;
        }
        if (form.startTime >= form.endTime) {
            setError('End time must be after start time');
            return;
        }

        // Submit POST or PUT request to the API
        try {
            const payload = {
                title: form.title,
                description: form.description,
                startTime: form.startTime.toISOString(),
                endTime: form.endTime.toISOString(),
            };
            if (isEdit && eventId) {
                // Update event
                const result = await updateEvent(Number(eventId), payload);
                if (result instanceof Error) {
                    setError(result.message);
                } else {
                    navigate(`/events/${eventId}`);
                }
            } else {
                // Create event
                const result = await createEvent(payload);
                if (result instanceof Error) {
                    setError(
                        'Unknown error occurred while creating event. Please try again.'
                    );
                } else {
                    navigate(`/events/${result.id}`);
                }
            }
        } catch (error) {
            setError(
                'Unknown error occurred while creating event. Please try again.'
            );
        }
    };

    // Run the fetchEvent function on component mount or when dependencies change
    useEffect(() => {
        fetchEvent();
    }, [isEdit, eventId]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-3/10 mx-auto my-8"
            >
                <h1 className="font-bold text-2xl mb-1">
                    {isEdit ? 'Edit Event' : 'Create an Event!'}
                </h1>
                <p className="text-sm font-normal text-gray-600 mb-4">
                    Event Details
                </p>
                <div className="flex items-center border-2 py-2 px-3 rounded mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                    </svg>

                    <input
                        autoComplete="title"
                        className="pl-2 outline-none border-none w-full placeholder-gray-400"
                        id="title"
                        name="title"
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        placeholder="Title*"
                        type="text"
                        value={form.title}
                        disabled={loading}
                    />
                </div>
                <div className="flex items-center border-2 py-2 px-3 rounded mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                    </svg>

                    <textarea
                        autoComplete="description"
                        className="pl-2 outline-none border-none w-full placeholder-gray-400"
                        id="description"
                        maxLength={200}
                        name="description"
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                        placeholder="Description"
                        value={form.description}
                        disabled={loading}
                    ></textarea>
                </div>
                <div className="flex items-center border-2 py-2 px-3 rounded mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5 mr-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                        />
                    </svg>
                    <DatePicker
                        selected={form.startTime}
                        onChange={(date: Date | null) =>
                            setForm({ ...form, startTime: date })
                        }
                        openToDate={new Date()}
                        showTimeSelect
                        timeFormat="h:mm aa"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        wrapperClassName="w-full"
                        className="w-full placeholder-gray-400"
                        placeholderText="Start Time*"
                        disabled={loading}
                    />
                </div>
                <div className="flex items-center border-2 py-2 px-3 rounded mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5 mr-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                        />
                    </svg>
                    <DatePicker
                        selected={form.endTime}
                        onChange={(date: Date | null) =>
                            setForm({ ...form, endTime: date })
                        }
                        showTimeSelect
                        timeFormat="h:mm aa"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        wrapperClassName="w-full"
                        className="w-full placeholder-gray-400"
                        placeholderText="End Time*"
                        disabled={loading}
                    />
                </div>
                {error && (
                    <div className="text-red-600 text-sm mb-2">{error}</div>
                )}
                <div className="flex gap-4 mt-4">
                    <button
                        type="button"
                        className="basis-1/2 bg-gray-200 px-3 py-1 rounded font-medium hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        onClick={() => navigate('/events')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="basis-1/2 bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                        disabled={loading}
                    >
                        {isEdit ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
