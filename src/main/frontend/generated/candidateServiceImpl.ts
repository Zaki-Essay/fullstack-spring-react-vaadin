import { EndpointRequestInit as EndpointRequestInit_1 } from "@vaadin/hilla-frontend";
import client_1 from "./connect-client.default.js";
import type Candidate_1 from "./me/gaga/springreactvaadin/entities/Candidate.js";
async function findAllCandidate_1(init?: EndpointRequestInit_1): Promise<Array<Candidate_1>> { return client_1.call("candidateServiceImpl", "findAllCandidate", {}, init); }
async function save_1(candidate: Candidate_1, init?: EndpointRequestInit_1): Promise<Candidate_1> { return client_1.call("candidateServiceImpl", "save", { candidate }, init); }
export { findAllCandidate_1 as findAllCandidate, save_1 as save };
