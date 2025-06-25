import {Header} from "Frontend/components/header-component/header";
import {Footer} from "Frontend/components/footer-component/footer";

interface MainLayoutProps {
    children: React.ReactNode;
    userEmail?: string;
    onLogout?: () => void;
}

export const RootLayout = ({ children, userEmail, onLogout }: MainLayoutProps) => {
    return (
        <div className="app-layout">
            <Header userEmail={userEmail} onLogout={onLogout} />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};