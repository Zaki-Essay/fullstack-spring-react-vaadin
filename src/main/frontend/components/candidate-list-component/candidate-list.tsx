import {useEffect, useState} from "react";
import {candidateServiceImpl} from "Frontend/generated/endpoints";
import Candidate from "Frontend/generated/me/gaga/springreactvaadin/entities/Candidate";
import "./style.css";

interface CandidateListComponentProps{

}
const CandidateListComponent = ({}: CandidateListComponentProps) => {
    const [candidate, setCandidate] = useState<Candidate[]>([]);

    useEffect(() => {
        candidateServiceImpl.findAllCandidate().then((candidates) => {
            setCandidate(candidates);
        })
    }, [])

    return (
        <div className="candidate-list-container">
            <h2 className="candidate-list-title">Candidate List</h2>
            <div className="candidate-grid">
                {candidate.map((candidate) => {
                    return (
                        <div key={candidate.id} className="candidate-card">
                            <div className="candidate-info">
                                <span className="candidate-id">ID: {candidate.id}</span>
                                <span className="candidate-name">{candidate.name}</span>
                                <span className="candidate-email">{candidate.email}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CandidateListComponent;