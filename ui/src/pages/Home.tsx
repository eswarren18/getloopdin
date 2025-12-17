import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { AuthContext } from '../providers';

export default function Home() {
    // Redirect to events if logged in (common + acceptable pattern)
    const auth = useContext(AuthContext);
    if (auth?.user) {
        return <Navigate to="/events" />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white text-gray-900">
            {/* HERO SECTION */}
            <section className="flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
                {/* Placeholder Logo / Illustration */}
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-200">
                    <span className="text-sm text-gray-500">SVG</span>
                </div>

                <h1 className="max-w-3xl text-5xl font-bold leading-tight">
                    Plan events without the chaos
                </h1>

                <p className="mt-6 max-w-2xl text-lg text-gray-600">
                    Loopd In keeps every guest, message, and update in one place
                    — so planning stays simple and everyone stays aligned.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Link to="/signup">
                        <button
                            onClick={() => {}}
                            className="px-8 py-3 bg-cyan-600 text-white rounded-2xl text-lg font-semibold shadow hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                        >
                            Get started
                        </button>
                    </Link>
                    <button
                        onClick={() => {}}
                        className="px-8 py-3 bg-gray-200 rounded-2xl text-lg font-semibold hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer"
                    >
                        View demo
                    </button>
                </div>
            </section>
            {/* BENEFITS SECTION */}
            <section className="bg-gray-50 px-6 py-20">
                <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-8 shadow">
                        <div className="mb-4 h-10 w-10 rounded-lg bg-gray-200" />
                        <h3 className="text-xl font-semibold">
                            One shared conversation
                        </h3>
                        <p className="mt-3 text-gray-600">
                            No more group texts or email threads. Every event
                            has a single, organized chat.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-8 shadow">
                        <div className="mb-4 h-10 w-10 rounded-lg bg-gray-200" />
                        <h3 className="text-xl font-semibold">
                            Clear plans, fewer questions
                        </h3>
                        <p className="mt-3 text-gray-600">
                            Dates, locations, and updates live in one place — so
                            guests always know what’s happening.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-8 shadow">
                        <div className="mb-4 h-10 w-10 rounded-lg bg-gray-200" />
                        <h3 className="text-xl font-semibold">
                            Built for real groups
                        </h3>
                        <p className="mt-3 text-gray-600">
                            From small hangouts to large events, Loopd In scales
                            with your plans.
                        </p>
                    </div>
                </div>
            </section>
            {/* HOW IT WORKS */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-4xl font-bold">How it works</h2>
                    <p className="mt-4 text-gray-600">
                        Create an event, invite your group, and keep everything
                        in sync.
                    </p>

                    <div className="mt-16 grid gap-12 md:grid-cols-3">
                        <div>
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-200" />
                            <h4 className="text-lg font-semibold">
                                Create an event
                            </h4>
                            <p className="mt-2 text-gray-600">
                                Set the details in seconds.
                            </p>
                        </div>

                        <div>
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-200" />
                            <h4 className="text-lg font-semibold">
                                Invite your guests
                            </h4>
                            <p className="mt-2 text-gray-600">
                                Everyone joins the same space.
                            </p>
                        </div>

                        <div>
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-200" />
                            <h4 className="text-lg font-semibold">
                                Stay loopd in
                            </h4>
                            <p className="mt-2 text-gray-600">
                                Chat, updates, and changes — all together.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* SECONDARY CTA */}
            <section className="bg-gray-900 px-6 py-20 text-center text-white">
                <h2 className="text-4xl font-bold">
                    Ready to plan your next event?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-gray-300">
                    Stop juggling tools and start planning together.
                </p>

                <button
                    onClick={() => {}}
                    className="px-10 py-4 mt-10 bg-cyan-600 text-white rounded-2xl text-lg font-semibold shadow hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
                >
                    Create your first event
                </button>
            </section>
        </div>
    );
}
