import CodeBlock from "Frontend/components/code-block/code-block";
import React from "react";

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const renderContent = (text: string): React.ReactNode => {
        // Split by code blocks first
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                const beforeText = text.slice(lastIndex, match.index);
                parts.push(renderInlineElements(beforeText));
            }

            // Add code block
            const language = match[1] || '';
            const code = match[2];
            parts.push(
                <CodeBlock key={match.index} language={language}>
                    {code}
                </CodeBlock>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            const remainingText = text.slice(lastIndex);
            parts.push(renderInlineElements(remainingText));
        }

        return parts.length > 0 ? parts : renderInlineElements(text);
    };

    const renderInlineElements = (text: string): React.ReactNode => {
        // Handle inline code
        const inlineCodeRegex = /`([^`]+)`/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = inlineCodeRegex.exec(text)) !== null) {
            // Add text before inline code
            if (match.index > lastIndex) {
                const beforeText = text.slice(lastIndex, match.index);
                parts.push(renderBasicMarkdown(beforeText));
            }

            // Add inline code
            parts.push(
                <CodeBlock key={match.index} inline>
                    {match[1]}
                </CodeBlock>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            const remainingText = text.slice(lastIndex);
            parts.push(renderBasicMarkdown(remainingText));
        }

        return parts.length > 0 ? parts : renderBasicMarkdown(text);
    };

    const renderBasicMarkdown = (text: string): React.ReactNode => {
        // Handle bold, italic, and line breaks
        return text
            .split('\n')
            .map((line: string, index: number) => (
                <span key={index}>
                    {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part: string, i: number) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={i}>{part.slice(1, -1)}</em>;
                        }
                        return part;
                    })}
                    {index < text.split('\n').length - 1 && <br />}
                </span>
            ));
    };

    return <div className="markdown-content">{renderContent(content)}</div>;
};

export default MarkdownRenderer;