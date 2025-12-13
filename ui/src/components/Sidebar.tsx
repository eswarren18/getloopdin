import { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { AuthContext } from '../providers/AuthProvider';
import { useSidebar } from '../providers/SidebarProvider';

export function Sidebar() {
    // Redirect to home if not logged in
    const auth = useContext(AuthContext);
    if (!auth?.user) return null;

    // Component state and hooks
    const location = useLocation();
    const navigate = useNavigate();
    const collapsed = useSidebar();

    // Conditional styles
    const sidebarStyle = collapsed ? 'w-16 items-center' : 'w-1/5';
    const buttonStyle = collapsed
        ? 'w-12 px-0 rounded-full justify-center'
        : 'w-11/12 px-4 rounded-r-3xl rounded-l-none justify-start';
    const buttonTextClass = collapsed ? 'hidden' : 'inline';

    return (
        <div
            className={`${sidebarStyle} mt-2 h-full fixed left-0 gap-1 bg-white shadow-md flex flex-col transition-all duration-300 z-40`}
        >
            <button
                className={`cursor-pointer font-medium text-xl flex items-center mt-2 gap-2 ${buttonStyle} py-3 transition-colors duration-150
                        ${location.pathname === '/events' ? 'bg-cyan-100' : 'bg-white hover:bg-cyan-50'}`}
                onClick={() => navigate('/events')}
                type="button"
            >
                <span className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                        />
                    </svg>
                </span>
                <span className={buttonTextClass}>Events</span>
            </button>
            <button
                className={`cursor-pointer font-medium text-xl flex items-center gap-2 ${buttonStyle} py-3 transition-colors duration-150
                        ${location.pathname === '/invites' ? 'bg-cyan-100' : 'bg-white hover:bg-cyan-50'}`}
                onClick={() => navigate('/invites')}
                type="button"
            >
                <span className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                    </svg>
                </span>
                <span className={buttonTextClass}>Invites</span>
            </button>
        </div>
    );
}
