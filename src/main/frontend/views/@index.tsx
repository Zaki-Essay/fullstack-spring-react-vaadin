import CandidateListComponent from "Frontend/components/candidate-list";
import "../styles/style.css"
import CandidateCrudComponent from "Frontend/components/candidate-crud";

const Index = () => {
    return (

        <div>
            <h2>Crud Operation Using AutoCrud component</h2>
            <CandidateCrudComponent/>
               <br/>
            <h2>List Candidate using Grid component</h2>
            <CandidateListComponent/>

        </div>
    );
}

export default Index;