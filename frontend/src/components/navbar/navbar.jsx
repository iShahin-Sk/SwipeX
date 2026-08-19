import "./navbar.css";
import {
  FaUserCircle,
  FaMoon,
  FaSun,
  FaBell,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../../services/api";

function Navbar() {
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const role = localStorage.getItem("role");

  // ==========================
  // Theme
  // ==========================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // ==========================
  // Notifications
  // ==========================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // ==========================
  // Theme Effect
  // ==========================

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // =====================================================
  // JOB SEEKER NOTIFICATIONS
  // Recruiters do NOT fetch notifications
  // =====================================================

  const fetchNotifications = async () => {
    if (role !== "job_seeker") {
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      setNotifications([]);
      return;
    }

    setNotificationLoading(true);

    try {
      const response = await API.get("notifications/");

      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.log(
        "Notification request failed:",
        error.response?.data || error.message
      );

      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // ==========================
  // Initial Notification Fetch
  // ==========================

  useEffect(() => {
    if (role === "job_seeker") {
      fetchNotifications();
    }
  }, [role]);

  // ==========================
  // Refresh Notifications
  // ==========================

  useEffect(() => {
    if (role !== "job_seeker") {
      return;
    }

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [role]);

  // ==========================
  // Close Notification Dropdown
  // ==========================

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================
  // Unread Count
  // ==========================

  const unreadCount = notifications.filter(
    (notification) =>
      notification.is_read === false ||
      notification.is_read === undefined
  ).length;

  // ==========================
  // Get Job ID
  // ==========================

  const getJobId = (notification) => {
    if (notification.job_id) {
      return notification.job_id;
    }

    if (
      typeof notification.job === "number" ||
      typeof notification.job === "string"
    ) {
      return notification.job;
    }

    if (
      notification.job &&
      typeof notification.job === "object" &&
      notification.job.id
    ) {
      return notification.job.id;
    }

    if (
      notification.data &&
      notification.data.job_id
    ) {
      return notification.data.job_id;
    }

    if (
      notification.metadata &&
      notification.metadata.job_id
    ) {
      return notification.metadata.job_id;
    }

    return null;
  };

  // ==========================
  // Notification Click
  // ==========================

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);

    const jobId = getJobId(notification);

    if (jobId) {
      navigate(`/jobseeker/jobs?job=${jobId}`);
      return;
    }

    if (notification.url) {
      navigate(notification.url);
      return;
    }

    if (notification.link) {
      navigate(notification.link);
      return;
    }

    if (notification.path) {
      navigate(notification.path);
      return;
    }

    const type = String(
      notification.notification_type ||
        notification.type ||
        notification.title ||
        ""
    ).toLowerCase();

    if (type.includes("startup")) {
      navigate("/jobseeker/companies");
      return;
    }

    if (
      type.includes("recommend") ||
      type.includes("match") ||
      type.includes("opportunity")
    ) {
      navigate("/jobseeker/recommended-jobs");
      return;
    }

    navigate("/jobseeker/jobs");
  };

  // ==========================
  // Clear Notifications
  // ==========================

  const clearNotifications = () => {
    setNotifications([]);
  };

  // ==========================
  // Notification Title
  // ==========================

  const getNotificationTitle = (notification) => {
    return (
      notification.title ||
      notification.notification_type ||
      notification.type ||
      "New Opportunity"
    );
  };

  // ==========================
  // Notification Message
  // ==========================

  const getNotificationMessage = (notification) => {
    if (notification.message) {
      return notification.message;
    }

    if (notification.description) {
      return notification.description;
    }

    if (notification.job_title) {
      return `A new opportunity is available: ${notification.job_title}`;
    }

    if (
      notification.job &&
      notification.job.title
    ) {
      return `A new opportunity is available: ${notification.job.title}`;
    }

    return "You have a new career opportunity.";
  };

  // ==========================
  // Notification Icon
  // ==========================

  const getNotificationIcon = (notification) => {
    const type = String(
      notification.notification_type ||
        notification.type ||
        notification.title ||
        ""
    ).toLowerCase();

    if (type.includes("startup")) {
      return "🚀";
    }

    if (type.includes("high")) {
      return "⭐";
    }

    if (type.includes("competition")) {
      return "🏆";
    }

    if (type.includes("recommend")) {
      return "🎯";
    }

    if (type.includes("job")) {
      return "💼";
    }

    if (type.includes("match")) {
      return "🎯";
    }

    return "🔔";
  };

  // ==========================
  // Logout
  // ==========================

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    setNotifications([]);

    navigate("/login");
  };

  return (
    <div className="navbar">

      {/* ==================================================
          JOB SEEKER SEARCH
          Recruiter does NOT see this
      ================================================== */}

      {role === "job_seeker" && (
        <input
          type="text"
          placeholder="Search jobs..."
        />
      )}

      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <div
        className={`right ${
          role === "recruiter"
            ? "recruiter-right"
            : ""
        }`}
      >

        {/* ==================================================
            JOB SEEKER NOTIFICATIONS ONLY
        ================================================== */}

        {role === "job_seeker" && (
          <div
            className="notification-wrapper"
            ref={notificationRef}
          >

            <button
              className="notification-btn"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              aria-label="Notifications"
            >
              <FaBell />

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}

            {showNotifications && (
              <div className="notification-panel">

                <div className="notification-header">

                  <h3>
                    Notifications
                  </h3>

                  <div className="notification-header-actions">

                    {notifications.length > 0 && (
                      <button
                        className="clear-notifications-btn"
                        onClick={clearNotifications}
                      >
                        Clear
                      </button>
                    )}

                    <button
                      className="close-notification-btn"
                      onClick={() =>
                        setShowNotifications(false)
                      }
                    >
                      <FaTimes />
                    </button>

                  </div>

                </div>

                {notificationLoading ? (

                  <div className="notification-empty">
                    Loading notifications...
                  </div>

                ) : notifications.length === 0 ? (

                  <div className="notification-empty">

                    <FaBell className="empty-bell" />

                    <p>
                      No notifications yet
                    </p>

                    <span>
                      We'll notify you when
                      relevant opportunities
                      appear.
                    </span>

                  </div>

                ) : (

                  <div className="notification-list">

                    {notifications.map(
                      (notification, index) => {

                        const isUnread =
                          notification.is_read === false ||
                          notification.is_read === undefined;

                        return (
                          <div
                            key={
                              notification.id ||
                              `${getJobId(
                                notification
                              )}-${index}`
                            }
                            className={`notification-item ${
                              isUnread
                                ? "unread"
                                : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                          >

                            <div className="notification-icon">
                              {getNotificationIcon(
                                notification
                              )}
                            </div>

                            <div className="notification-content">

                              <h4>
                                {getNotificationTitle(
                                  notification
                                )}
                              </h4>

                              <p>
                                {getNotificationMessage(
                                  notification
                                )}
                              </p>

                              {notification.company && (
                                <span className="notification-company">
                                  {notification.company}
                                </span>
                              )}

                              {notification
                                .job
                                ?.company
                                ?.name && (
                                <span className="notification-company">
                                  {
                                    notification
                                      .job
                                      .company
                                      .name
                                  }
                                </span>
                              )}

                              {notification.match_percentage !==
                                undefined && (
                                <span className="notification-match">
                                  {
                                    notification.match_percentage
                                  }
                                  % match
                                </span>
                              )}

                              {notification.created_at && (
                                <small>
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </small>
                              )}

                            </div>

                            {isUnread && (
                              <span className="unread-dot"></span>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </div>
            )}

          </div>
        )}

        {/* ==================================================
            THEME BUTTON
            Both roles
        ================================================== */}

        <button
          className="theme-btn"
          onClick={() =>
            setDarkMode(!darkMode)
          }
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <FaSun />
          ) : (
            <FaMoon />
          )}
        </button>

        {/* ==================================================
            PROFILE
            Both roles
        ================================================== */}

        <div
          className="profile"
          onClick={() => {
            if (role === "job_seeker") {
              navigate("/jobseeker/profile");
            } else if (role === "recruiter") {
              navigate("/recruiter/profile");
            }
          }}
        >
          <FaUserCircle size={28} />

          <span>
            {role === "recruiter"
              ? "Recruiter"
              : "Shahin"}
          </span>
        </div>

        {/* ==================================================
            LOGOUT
            Both roles
        ================================================== */}

        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <FaSignOutAlt />

          <span>Logout</span>
        </button>

      </div>

    </div>
  );
}

export default Navbar;