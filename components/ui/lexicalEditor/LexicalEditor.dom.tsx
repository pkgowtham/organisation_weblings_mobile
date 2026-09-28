"use dom";

import React, { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND, $getRoot, $insertNodes } from 'lexical';

interface LexicalEditorProps {
    initialHTML?: string;
    placeholder?: string;
    onChangeHTML?: (html: string) => void;
    onHeightChange?: (height: number) => void;
    readOnly?: boolean;
    minHeight?: number;
    themeColors?: {
        background: string;
        text: string;
        placeholder: string;
        border: string;
        primary: string;
    };
    // We can pass an action string from native to trigger a format command
    actionTrigger?: { action: string, timestamp: number };
    dom?: any;
    style?: any;
}

// Plugin to handle HTML Initialization
function HtmlPlugin({ initialHTML }: { initialHTML?: string }) {
    const [editor] = useLexicalComposerContext();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!initialHTML || isInitialized) return;

        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(initialHTML, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            $insertNodes(nodes);
        });
        setIsInitialized(true);
    }, [editor, initialHTML, isInitialized]);

    return null;
}

// Plugin to handle HTML Generation on change
function HtmlOnChangePlugin({ onChangeHTML }: { onChangeHTML?: (html: string) => void }) {
    const [editor] = useLexicalComposerContext();

    return (
        <OnChangePlugin
            onChange={(editorState) => {
                editorState.read(() => {
                    const html = $generateHtmlFromNodes(editor, null);
                    if (onChangeHTML) {
                        onChangeHTML(html);
                    }
                });
            }}
        />
    );
}

// Plugin to listen for external commands (like native toolbar button clicks)
function ExternalCommandPlugin({ actionTrigger }: { actionTrigger?: { action: string, timestamp: number } }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!actionTrigger || actionTrigger.timestamp === 0) return;

        const action = actionTrigger.action;
        if (action === 'undo') {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
        } else if (action === 'redo') {
            editor.dispatchCommand(REDO_COMMAND, undefined);
        } else if (['bold', 'italic', 'underline', 'strikethrough'].includes(action)) {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, action as any);
        } else if (['left', 'center', 'right', 'justify'].includes(action)) {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, action as any);
        }
    }, [actionTrigger, editor]);

    return null;
}

const theme = {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'editor-placeholder',
    paragraph: 'editor-paragraph',
    text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
    },
    list: {
        ul: 'editor-list-ul',
        ol: 'editor-list-ol',
        listitem: 'editor-listitem',
    }
};

export default function LexicalEditorDom({
    initialHTML,
    placeholder = 'Enter text...',
    onChangeHTML,
    onHeightChange,
    readOnly = false,
    minHeight = 150,
    themeColors = {
        background: '#ffffff',
        text: '#000000',
        placeholder: '#8D8D8D',
        border: '#cccccc',
        primary: '#0000ff'
    },
    actionTrigger
}: LexicalEditorProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!onHeightChange || !rootRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Add a small buffer to prevent cutoff
                onHeightChange(entry.contentRect.height + 10);
            }
        });
        resizeObserver.observe(rootRef.current);
        return () => resizeObserver.disconnect();
    }, [onHeightChange]);

    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        editable: !readOnly,
        nodes: [
            HeadingNode,
            QuoteNode,
            ListItemNode,
            ListNode,
        ],
        onError: (error: Error) => {
            console.error('Lexical Error:', error);
        },
    };

    return (
        <div ref={rootRef} style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: readOnly ? 'auto' : '100%',
            backgroundColor: readOnly ? 'transparent' : themeColors.background,
            color: themeColors.text,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            boxSizing: 'border-box',
            overflow: readOnly ? 'visible' : 'hidden'
        }}>
            <style>{`
                html, body {
                    height: ${readOnly ? 'auto !important' : '100%'};
                    background-color: transparent !important;
                }
                .editor-container {
                    position: relative;
                    width: 100%;
                    height: ${readOnly ? 'auto' : '100%'};
                    min-height: ${readOnly ? '0px' : minHeight + 'px'};
                }
                .editor-input {
                    min-height: ${readOnly ? '0px' : minHeight + 'px'};
                    height: ${readOnly ? 'auto' : '100%'};
                    padding: ${readOnly ? '0' : '10px'};
                    outline: none;
                    overflow-y: ${readOnly ? 'hidden' : 'auto'};
                }
                .editor-placeholder {
                    color: ${themeColors.placeholder};
                    overflow: hidden;
                    position: absolute;
                    text-overflow: ellipsis;
                    top: 10px;
                    left: 10px;
                    font-size: 14px;
                    user-select: none;
                    pointer-events: none;
                }
                .editor-text-bold { font-weight: bold; }
                .editor-text-italic { font-style: italic; }
                .editor-text-underline { text-decoration: underline; }
                .editor-text-strikethrough { text-decoration: line-through; }
                .editor-list-ul { padding-left: 24px; margin: 0; }
                .editor-list-ol { padding-left: 24px; margin: 0; }
                .editor-listitem { margin-bottom: 8px; }
                .editor-paragraph { margin: 0 0 8px 0; }
                
                /* Hide scrollbar for a cleaner look natively */
                ::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <LexicalComposer initialConfig={initialConfig}>
                <div className="editor-container">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<div className="editor-placeholder">{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary as any}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <HtmlPlugin initialHTML={initialHTML} />
                    {!readOnly && <HtmlOnChangePlugin onChangeHTML={onChangeHTML} />}
                    <ExternalCommandPlugin actionTrigger={actionTrigger} />
                </div>
            </LexicalComposer>
        </div>
    );
}
