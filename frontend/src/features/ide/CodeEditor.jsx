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

    const handleSubmit = () => {
        console.log('제출된 언어:', language);
        console.log('제출된 코드:', code);

        // 실제로는 여기서 백엔드 API를 호출함
        // 테스트를 위해 컴파일 에러 마커 표시 함수 실행
        simulateCompilationError();
    };

    // 2. 컴파일 에러 마커 표시 테스트 (백엔드 응답 시뮬레이션)
    const simulateCompilationError = () => {
        if (!monacoRef.current || !editorRef.current) return;

        const model = editorRef.current.getModel();
        // 백엔드에서 에러가 발생한 위치와 에러 메시지를 반환해줘야 함
        const markers = [
            {
                message: "';' expected (가상 컴파일 에러)",
                severity: monacoRef.current.MarkerSeverity.Error,
                startLineNumber: 3,
                startColumn: 9,
                endLineNumber: 3,
                endColumn: 43,
            }
        ];

        // 에디터에 에러 마커 세팅
        monacoRef.current.editor.setModelMarkers(model, 'owner', markers);
        alert('테스트: 3번째 줄에 가상 컴파일 에러가 표시되었습니다.');
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