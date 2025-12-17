import { Outlet, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import { Nav } from './components';
import { Sidebar } from './components';
import { SidebarProvider } from './providers';
import { AuthContext } from './providers';

import './index.css';

const API_HOST = import.meta.env.VITE_API_URL;

if (!API_HOST) {
    throw new Error('VITE_API_URL is not defined');
}

export default function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const auth = useContext(AuthContext);
    const user = auth?.user;

    return (
        <>
            <Nav
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
            />
            <SidebarProvider collapsed={sidebarCollapsed}>
                <div className="pt-16">
                    {user && <Sidebar />}
                    <div
                        className={`transition-all duration-300 ${
                            user
                                ? sidebarCollapsed
                                    ? 'ml-16'
                                    : 'ml-[20%]'
                                : 'mx-auto'
                        }`}
                    >
                        <Outlet />
                    </div>
                </div>
            </SidebarProvider>
        </>
    );
}
