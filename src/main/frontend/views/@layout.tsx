import {NavLink, Outlet} from "react-router-dom";
import "./style.css";
import {SideBar} from "Frontend/components/side-bar/side-bar";
import {AuthService} from "Frontend/generated/endpoints";
import {AuthProvider, useAuth} from "Frontend/context/AuthContext";

interface LayoutProps {
    userEmail?: string;
    onLogout?: () => void;
}


export default function Layout() {


    return (
        <AuthProvider>
        <div className="app-layout">
            <SideBar/>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
        </AuthProvider>
    );
}
