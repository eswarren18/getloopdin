import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './providers';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Event, Events, Home, Invites } from './pages';
import { EventForm, InviteForm, QuestionForm, SignIn, SignUp } from './forms';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Home />} />
                        <Route path="signup" element={<SignUp />} />
                        <Route path="signin" element={<SignIn />} />
                        <Route path="events" element={<Events />} />
                        <Route path="event-form" element={<EventForm />} />
                        <Route
                            path="event-form/:eventId"
                            element={<EventForm />}
                        />
                        <Route path="events/:eventId" element={<Event />} />
                        <Route path="events/token/:token" element={<Event />} />
                        <Route path="invites" element={<Invites />} />
                        <Route
                            path="invite-form/:eventId"
                            element={<InviteForm />}
                        />
                        <Route
                            path="question-form/:eventId"
                            element={<QuestionForm />}
                        />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
