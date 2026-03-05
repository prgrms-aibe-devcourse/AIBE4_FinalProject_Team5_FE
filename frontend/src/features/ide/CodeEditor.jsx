// src/features/ide/CodeEditor.jsx
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
    const [language, setLanguage] = useState('java');
    const [code, setCode] = useState(
        'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}'
    );

    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // 기본적인 커스텀 자동완성
        monaco.languages.registerCompletionItemProvider('java', {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const suggestions = [
                    {
                        label: 'sysout',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'System.out.println(${1});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: '콘솔 출력 스니펫',
                        range: range,
                    },
                    {
                        label: 'psvm',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'public static void main(String[] args) {\n\t${1}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: '메인 메서드 스니펫',
                        range: range,
                    }
                ];
                return { suggestions: suggestions };
            }
        });
    };

    const handleEditorChange = (value) => {
        setCode(value);
        // 코드가 수정되면 기존에 있던 에러 마커(빨간 줄) 초기화
        if (monacoRef.current && editorRef.current) {
            monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), 'owner', []);
        }
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

// 실제 백엔드로 요청 보내기
    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemId: 3, // 3번 문제로 설정
                    memberId: 1,  // 테스트용 임시 유저 ID
                    language: language,
                    sourceCode: code
                }),
            });

            if (response.ok) {
                alert('코드가 채점 서버로 전송되었습니다. 잠시 대기해주세요.');
            } else {
                alert('서버 전송 실패');
            }
        } catch (error) {
            console.error('API 호출 에러:', error);
            alert('서버와 연결할 수 없습니다. 백엔드가 켜져 있는지 확인하세요.');
        }
    };

    return (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--surface-color)', display: 'flex', gap: '10px' }}>
                <select value={language} onChange={handleLanguageChange} style={{ padding: '5px' }}>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                </select>
                <button onClick={handleSubmit} style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px' }}>
                    코드 제출
                </button>
            </div>

            <Editor
                height="500px"
                language={language}
                theme="vs-dark"
                value={code}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;