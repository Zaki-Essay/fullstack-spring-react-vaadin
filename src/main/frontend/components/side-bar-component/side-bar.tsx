import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { createMenuItems } from "@vaadin/hilla-file-router/runtime.js";
import "./style.css";
import {LogOut} from "lucide-react";

interface SidebarProps {
    userEmail?: string;
    onLogout?: () => void;
}

const Sidebar = ({ userEmail, onLogout }: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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

    // Icon mapping for navigation items (you can expand this based on your routes)
    const getNavIcon = (title: string) => {
        const iconMap: { [key: string]: string } = {
            'Dashboard': '📊',
            'Profile': '👤',
            'Settings': '⚙️',
            'Analytics': '📈',
            'Reports': '📋',
            'Users': '👥',
            'Chat Ia': '💬',
            'Index': '🏠',
            'About': 'ℹ️',
            'Contact': '📞'
        };
        return iconMap[title] || '•';
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
                    {createMenuItems().map((item, index) => (
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

                {/* User Info Section */}
                {userEmail && (
                    <div className="user-info">
                        <div className="user-avatar">
                            {getUserInitials(userEmail)}
                        </div>
                        <span className="user-email" title={userEmail}>
                            {userEmail}
                        </span>
                        <button
                            className="logout-btn"
                            onClick={onLogout}
                            title="Sign out"
                        >
                            <LogOut/>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;