import { EndpointRequestInit as EndpointRequestInit_1 } from "@vaadin/hilla-frontend";
import type Filter_1 from "./com/vaadin/hilla/crud/filter/Filter.js";
import type Pageable_1 from "./com/vaadin/hilla/mappedtypes/Pageable.js";
import client_1 from "./connect-client.default.js";
import type Candidate_1 from "./me/gaga/springreactvaadin/entities/Candidate.js";
async function count_1(filter: Filter_1 | undefined, init?: EndpointRequestInit_1): Promise<number> { return client_1.call("candidateCrudService", "count", { filter }, init); }
async function exists_1(id: number, init?: EndpointRequestInit_1): Promise<boolean> { return client_1.call("candidateCrudService", "exists", { id }, init); }
async function get_1(id: number, init?: EndpointRequestInit_1): Promise<Candidate_1 | undefined> { return client_1.call("candidateCrudService", "get", { id }, init); }
async function list_1(pageable: Pageable_1, filter: Filter_1 | undefined, init?: EndpointRequestInit_1): Promise<Array<Candidate_1>> { return client_1.call("candidateCrudService", "list", { pageable, filter }, init); }
async function delete_1(id: number, init?: EndpointRequestInit_1): Promise<void> { return client_1.call("candidateCrudService", "delete", { id }, init); }
async function deleteAll_1(ids: Array<number>, init?: EndpointRequestInit_1): Promise<void> { return client_1.call("candidateCrudService", "deleteAll", { ids }, init); }
async function save_1(value: Candidate_1, init?: EndpointRequestInit_1): Promise<Candidate_1 | undefined> { return client_1.call("candidateCrudService", "save", { value }, init); }
async function saveAll_1(values: Array<Candidate_1>, init?: EndpointRequestInit_1): Promise<Array<Candidate_1>> { return client_1.call("candidateCrudService", "saveAll", { values }, init); }
export { count_1 as count, delete_1 as delete, deleteAll_1 as deleteAll, exists_1 as exists, get_1 as get, list_1 as list, save_1 as save, saveAll_1 as saveAll };
