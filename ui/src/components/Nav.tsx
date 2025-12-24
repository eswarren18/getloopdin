import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../providers';

interface NavProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Nav({ setSidebarCollapsed }: NavProps) {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const signOut = auth?.signOut;
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Handle clicks outside the user options dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setDropdownOpen(false);
        }
    };

    // Attach and clean up event listener for clicks outside dropdown
    useEffect(() => {
        if (!dropdownOpen) return;
        handleClickOutside;
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <nav className="fixed top-0 left-0 w-full h-16 flex items-center px-4 border-b border-gray-200 bg-white z-50">
            {/* Sidebar toggle and site name */}
            <div className="flex gap-4 items-center">
                {user && (
                    <button
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-2 cursor-pointer hover:bg-cyan-100 active:bg-cyan-200 transition-colors duration-150"
                        title="Toggle Sidebar"
                        onClick={() =>
                            setSidebarCollapsed((prev: boolean) => !prev)
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                            />
                        </svg>
                    </button>
                )}
                <span className="font-semibold text-2xl">Loopd In</span>
            </div>
            {/* Sign up/in or notifications/sign out */}
            <div className="ml-auto flex items-center gap-2">
                {/* User is NOT signed in */}
                {!user ? (
                    <>
                        {/* Sign up */}
                        <Link to="/signup">
                            <button
                                className="basis-1/2 bg-gray-200 px-3 py-1 rounded font-medium hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                                disabled={location.pathname === '/signup'}
                            >
                                Sign Up
                            </button>
                        </Link>
                        {/* Sign in */}
                        <Link to="/signin">
                            <button
                                className="basis-1/2 bg-cyan-600 text-white px-3 py-1 rounded font-medium hover:bg-cyan-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                                disabled={location.pathname === '/signin'}
                            >
                                Sign In
                            </button>
                        </Link>
                    </>
                ) : (
                    <>
                        {/* User is signed in */}
                        {/* Notifications */}
                        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-2 hover:bg-gray-200 active:bg-red-600 transition-colors duration-150">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6 text-gray-400"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                />
                            </svg>
                        </button>
                        {/* User Options */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-2 hover:bg-gray-200 transition-colors duration-150"
                                title="User Options"
                                onClick={() => setDropdownOpen((open) => !open)}
                            >
                                <div className="text-gray-400 font-semibold">
                                    {user.firstName?.charAt(0).toUpperCase()}
                                    {user.lastName?.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            {dropdownOpen && (
                                <div
                                    className="absolute left-0 mt-0.5 w-36 bg-white border border-gray-200 rounded shadow-lg z-50"
                                    style={{ transform: 'translateX(-80%)' }}
                                >
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-cyan-50"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Settings
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-cyan-50"
                                        onClick={() => {
                                            if (signOut) signOut();
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
