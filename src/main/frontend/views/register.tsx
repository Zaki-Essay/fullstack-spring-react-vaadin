import "../styles/global.css";
import "./style.css";

import React from 'react';
import { Bot, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import {useNavigate} from "react-router";
import {RegisterForm} from "Frontend/pages/register/register-form";

export default function Register() {
    const navigate = useNavigate();
    const handleChatSelection = (chatType: string) => {
        // Navigate to the selected chat type
        // You can implement routing logic here
        navigate(chatType);
        console.log(`Navigating to ${chatType} chat`);
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                <div className="welcome-container">
                    <RegisterForm/>
                </div>
            </div>
        </div>
    );
}