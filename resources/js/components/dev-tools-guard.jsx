import { useEffect, useState } from 'react';
const DevToolsGuard = ({ children }) => {
    return <>{children}</>;
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            if (
                (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) &&
                import.meta.env.MODE !== 'development'
            ) {
                setIsDevToolsOpen(true);
            } else {
                setIsDevToolsOpen(false);
            }
        };
        const checkDevTools = () => {
            handleResize();
        };
        checkDevTools();
        const interval = setInterval(checkDevTools, 500);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
        };
    }, []);

    if (isDevToolsOpen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="rounded-md bg-white p-8 text-center shadow-md">
                    <h1 className="text-6xl font-bold text-red-600">403</h1>
                    <p className="mt-4 text-2xl font-semibold text-gray-800">Access Forbidden</p>
                    <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default DevToolsGuard;
