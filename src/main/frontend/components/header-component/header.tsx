import { NavLink } from "react-router-dom";
import "./style.css";
import {createMenuItems} from "@vaadin/hilla-file-router/runtime.js";

interface HeaderProps {
    userEmail?: string;
    onLogout?: () => void;
}


export const Header = ({ userEmail, onLogout }: HeaderProps) => {
    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-left">
                    <div className="logo">
                        <span className="logo-text">CandidateApp</span>
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
                </div>

                <div className="header-right">
                    {userEmail && (
                        <div className="user-info">
                            <span className="user-email">{userEmail}</span>
                            <button className="logout-btn" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
