import {AutoCrud} from "@vaadin/hilla-react-crud";
import {candidateCrudService} from "Frontend/generated/endpoints";
import candidateModel from "Frontend/generated/me/gaga/springreactvaadin/entities/CandidateModel";

interface CandidateCrudComponentProps{

}

const CandidateCrudComponent = ({}: CandidateCrudComponentProps)=>{
    return (
      <AutoCrud service={candidateCrudService} model={candidateModel}/>
    );
}


export default CandidateCrudComponent;