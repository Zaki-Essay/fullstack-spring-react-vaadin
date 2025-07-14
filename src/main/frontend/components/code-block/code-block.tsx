import React, {useRef, useState} from "react";
import {Check, Copy} from "lucide-react";

interface CodeBlockProps {
    children: React.ReactNode;
    language?: string;
    inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, language = '', inline = false }) => {
    const [copied, setCopied] = useState<boolean>(false);
    const codeRef = useRef<HTMLElement>(null);

    const handleCopy = async () => {
        if (codeRef.current) {
            try {
                await navigator.clipboard.writeText(codeRef.current.textContent || '');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        }
    };

    if (inline) {
        return (
            <code className="inline-code">
                {children}
            </code>
        );
    }

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <span className="code-language">{language || 'text'}</span>
                <button
                    onClick={handleCopy}
                    className="code-copy-button"
                    title="Copy code"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>
            <pre className="code-block">
                <code ref={codeRef} className={`language-${language}`}>
                    {children}
                </code>
            </pre>
        </div>
    );
};
export default CodeBlock;