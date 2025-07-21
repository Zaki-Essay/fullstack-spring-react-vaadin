import {LlmChat} from "Frontend/pages/chat-ia/llm-chat";
import RagChat from "Frontend/pages/rag-chat/rag-chat";

export default function  Rag() {

    return(
        <div className="app-container">
            <div className="main-content">
                <RagChat/>
            </div>
        </div>);
};