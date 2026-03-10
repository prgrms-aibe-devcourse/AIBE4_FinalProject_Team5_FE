import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "새로운 댓글이 달렸습니다", isRead: false },
    { id: 2, message: "문제 풀이 결과가 업데이트되었습니다", isRead: false },
    { id: 3, message: "공지사항이 등록되었습니다", isRead: true },
  ]);

  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const isLogin = !!localStorage.getItem("accessToken");

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
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
    const interval = setInterval(() => {
      const sampleMessages = [
        "새로운 답변이 등록되었습니다",
        "내가 작성한 글에 좋아요가 추가되었습니다",
        "오늘의 추천 문제가 도착했습니다",
        "운영자 공지가 새로 올라왔습니다",
      ];

      const randomMessage =
        sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

      const newNotification = {
        id: Date.now(),
        message: randomMessage,
        isRead: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">알림</div>

                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`notification-item${item.isRead ? "" : " unread"}`}
                      onClick={() => handleNotificationClick(item.id)}
                    >
                      {item.message}
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
            <NavLink
              to="/userpage"
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
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