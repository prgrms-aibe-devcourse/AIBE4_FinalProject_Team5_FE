import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from '@monaco-editor/react';

const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [language, setLanguage] = useState('java');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [persona, setPersona] = useState("10년 차 시니어 알고리즘 멘토");

    const [consoleOutput, setConsoleOutput] = useState("실행 결과가 여기에 표시됩니다.\n\n코드를 작성하고 우측 하단의 제출 버튼을 눌러주세요.");

    const defaultCodes = {
        java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // 코드를 작성하세요\n    }\n}',
        python: '# 코드를 작성하세요\nimport sys\n\n',
        javascript: '// 코드를 작성하세요\nconst fs = require("fs");\n\n'
    };

    useEffect(() => {
        setCode(defaultCodes[language] || '');
    }, [language]);

    useEffect(() => {
        const fetchProblemDetail = async () => {
            try {
                const response = await api.get(`/coditor/problems/${id}`);
                setProblem(response.data);
            } catch (err) {
                console.error('상세 조회 에러:', err);
                setError('문제 정보를 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblemDetail();
    }, [id]);

    useEffect(() => {
        const handleGradingResult = (e) => {
            const resultData = e.detail;
            if (resultData?.targetUrl && resultData.targetUrl !== `/problems/${id}`) return;

            const formattedMessage = resultData.message.replace(/\n/g, '  \n');
            setConsoleOutput(prev => prev + `\n\n---\n\n${formattedMessage}`);

            if (resultData.message.includes("[AI 코드 리뷰]") || resultData.message.includes("서버 오류")) {
                setIsSubmitting(false); 
            }
        };

        window.addEventListener('gradingResult', handleGradingResult);
        return () => window.removeEventListener('gradingResult', handleGradingResult);
    }, [id]);
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setConsoleOutput(`🚀 코드를 서버로 전송하고 있습니다...  \n- 언어: ${language}  \n- 문제 번호: ${id}  \n`);

        const memberId = localStorage.getItem('memberId');
        if (!memberId) {
            setConsoleOutput(prev => prev + `\n\n❌ [에러 발생] 로그인 정보(memberId)가 없습니다.`);
            setIsSubmitting(false);
            return;
        }

        const payload = {
            memberId: Number(memberId),
            problemId: Number(id),
            language: language,
            sourceCode: code,
            persona: persona
        };

        try {
            await api.post('/api/v1/submissions', payload);

            setConsoleOutput(prev => prev + `\n\n✅ [전송 완료] 대기열에 등록되었습니다.  \n⏳ 채점 및 AI 리뷰를 기다리는 중입니다...`);

        } catch (err) {
            console.error('제출 실패:', err);
            if (err.response && err.response.status === 429) {
                setConsoleOutput(prev => prev + `\n\n⚠️ [시스템 차단] 비정상적인 다중 제출이 감지되었습니다.  \n서버 안정을 위해 잠시 후 다시 시도해주세요.`);
            } else {
                setConsoleOutput(prev => prev + `\n\n❌ [에러 발생] 코드 제출에 실패했습니다. 서버 상태를 확인해주세요.`);
                alert('코드 제출에 실패했습니다.');
            }
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>문제 불러오는 중... ⏳</div>;
    if (error || !problem) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error || '문제가 없습니다.'}</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* 좌측 영역 (문제 지문) */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', borderRight: '1px solid #ddd', backgroundColor: '#fff' }}>
                <button onClick={() => navigate('/problems')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '16px', fontSize: '14px', padding: 0 }}>← 문제 목록으로</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{problem.title}</h1>
                    <button onClick={() => navigate('/posts/new', { state: { problemId: problem.id, problemTitle: problem.title } })} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🙋‍♂️ 이 문제 질문하기</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Lv.{problem.level}</span>
                    {problem.tags.map(tag => (
                        <span key={tag} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>{tag}</span>
                    ))}
                </div>
                <div style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.content}</ReactMarkdown>
                </div>
                {/* ... 입출력 예시 및 상세 지문은 기존과 동일 ... */}
                <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>입력</h2>
                    <div style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.inputDesc}</ReactMarkdown>
                    </div>
                </div>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>출력</h2>
                    <div style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.outputDesc}</ReactMarkdown>
                    </div>
                </div>
                <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>입출력 예시</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', width: '50%' }}>입력 (Input)</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', width: '50%' }}>출력 (Output)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problem.examples.map((ex) => (
                                <tr key={ex.id}>
                                    <td style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#fafafa', verticalAlign: 'top' }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ex.inputExample}</pre>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#fafafa', verticalAlign: 'top' }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ex.outputExample}</pre>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 우측 영역 (IDE + 콘솔) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
                <div style={{ padding: '12px 20px', backgroundColor: '#2d2d2d', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: '#3c3c3c', color: '#fff', border: '1px solid #555', outline: 'none', cursor: 'pointer' }}>
                        <option value="java">Java (17)</option>
                        <option value="python">Python (3.9)</option>
                        <option value="javascript">JavaScript (Node.js)</option>
                    </select>
                    <select value={persona} onChange={(e) => setPersona(e.target.value)} style={{ padding: '6px 12px', marginLeft: '10px', borderRadius: '4px', backgroundColor: '#3c3c3c', color: '#fff', border: '1px solid #555' }}>
                        <option value="10년 차 시니어 알고리즘 멘토">👨‍🏫 시니어 멘토 (친절함)</option>
                        <option value="리눅스 토발즈">🐧 리눅스 토발즈 (매우 직설적이고 까칠함)</option>
                        <option value="조선시대 훈장님">📜 조선시대 훈장님 (사극 말투)</option>
                        <option value="해커톤 밤샘 대학생">💻 밤샘 대학생 (피곤함)</option>
                    </select>
                    <span style={{ fontSize: '13px', color: '#888' }}>Monaco Editor</span>
                </div>

                <div style={{ flex: 0.6, overflow: 'hidden' }}>
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{ fontSize: 16, minimap: { enabled: false }, scrollBeyondLastLine: false, fontFamily: 'D2Coding, Consolas, monospace' }}
                    />
                </div>

                {/* 하단 콘솔창 영역 */}
                <div style={{ flex: 0.4, display: 'flex', flexDirection: 'column', borderTop: '2px solid #000', backgroundColor: '#000' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', fontSize: '13px', fontWeight: 'bold', color: '#bbb' }}>
                        🖥️ 실행 콘솔 (Console)
                    </div>
                    <div className="custom-console" style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', fontFamily: 'D2Coding, Consolas, monospace', fontSize: '14px', color: '#10b981', lineHeight: '1.6' }}>
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({node, inline, className, children, ...props}) {
                                    return (
                                        <code style={{ fontFamily: '"D2Coding", "Consolas", "Monaco", "Courier New", monospace', backgroundColor: inline ? '#2d2d2d' : 'transparent', padding: inline ? '2px 6px' : '0', borderRadius: '4px', fontSize: '14px', color: inline ? '#e2e8f0' : 'inherit' }} {...props}>
                                            {children}
                                        </code>
                                    )
                                },
                                pre({node, children, ...props}) {
                                    return (
                                        <pre style={{ backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px', overflowX: 'auto', marginTop: '12px', marginBottom: '12px', border: '1px solid #333' }} {...props}>
                                            {children}
                                        </pre>
                                    )
                                }
                            }}
                        >
                            {consoleOutput}
                        </ReactMarkdown>
                    </div>
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid #444', backgroundColor: '#2d2d2d', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 24px', backgroundColor: isSubmitting ? '#555' : '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}>
                        {isSubmitting ? '제출 중... ⏳' : '제출하기 🚀'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;