import {NavLink, Outlet} from "react-router-dom";
import "./style.css";
import {SideBar} from "Frontend/components/side-bar/side-bar";

interface LayoutProps {
    userEmail?: string;
    onLogout?: () => void;
}

export default function Layout({ userEmail, onLogout }: LayoutProps) {
    return (
        <div className="app-layout">
            <SideBar userEmail={"UserEamail@example.com"} onLogout={() => {}}  />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
