import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import api from '../api/axiosConfig';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const Modal = ({ type, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nickname: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const config = {
        resetPassword: {
            title: '비밀번호 재설정',
            label: '가입 시 사용한 이메일',
            placeholder: 'example@email.com',
            buttonText: '비밀번호 재설정',
            successText: '임시 비밀번호를 이메일로 전송했습니다.',
        },
        signup: {
            title: '회원가입',
            label: '이메일',
            placeholder: 'example@email.com',
            buttonText: '가입하기',
            successText: '가입이 완료되었습니다! 로그인해주세요.',
        },
    };

    const { title, label, placeholder, buttonText, successText } = config[type];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (type === 'signup') {
                await api.post('/auth/signup', {
                    email: formData.email,
                    password: formData.password,
                    nickname: formData.nickname
                });
            } else {
                await api.post('/auth/reset-password', { email: formData.email });
            }
            setSubmitted(true);
        } catch (error) {
            console.error('Auth error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || '요청 중 오류가 발생했습니다.';
            alert(`${title} 실패: ${errorMsg}`);
        }
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
                <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
                <h2 style={modalStyles.title}>{title}</h2>

                {submitted ? (
                    <div style={modalStyles.success}>
                        <p>✅ {successText}</p>
                        <button style={modalStyles.doneBtn} onClick={onClose}>닫기</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={modalStyles.form}>
                        <label style={modalStyles.label}>{label}</label>
                        <input
                            style={modalStyles.input}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={placeholder}
                            required
                        />
                        {type === 'signup' && (
                            <>
                                <label style={modalStyles.label}>비밀번호</label>
                                <input
                                    style={modalStyles.input}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                />
                                <label style={modalStyles.label}>닉네임</label>
                                <input
                                    style={modalStyles.input}
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    placeholder="닉네임을 입력하세요"
                                    required
                                />
                            </>
                        )}
                        <button style={modalStyles.submitBtn} type="submit">{buttonText}</button>
                    </form>
                )}
            </div>
        </div>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const nickname = searchParams.get('nickname');
        const role = searchParams.get('role');
        const memberId = searchParams.get('memberId');

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (nickname) localStorage.setItem('nickname', nickname);
            if (memberId) localStorage.setItem('memberId', memberId);

            login({
                nickname: nickname,
                role: role || 'ROLE_USER',
                memberId: Number(memberId)
            });
            navigate('/UserPage');
        }
    }, [location, navigate, login]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/auth/login', form);
            const data = response.data;

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('nickname', data.nickname);
            if (data.memberId) localStorage.setItem('memberId', data.memberId);

            login({
                email: form.email,
                nickname: data.nickname,
                role: data.role,
                memberId: data.memberId
            });

            navigate('/UserPage');
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
        }
    };

    const handleSocialLogin = (provider) => {
        const providerId = provider.toLowerCase();
        window.location.href = `${BASE_URL}/oauth2/authorization/${providerId}`;
    };

    return (
        <div className="container" style={styles.wrapper}>
            <div className="card" style={styles.card}>
                <h1 style={styles.title}>Coditor System</h1>
                <h2 style={styles.subtitle}>로그인</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>이메일</label>
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="이메일을 입력하세요"
                        required
                    />

                    <label style={styles.label}>비밀번호</label>
                    <div style={styles.passwordWrapper}>
                        <input
                            style={{ ...styles.input, marginBottom: 0, paddingRight: '44px' }}
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                        <button
                            type="button"
                            style={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <button style={styles.button} type="submit">로그인</button>
                </form>

                <div style={styles.linkRow}>
                    <button style={styles.linkButton} onClick={() => setModal('resetPassword')}>비밀번호 재설정</button>
                    <span style={styles.divider}>|</span>
                    <button style={styles.linkButton} onClick={() => setModal('signup')}>회원가입</button>
                </div>

                <div style={styles.socialSection}>
                    <div style={styles.socialDividerRow}>
                        <hr style={styles.hr} />
                        <span style={styles.socialDividerText}>또는</span>
                        <hr style={styles.hr} />
                    </div>
                    <button style={{ ...styles.socialButton, ...styles.googleButton }}
                            onClick={() => handleSocialLogin('Google')}>
                        <svg style={styles.socialIcon} viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google로 로그인
                    </button>
                    <button style={{ ...styles.socialButton, ...styles.githubButton }}
                            onClick={() => handleSocialLogin('GitHub')}>
                        <svg style={{ ...styles.socialIcon, fill: '#fff' }} viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.285-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                        GitHub로 로그인
                    </button>
                </div>
            </div>

            {modal && <Modal type={modal} onClose={() => setModal(null)} />}
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
    },
    title: {
        textAlign: 'center',
        color: 'var(--primary-color)',
        marginBottom: '8px',
    },
    subtitle: {
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        fontWeight: 'normal',
        marginBottom: '28px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        fontSize: '1rem',
        marginBottom: '8px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    passwordWrapper: {
        position: 'relative',
        marginBottom: '8px',
    },
    eyeBtn: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0',
    },
    button: {
        marginTop: '8px',
        padding: '12px',
        backgroundColor: 'var(--color-accent)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    linkRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '16px',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        padding: '0',
        textDecoration: 'underline',
    },
    divider: {
        color: 'var(--border-color)',
        fontSize: '0.85rem',
    },
    socialSection: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    socialDividerRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    hr: {
        flex: 1,
        border: 'none',
        borderTop: '1px solid var(--border-color)',
    },
    socialDividerText: {
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
    },
    socialButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '11px',
        borderRadius: '6px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        border: '1px solid var(--border-color)',
        fontWeight: '500',
    },
    googleButton: {
        backgroundColor: '#fff',
        color: '#333',
    },
    githubButton: {
        backgroundColor: '#24292e',
        color: '#fff',
        border: 'none',
    },
    socialIcon: {
        width: '18px',
        height: '18px',
    },
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '380px',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    },
    closeBtn: {
        position: 'absolute',
        top: '14px',
        right: '16px',
        background: 'none',
        border: 'none',
        fontSize: '1rem',
        cursor: 'pointer',
        color: '#64748b',
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#1e293b',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '0.9rem',
        color: '#64748b',
    },
    input: {
        padding: '10px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '1rem',
        outline: 'none',
        marginBottom: '8px',
    },
    submitBtn: {
        marginTop: '8px',
        padding: '12px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    success: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 0',
        color: '#1e293b',
        fontSize: '0.95rem',
    },
    doneBtn: {
        padding: '10px 24px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
};

export default LoginPage;