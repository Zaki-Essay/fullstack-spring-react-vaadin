import "../styles/global.css";
import "./style.css";

import React from 'react';
import { Bot, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import {useNavigate} from "react-router";

export default function Index() {
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
                    <div className="welcome-header">
                        <div className="welcome-icon">
                            <Bot size={64} />
                        </div>
                        <h2 className="welcome-title">Welcome to Simple Chat</h2>
                        <p className="welcome-subtitle">
                            Choose your AI assistant experience. Whether you need general conversation or document-based insights, we've got you covered.
                        </p>
                    </div>

                    <div className="chat-options">
                        {/* LLM Chat Card */}
                        <div className="chat-option-card">
                            <div className="card-header">
                                <div className="card-icon llm-icon">
                                    <MessageCircle size={32} />
                                </div>
                                <div className="card-title-section">
                                    <h3 className="card-title">LLM Chat</h3>
                                    <p className="card-subtitle">General AI Assistant</p>
                                </div>
                            </div>

                            <p className="card-description">
                                Engage in natural conversations with our AI assistant. Perfect for general questions, creative writing, coding help, and brainstorming sessions.
                            </p>

                            <div className="card-features">
                                <h4 className="features-title">Features:</h4>
                                <ul className="features-list">
                                    <li>General knowledge Q&A</li>
                                    <li>Creative writing assistance</li>
                                    <li>Code generation & debugging</li>
                                    <li>Problem solving & analysis</li>
                                </ul>
                            </div>

                            <button
                                className="chat-option-button llm-button"
                                onClick={() => handleChatSelection('/chat-ia')}
                            >
                                Start LLM Chat
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* RAG Chat Card */}
                        <div className="chat-option-card">
                            <div className="card-header">
                                <div className="card-icon rag-icon">
                                    <BookOpen size={32} />
                                </div>
                                <div className="card-title-section">
                                    <h3 className="card-title">RAG Chat</h3>
                                    <p className="card-subtitle">Document-Based AI</p>
                                </div>
                            </div>

                            <p className="card-description">
                                Upload documents and get AI-powered insights from your own content. Perfect for research, document analysis, and knowledge extraction.
                            </p>

                            <div className="card-features">
                                <h4 className="features-title">Features:</h4>
                                <ul className="features-list">
                                    <li>Document upload & analysis</li>
                                    <li>Context-aware responses</li>
                                    <li>Information extraction</li>
                                    <li>Citation & source tracking</li>
                                </ul>
                            </div>

                            <button
                                className="chat-option-button rag-button"
                                onClick={() => handleChatSelection('rag')}
                            >
                                Start RAG Chat
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="welcome-footer">
                        <p className="footer-text">
                            New to AI chat? Both options are designed to be intuitive and user-friendly.
                        </p>
                        <div className="footer-features">
                            <span>• Secure conversations</span>
                            <span>• Real-time responses</span>
                            <span>• Chat history</span>
                            <span>• Mobile friendly</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}