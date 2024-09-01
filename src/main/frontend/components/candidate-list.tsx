import {useEffect, useState} from "react";
import {candidateServiceImpl} from "Frontend/generated/endpoints";
import Candidate from "Frontend/generated/me/gaga/springreactvaadin/entities/Candidate";

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

            <h2>candidate List component</h2>
            {candidate.map((candidate)=>{
                return <div >
                    <span>{candidate.id}</span>
                    <span>{candidate.name}</span>
                    <span>{candidate.email}</span>
                </div>
            })}
        </div>
    );
}

export default CandidateListComponent;