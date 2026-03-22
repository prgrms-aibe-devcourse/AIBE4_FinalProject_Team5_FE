import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from '../features/auth/authStore';

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const eventSourceRef = useRef(null);

  const accessToken = localStorage.getItem("accessToken");
  const isLogin = !!accessToken;
  const memberId = localStorage.getItem("memberId");

  // 안 읽은 알림만 필터링하여 저장
  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const unreadCount = unreadNotifications.length;

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    logout();
    navigate("/");
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const fetchNotifications = async () => {
    if (!accessToken || !memberId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/notifications/${memberId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("알림 목록 조회 실패");
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("알림 목록 조회 중 오류:", error);
    }
  };

  const handleNotificationClick = async (id) => {
    if (!memberId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/notifications/${memberId}/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("알림 읽음 처리 실패");
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error("알림 읽음 처리 중 오류:", error);
    }
  };

  // 알림 전체 읽음 처리 함수 추가
  const handleMarkAllAsRead = async () => {
    if (!memberId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/notifications/${memberId}/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("알림 전체 읽음 처리 실패");
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (error) {
      console.error("알림 전체 읽음 처리 중 오류:", error);
    }
  };

  const formatNotificationText = (item) => {
    const text = item.message;
    if (!text) return "새 알림이 도착했습니다.";

    if (text.startsWith("[채점 결과]")) {
      const lines = text.split('\n');
      const problemNum = lines[1]?.replace("문제 번호: ", "").trim() || "";
      const result = lines[2]?.replace("결과: ", "").trim() || "";
      return `📝 [채점 완료] ${problemNum}번 문제 : ${result}`;
    }
    
    if (text.startsWith("[AI 코드 리뷰]")) {
      const problemId = item.targetUrl ? item.targetUrl.split('/').pop() : '';
      return `🤖 [AI 리뷰] ${problemId}번 문제 피드백 도착!`;
    }

    return text.length > 30 ? text.substring(0, 30) + "..." : text;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isLogin || !memberId) return;

    fetchNotifications();

    const eventSource = new EventSource(
      `http://localhost:8080/api/v1/notifications/subscribe/${memberId}`,
      {
        withCredentials: true,
      }
    );

    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
        window.dispatchEvent(new CustomEvent('gradingResult', { detail: newNotification }));
<<<<<<< HEAD
=======

>>>>>>> ccb1abef654d8a45b2e41f26abc100bc7aec5c1f
      } catch (error) {
        console.error("실시간 알림 파싱 오류:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE 연결 오류:", error);
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [isLogin, accessToken, memberId]);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="logo">
          Coditor
        </NavLink>

        <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          메인페이지
        </NavLink>

        <NavLink to="/problems" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          문제
        </NavLink>

        <NavLink to="/community" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          커뮤니티
        </NavLink>

        <NavLink
          to="/ranking"
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          랭킹
        </NavLink>
      </div>

      <div className="nav-right">
        {isLogin && (
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="notification-button"
              onClick={toggleNotifications}
              aria-label="알림"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                {/* 드롭다운 헤더에 '모두 읽음' 버튼 추가 */}
                <div className="notification-dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>알림</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      style={{ background: 'none', border: 'none', color: '#0d6efd', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                    >
                      모두 읽음
                    </button>
                  )}
                </div>

                {/* 읽은 알림은 무시하고, 안 읽은 알림(unreadNotifications)만 렌더링 */}
                {unreadCount > 0 ? (
                  unreadNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="notification-item unread"
                      onClick={() => handleNotificationClick(item.id)}
                    >
                      {formatNotificationText(item)}
                    </button>
                  ))
                ) : (
                  <div className="notification-empty">새 알림이 없습니다</div>
                )}
              </div>
            )}
          </div>
        )}

        {isLogin ? (
          <>
            <NavLink to="/userpage" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              마이페이지
            </NavLink>

            <button type="button" className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <NavLink to="/login" className="login-btn">
            로그인
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;