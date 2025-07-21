import {Bot} from "lucide-react";
import React from "react";
import "./style.css";

export const EmptyState: React.FC = () => (
    <div className="empty-state">
        <div className="empty-state-icon">
            <Bot size={64} />
        </div>
        <p className="empty-state-text">Start a conversation with the AI assistant</p>
        <p className="empty-state-subtext">Type your message below to begin</p>
    </div>
);