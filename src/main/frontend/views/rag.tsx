import {LlmChat} from "Frontend/components/chat-ia/llm-chat";
import RagChat from "Frontend/components/rag-chat/rag-chat";

export default function  Rag() {

    return(
        <div className="app-container">
            <div className="main-content">
                <RagChat/>
            </div>
        </div>);
};