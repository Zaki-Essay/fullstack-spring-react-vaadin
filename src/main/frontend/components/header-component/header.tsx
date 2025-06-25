import "./style.css";
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
                        <a href="/dashboard" className="nav-link">Dashboard</a>
                        <a href="/candidates" className="nav-link">Candidates</a>
                        <a href="/reports" className="nav-link">Reports</a>
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