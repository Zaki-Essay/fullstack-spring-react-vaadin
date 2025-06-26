import {AutoCrud} from "@vaadin/hilla-react-crud";
import {CandidateCrudService} from "Frontend/generated/endpoints";
import Candidate from "Frontend/generated/me/gaga/springreactvaadin/entities/Candidate";
import candidateModel from "Frontend/generated/me/gaga/springreactvaadin/entities/CandidateModel";

interface CandidateCrudComponentProps{

}

export const CandidateCrudComponent = ({}: CandidateCrudComponentProps)=>{
    return (
        <AutoCrud service={CandidateCrudService} model={candidateModel}/>
    );
}