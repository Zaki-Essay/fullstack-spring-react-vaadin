import {Header} from "Frontend/components/header-component/header";
import {Footer} from "Frontend/components/footer-component/footer";
import {Outlet} from "react-router-dom";



export default function Layout(){
    return (
        <div className="app-layout">
            <Header userEmail={""} onLogout={() => {}} />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};