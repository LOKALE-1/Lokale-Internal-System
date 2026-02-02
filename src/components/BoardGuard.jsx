import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

const BoardGuard = ({ children }) => {
    const { user, activeBoard } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) return;

        // For non-founder users, enforce they stay on their default board
        if (user.role !== ROLES.ADMIN) {
            // If they try to access any route other than their default board
            if (location.pathname !== user.defaultBoard &&
                location.pathname !== '/tasks' &&
                location.pathname !== '/projects') {
                // Redirect them back to their default board
                navigate(user.defaultBoard, { replace: true });
            }
        } else {
            // For founders, sync navigation with activeBoard
            if (activeBoard && location.pathname !== activeBoard &&
                location.pathname !== '/tasks' &&
                location.pathname !== '/projects') {
                // Allow navigation but update activeBoard
                // This is handled by the switchBoard function
            }
        }
    }, [user, activeBoard, location.pathname, navigate]);

    return children;
};

export default BoardGuard;
