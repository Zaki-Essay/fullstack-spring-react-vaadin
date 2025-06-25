import CandidateListComponent from "Frontend/components/candidate-list-component/candidate-list";
import {RootLayout} from "Frontend/layout/app-layout/app-layout";


export const Index = () => {
    const handleLogout = () => {
        // Handle logout logic
        console.log("Logging out...");
    };

    return (
        <RootLayout
            userEmail="4Dw2b@example.com"
            onLogout={handleLogout}
        >
            <CandidateListComponent />
        </RootLayout>
    );
};

export default Index;