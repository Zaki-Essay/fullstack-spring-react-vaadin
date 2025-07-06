import "./style.css";
export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4 className="footer-title">CandidateApp</h4>
                        <p className="footer-description">
                            Streamline your recruitment process with our comprehensive candidate management system.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/candidates" className="footer-link">View Candidates</a></li>
                            <li><a href="/add-candidate" className="footer-link">Add Candidate</a></li>
                            <li><a href="/reports" className="footer-link">Reports</a></li>
                            <li><a href="/settings" className="footer-link">Settings</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-title">Support</h4>
                        <ul className="footer-links">
                            <li><a href="/help" className="footer-link">Help Center</a></li>
                            <li><a href="/contact" className="footer-link">Contact Us</a></li>
                            <li><a href="/documentation" className="footer-link">Documentation</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>&copy; {currentYear} CandidateApp. All rights reserved.</p>
                    </div>
                    <div className="footer-legal">
                        <a href="/privacy" className="footer-link">Privacy Policy</a>
                        <span className="separator">|</span>
                        <a href="/terms" className="footer-link">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};