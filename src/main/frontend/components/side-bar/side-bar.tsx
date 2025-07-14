import React, { useState, useEffect } from "react";
import {Link, NavLink} from "react-router-dom";
import { createMenuItems } from "@vaadin/hilla-file-router/runtime.js";
import "./style.css";
import {
    BarChart2, Brain,
    ClipboardList,
    Home, Info,
    Lamp,
    LayoutDashboard, LogIn,
    LogOut,
    MessageSquare, Phone,
    Settings,
    User,
    Users
} from "lucide-react";
import {ChatHistory} from "Frontend/components/chat-history/chat-history";
import {useAuth} from "Frontend/context/AuthContext";
import {MenuItem} from "@vaadin/hilla-file-router/types.js";
import {useNavigate} from "react-router";




export const SideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string>('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const filterNavigationItems = <T = unknown>(items: ReadonlyArray<MenuItem<T>>): MenuItem<T>[] => {
        // Define paths you want to ignore/hide
        const ignoredPaths: string[] = ['/login', '/register'];

        return items.filter((item: MenuItem<T>) => {
            // Filter out items with ignored paths
            return !ignoredPaths.includes(item.to);
        });
    };
    const handleNavigate = (route: string) => {
        navigate(route);
    };

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobile && isMobileOpen && !(event.target as Element).closest('.sidebar')) {
                setIsMobileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isMobileOpen]);

    // Get user initials for avatar
    const getUserInitials = (email?: string) => {
        if (!email) return 'U';
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase();
    };

    // Icon mapping for navigation items
    const getNavIcon = (title: string) => {
        const iconMap: { [key: string]: JSX.Element } = {
            'Dashboard': <LayoutDashboard size={20} />,
            'Profile': <User size={20} />,
            'Settings': <Settings size={20} />,
            'Analytics': <BarChart2 size={20} />,
            'Reports': <ClipboardList size={20} />,
            'Users': <Users size={20} />,
            'Chat Ia': <MessageSquare size={20} />,
            'Index': <Home size={20} />,
            'About': <Info size={20} />,
            'Rag': <Brain size={20} />
        };
        return iconMap[title] || <div style={{ width: 20 }} />;
    };

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const handleNavClick = () => {
        if (isMobile) {
            setIsMobileOpen(false);
        }
    };

    // Handle chat selection - communicate with main chat component
    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId);
        // You can use custom events, context, or state management to communicate with the main chat component
        window.dispatchEvent(new CustomEvent('selectChat', { detail: { chatId } }));

        if (isMobile) {
            setIsMobileOpen(false);
        }
    };

    // Handle new chat creation
    const handleNewChat = () => {
        setCurrentChatId('');
        // Communicate with main chat component to start new chat
        window.dispatchEvent(new CustomEvent('newChat'));

        if (isMobile) {
            setIsMobileOpen(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && (
                <div
                    className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile toggle button */}
            {isMobile && (
                <button
                    className="mobile-sidebar-toggle"
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        zIndex: 1002,
                        background: 'var(--lumo-primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        boxShadow: 'var(--lumo-box-shadow-m)',
                        fontSize: '18px'
                    }}
                >
                    {isMobileOpen ? '✕' : '☰'}
                </button>
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Toggle button for desktop */}
                {!isMobile && (
                    <button
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    />
                )}

                {/* Logo Section */}
                <div className="logo">
                    <div className="logo-icon" />
                    <span className="logo-text">GenAPP</span>
                </div>

                {/* Navigation */}
                <nav className="main-nav">
                    {filterNavigationItems(createMenuItems()).map((item: MenuItem, index: number) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                            onClick={handleNavClick}
                            title={isCollapsed ? item.title : undefined}
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <span className="nav-icon">
                                {getNavIcon(item.title || '')}
                            </span>
                            <span className="nav-text">{item.title}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Chat History Component */}
                <ChatHistory
                    isCollapsed={isCollapsed}
                    onSelectChat={handleSelectChat}
                    onNewChat={handleNewChat}
                    currentChatId={currentChatId}
                />

                {/* User Info Section */}
                {user?.email ? (
                    <div className="user-info">
                        <div className="user-avatar">
                            {getUserInitials(user?.email)}
                        </div>
                        <span className="user-email" title={user?.email}>
                            {user?.email}
                        </span>
                        <button
                            className="logout-btn"
                            onClick={logout}
                            title="Sign out"
                        >
                            <LogOut/>
                        </button>
                    </div>
                ):
                    <div className="user-info">
                        <div onClick={()=>handleNavigate('/login')} className="login-btn">
                                <LogIn/>
                        </div>
                    </div>
                }
            </aside>
        </>
    );
};