import "../styles/global.css";
import {CandidateCrudComponent} from "Frontend/components/candidate-crud-component/candidate-crud";
import CandidateList from "Frontend/components/candidate-list-component/candidate-list";

export default function  ListCandid() {

return(
    <div className="app-container">
        <div className="main-content">
            <CandidateList />
        </div>
    </div>);
};