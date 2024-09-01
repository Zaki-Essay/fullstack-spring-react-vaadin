import {useEffect, useState} from "react";
import {candidateServiceImpl} from "Frontend/generated/endpoints";
import Candidate from "Frontend/generated/me/gaga/springreactvaadin/entities/Candidate";
import {Grid, GridColumn} from "@vaadin/react-components";

interface CandidateListComponentProps{

}
const CandidateListComponent = ({}: CandidateListComponentProps)=>{

    const [candidate, setCandidate] = useState<Candidate[]>([]);
    useEffect(()=>{
        candidateServiceImpl.findAllCandidate().then((candidates)=>{
             setCandidate(candidates);
        })
    }, [])
    return (
        <div>
            <Grid items={candidate} >
                    <GridColumn path={"id"}/>
                    <GridColumn path={"name"}/>
                    <GridColumn path={"email"}/>
            </Grid>
        </div>
    );
}

export default CandidateListComponent;