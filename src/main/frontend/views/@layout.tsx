import {NavLink, Outlet} from "react-router-dom";
import "./style.css";
import {createMenuItems} from "@vaadin/hilla-file-router/runtime.js";

interface LayoutProps {
    userEmail?: string;
    onLogout?: () => void;
}

export default function Layout({ userEmail, onLogout }: LayoutProps) {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="logo">
                    <span className="logo-text">
                        GenAPP
                    </span>
                </div>

                <nav className="main-nav">
                    {createMenuItems().map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            {item.title}
                        </NavLink>
                    ))}
                </nav>

                {userEmail && (
                    <div className="user-info">
                        <span className="user-email">{userEmail}</span>
                        <button className="logout-btn" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                )}
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
