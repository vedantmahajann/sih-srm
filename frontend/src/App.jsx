import { useEffect, useState } from "react";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import Login from "./login";
import Courses from "./courses";
import MyLearning from "./MyLearning";
import Competencies from "./Competencies";
import KnowledgeHub from "./KnowledgeHub";
import Admin from "./Admin";
import Progress from "./Progress";
import LearningPath from "./LearningPath";

import "./App.css";


/* =========================================================
   ROOT APP
========================================================= */

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("capacity_connect_user");

      if (savedUser) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch (error) {
      console.error("Failed to restore user session:", error);
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);

    try {
      localStorage.setItem(
        "capacity_connect_user",
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error("Failed to save user session:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);

    try {
      localStorage.removeItem("capacity_connect_user");
    } catch (error) {
      console.error("Failed to clear user session:", error);
    }
  };

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}


/* =========================================================
   DASHBOARD SHELL
========================================================= */

function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");

  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [learningData, setLearningData] = useState([]);
  const [competencies, setCompetencies] = useState([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);


  /* -------------------------------------------------------
     LOAD DASHBOARD DATA
  ------------------------------------------------------- */

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          recommendationResponse,
          learningResponse,
          competencyResponse,
        ] = await Promise.all([
          fetch(
            `/api/recommendations/${user.user_id}`
          ),
          fetch(
            `/api/my-learning?user_id=${user.user_id}`
          ),
          fetch(
            `/api/competencies/${user.user_id}`
          ),
        ]);

        const recommendationData =
          await recommendationResponse.json();

        const learningResponseData =
          await learningResponse.json();

        const competencyResponseData =
          await competencyResponse.json();

        setRecommendations(
          Array.isArray(recommendationData)
            ? recommendationData
            : []
        );

        setLearningData(
          Array.isArray(learningResponseData)
            ? learningResponseData
            : []
        );

        setCompetencies(
          Array.isArray(competencyResponseData)
            ? competencyResponseData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    if (user?.user_id) {
      loadDashboardData();
    }
  }, [user]);


  /* -------------------------------------------------------
     DASHBOARD METRICS
  ------------------------------------------------------- */

  const coursesInProgress = learningData.filter(
    (course) =>
      Number(course.progress || 0) > 0 &&
      Number(course.progress || 0) < 100
  ).length;

  const completedCourses = learningData.filter(
    (course) => Number(course.progress || 0) >= 100
  ).length;


  const overallProgress =
    learningData.length > 0
      ? Math.round(
        learningData.reduce(
          (sum, course) =>
            sum + Number(course.progress || 0),
          0
        ) / learningData.length
      )
      : 0;


  const skillGaps = competencies.filter(
    (competency) => {
      const level = competency.level;

      return (
        level === "Beginner" ||
        level === "Not Assessed" ||
        Number(competency.score || 0) < 60
      );
    }
  );


  const assessedCompetencies = competencies.filter(
    (competency) =>
      competency.level &&
      competency.level !== "Not Assessed"
  );


  const averageCapability =
    assessedCompetencies.length > 0
      ? Math.round(
        assessedCompetencies.reduce(
          (sum, competency) =>
            sum + Number(competency.score || 0),
          0
        ) / assessedCompetencies.length
      )
      : 0;


  /* -------------------------------------------------------
     NAVIGATION HELPERS
  ------------------------------------------------------- */

  const navigateTo = (targetPage) => {
    setPage(targetPage);
  };


  const openCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setPage("courses");
  };


  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="dashboard-app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            C
          </div>

          <div>
            <h2>Capacity Connect</h2>
            <span>Organizational Capability Platform</span>
          </div>

        </div>


        <nav className="dashboard-nav">

          <NavButton
            icon={<LayoutDashboard size={17} />}
            label="Dashboard"
            active={page === "dashboard"}
            onClick={() => navigateTo("dashboard")}
          />


          <NavButton
            icon={<GraduationCap size={17} />}
            label="My Learning"
            active={page === "learning"}
            onClick={() => navigateTo("learning")}
          />


          <NavButton
            icon={<BookOpen size={17} />}
            label="Courses"
            active={page === "courses"}
            onClick={() => {
              setSelectedCourseId(null);
              navigateTo("courses");
            }}
          />


          <NavButton
            icon={<Brain size={17} />}
            label="Competencies"
            active={page === "competencies"}
            onClick={() => navigateTo("competencies")}
          />


          {user.role === "admin" && (
            <NavButton
              icon={<ShieldCheck size={17} />}
              label="Admin"
              active={page === "admin"}
              onClick={() => navigateTo("admin")}
            />
          )}


          <NavButton
            icon={<Library size={17} />}
            label="Knowledge Hub"
            active={page === "knowledge"}
            onClick={() => navigateTo("knowledge")}
          />


          <NavButton
            icon={<BarChart3 size={17} />}
            label="Progress"
            active={page === "progress"}
            onClick={() => navigateTo("progress")}
          />


          <NavButton
            icon={<Sparkles size={17} />}
            label="Learning Path"
            active={page === "learning-path"}
            onClick={() => navigateTo("learning-path")}
          />

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="dashboard-sidebar-bottom">

          <NavButton
            icon={<Settings size={17} />}
            label="Settings"
            active={false}
            onClick={() => { }}
          />


          <button
            className="dashboard-nav-item logout-button"
            onClick={onLogout}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>


          <div className="dashboard-user">

            <div className="dashboard-avatar large">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>

          </div>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-main">

        <div
          className="dashboard-page-transition"
          key={page}
        ></div>


        {/* =================================================
            DASHBOARD PAGE
        ================================================= */}

        {page === "dashboard" && (
          <DashboardHome
            user={user}
            recommendations={recommendations}
            learningData={learningData}
            competencies={competencies}
            skillGaps={skillGaps}
            coursesInProgress={coursesInProgress}
            completedCourses={completedCourses}
            overallProgress={overallProgress}
            averageCapability={averageCapability}
            dashboardLoading={dashboardLoading}
            onNavigate={navigateTo}
            onOpenCourse={openCourse}
          />
        )}


        {/* =================================================
            COURSES
        ================================================= */}

        {page === "courses" && (
          <Courses
            user={user}
            selectedCourseId={selectedCourseId}
          />
        )}


        {/* =================================================
            MY LEARNING
        ================================================= */}

        {page === "learning" && (
          <MyLearning
            user={user}
            onOpenCourse={(courseId) => {
              setSelectedCourseId(courseId);
              setPage("courses");
            }}
          />
        )}


        {/* =================================================
            COMPETENCIES
        ================================================= */}

        {page === "competencies" && (
          <Competencies user={user} />
        )}


        {/* =================================================
            KNOWLEDGE HUB
        ================================================= */}

        {page === "knowledge" && (
          <KnowledgeHub user={user} />
        )}


        {/* =================================================
            PROGRESS
        ================================================= */}

        {page === "progress" && (
          <Progress user={user} />
        )}


        {/* =================================================
            LEARNING PATH
        ================================================= */}

        {page === "learning-path" && (
          <LearningPath
            user={user}
            onOpenCourse={(courseId) => {
              setSelectedCourseId(courseId);
              setPage("courses");
            }}
          />
        )}


        {/* =================================================
            ADMIN
        ================================================= */}

        {page === "admin" && user.role === "admin" && (
          <Admin user={user} />
        )}

      </main>

    </div>
  );
}


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function NavButton({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      className={
        active
          ? "dashboard-nav-item active"
          : "dashboard-nav-item"
      }
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


/* =========================================================
   DASHBOARD HOME
========================================================= */

function DashboardHome({
  user,
  recommendations,
  learningData,
  competencies,
  skillGaps,
  coursesInProgress,
  completedCourses,
  overallProgress,
  averageCapability,
  dashboardLoading,
  onNavigate,
  onOpenCourse,
}) {

  const [showNotifications, setShowNotifications] =
    useState(false);

  return (
    <div className="dashboard-home">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>
          <h1>
            Good evening,{" "}
            {user.name?.split(" ")[0] || "there"} 👋
          </h1>

          <p>
            Continue building your capabilities today.
          </p>
        </div>


        <div className="dashboard-actions">

          <button
            className="dashboard-icon-button dashboard-notification"
            title="Notifications"
            aria-label="Open notifications"
            aria-expanded={showNotifications}
            onClick={() =>
              setShowNotifications(
                (current) => !current
              )
            }
          >
            <Sparkles size={17} />
            <span></span>
          </button>

          {showNotifications && (
            <NotificationPanel
              onClose={() =>
                setShowNotifications(false)
              }
              onOpenProgress={() => {
                setShowNotifications(false);
                onNavigate("progress");
              }}
              onOpenLearningPath={() => {
                setShowNotifications(false);
                onNavigate("learning-path");
              }}
            />
          )}


          <div className="dashboard-avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

        </div>

      </div>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="dashboard-hero-eyebrow">
            <Sparkles size={14} />
            PERSONALIZED CAPABILITY INSIGHT
          </div>


          <h1>
            Welcome back,{" "}
            {user.name?.split(" ")[0] || "there"}.
            <span> Keep building.</span>
          </h1>


          <p>
            Your learning activity is being transformed into
            measurable organizational capability.
          </p>


          <div className="dashboard-hero-actions">

            <button
              className="hero-primary-button"
              onClick={() =>
                onNavigate("learning-path")
              }
            >
              View learning path
              <ArrowRight size={15} />
            </button>


            <button
              className="hero-secondary-button"
              onClick={() =>
                onNavigate("competencies")
              }
            >
              Explore competencies
            </button>

          </div>

        </div>


        <div className="dashboard-hero-visual">

          <div className="hero-ring ring-a"></div>
          <div className="hero-ring ring-b"></div>


          <div className="hero-center-card">

            <div className="hero-center-icon">
              <Target size={23} />
            </div>

            <span>CAPABILITY</span>

            <strong>
              {averageCapability >= 75
                ? "Strong"
                : averageCapability >= 50
                  ? "Growing"
                  : "Developing"}
            </strong>


            <div className="hero-mini-progress">

              <div
                style={{
                  width: `${Math.min(
                    averageCapability,
                    100
                  )}%`,
                }}
              ></div>

            </div>

          </div>


          <div className="hero-floating-card hero-card-top">

            <TrendingUp size={15} />

            <span>
              Learning momentum
            </span>

            <strong>
              {overallProgress > 0
                ? "Active"
                : "Ready"}
            </strong>

          </div>


          <div className="hero-floating-card hero-card-bottom">

            <Target size={15} />

            <span>
              Skill focus
            </span>

            <strong>
              {skillGaps.length} areas
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          KPI STATS
      ================================================= */}

      <section className="dashboard-stats">

        <DashboardStat
          icon={<BookOpen size={20} />}
          title="Courses in progress"
          value={coursesInProgress}
          type="blue"
        />


        <DashboardStat
          icon={<CheckCircle2 size={20} />}
          title="Completed courses"
          value={completedCourses}
          type="green"
        />


        <DashboardStat
          icon={<Target size={20} />}
          title="Skill gaps"
          value={skillGaps.length}
          type="orange"
        />


        <DashboardStat
          icon={<TrendingUp size={20} />}
          title="Overall progress"
          value={`${overallProgress}%`}
          type="purple"
        />

      </section>


      {/* =================================================
          MAIN TWO COLUMN
      ================================================= */}

      <div className="dashboard-two-column">

        {/* LEARNING PROGRESS */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>
              <h2>
                Learning progress
              </h2>

              <p>
                Your active learning journey
              </p>
            </div>


            <button
              className="dashboard-text-button"
              onClick={() =>
                onNavigate("progress")
              }
            >
              View progress
              <ChevronRight size={14} />
            </button>

          </div>


          {dashboardLoading ? (
            <DashboardLoading />
          ) : learningData.length === 0 ? (

            <EmptyDashboard
              icon={<BookOpen size={23} />}
              title="Your learning journey starts here"
              text="Enroll in a course to start building your capabilities."
              buttonText="Explore courses"
              onClick={() =>
                onNavigate("courses")
              }
            />

          ) : (

            <div>

              {learningData
                .slice(0, 4)
                .map((course, index) => {

                  const progress = Math.min(
                    Math.max(
                      Number(course.progress || 0),
                      0
                    ),
                    100
                  );

                  return (
                    <div
                      className="dashboard-course"
                      key={
                        course.id ||
                        index
                      }
                    >

                      <div className="dashboard-course-info">

                        <div className="dashboard-course-icon">

                          {course.title
                            ? course.title
                              .substring(0, 2)
                              .toUpperCase()
                            : "CC"}

                        </div>


                        <div>

                          <strong>
                            {course.title}
                          </strong>

                          <span>
                            {progress >= 100
                              ? "Course completed"
                              : "Learning in progress"}
                          </span>

                        </div>

                      </div>


                      <div className="dashboard-progress-container">

                        <strong>
                          {progress}%
                        </strong>

                        <div className="dashboard-progress-bar">

                          <div
                            style={{
                              width: `${progress}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>
          )}

        </section>


        {/* COMPETENCY SNAPSHOT */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Competency snapshot
              </h2>

              <p>
                Your current capability levels
              </p>

            </div>


            <button
              className="dashboard-text-button"
              onClick={() =>
                onNavigate("competencies")
              }
            >
              View all
              <ChevronRight size={14} />
            </button>

          </div>


          {dashboardLoading ? (
            <DashboardLoading />
          ) : competencies.length === 0 ? (

            <EmptyDashboard
              icon={<Brain size={23} />}
              title="No competency data yet"
              text="Complete an assessment to build your capability profile."
              buttonText="View competencies"
              onClick={() =>
                onNavigate("competencies")
              }
            />

          ) : (

            <div>

              {competencies
                .slice(0, 4)
                .map((competency, index) => {

                  const score = Math.min(
                    Math.max(
                      Number(
                        competency.score || 0
                      ),
                      0
                    ),
                    100
                  );

                  return (
                    <div
                      className="dashboard-skill"
                      key={
                        competency.id ||
                        competency.name ||
                        index
                      }
                    >

                      <div className="dashboard-skill-top">

                        <div>

                          <strong>
                            {competency.name}
                          </strong>

                          <span>
                            {competency.level ||
                              "Not Assessed"}
                          </span>

                        </div>

                        <strong>
                          {score}%
                        </strong>

                      </div>


                      <div className="dashboard-skill-bar">

                        <div
                          className={
                            score < 60
                              ? "warning"
                              : ""
                          }
                          style={{
                            width: `${score}%`,
                          }}
                        ></div>

                      </div>

                    </div>
                  );
                })}


              <button
                className="dashboard-outline-button"
                onClick={() =>
                  onNavigate("competencies")
                }
              >
                Analyze competency gaps
                <ArrowRight size={13} />
              </button>

            </div>
          )}

        </section>

      </div>


      {/* =================================================
          RECOMMENDATIONS
      ================================================= */}

      <section className="dashboard-card">

        <div className="dashboard-card-header">

          <div>

            <div className="dashboard-recommendation-label">
              <Sparkles size={13} />
              INTELLIGENT RECOMMENDATIONS
            </div>

            <h2>
              Recommended for you
            </h2>

            <p>
              Learning selected based on your competency gaps
            </p>

          </div>


          <button
            className="dashboard-text-button"
            onClick={() =>
              onNavigate("learning-path")
            }
          >
            View learning path
            <ChevronRight size={14} />
          </button>

        </div>


        <div className="recommendation-grid">

          {recommendations.length === 0 ? (

            <div className="no-recommendations">

              <div className="no-recommendations-icon">
                <Sparkles size={22} />
              </div>

              <strong>
                Your personalized path is being prepared
              </strong>

              <span>
                Complete an assessment to unlock learning
                recommendations tailored to your capability gaps.
              </span>

              <button
                className="recommendation-empty-button"
                onClick={() =>
                  onNavigate("competencies")
                }
              >
                Explore competencies
                <ArrowRight size={13} />
              </button>

            </div>

          ) : (

            recommendations
              .slice(0, 3)
              .map((recommendation, index) => (

                <Recommendation
                  key={
                    `${recommendation.course_id}-${index}`
                  }

                  title={
                    recommendation.course_title
                  }

                  category={
                    recommendation.competency
                  }

                  reason={
                    recommendation.reason
                  }

                  priority={
                    index === 0
                      ? "High priority"
                      : index === 1
                        ? "Recommended"
                        : "Explore"
                  }

                  index={index}

                  onStartLearning={() =>
                    onOpenCourse(
                      recommendation.course_id
                    )
                  }
                />

              ))

          )}

        </div>

      </section>


      {/* =================================================
          CAPABILITY FOOTER INSIGHT
      ================================================= */}

      <section className="dashboard-insight-strip">

        <div className="insight-strip-icon">
          <Zap size={18} />
        </div>


        <div>

          <span>
            CAPACITY CONNECT INSIGHT
          </span>

          <strong>
            Learning becomes capability when progress is measurable.
          </strong>

        </div>


        <button
          onClick={() =>
            onNavigate("progress")
          }
        >
          Explore impact
          <ArrowRight size={14} />
        </button>

      </section>

    </div>
  );
}


/* =========================================================
   NOTIFICATION PANEL
========================================================= */

function NotificationPanel({
  onClose,
  onOpenProgress,
  onOpenLearningPath,
}) {

  const panelStyle = {
    position: "fixed",
    top: "82px",
    right: "28px",
    width: "380px",
    maxWidth: "calc(100vw - 32px)",
    padding: "20px",
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,248,255,0.99))",
    border:
      "1px solid rgba(83,76,160,0.12)",
    boxShadow:
      "0 30px 80px rgba(26,29,55,0.22), 0 8px 28px rgba(26,29,55,0.10)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    zIndex: 99999,
    animation:
      "capacityNotificationIn 180ms ease-out",
  };


  const itemBaseStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    width: "100%",
    padding: "15px 8px",
    borderRadius: "14px",
    transition:
      "background 160ms ease, transform 160ms ease",
  };


  const dotStyle = {
    width: "10px",
    height: "10px",
    minWidth: "10px",
    marginTop: "5px",
    borderRadius: "50%",
  };


  return (
    <>
      <style>
        {`
          @keyframes capacityNotificationIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .capacity-notification-action:hover {
            background: rgba(99,91,219,0.055) !important;
            transform: translateX(2px);
          }

          .capacity-notification-footer:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(99,91,219,0.15);
          }

          @media (max-width: 600px) {
            .capacity-notification-panel {
              left: 16px !important;
              right: 16px !important;
              top: 72px !important;
              width: auto !important;
              max-width: none !important;
            }
          }
        `}
      </style>


      <div
        className="capacity-notification-panel"
        role="dialog"
        aria-label="Notifications"
        style={panelStyle}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            paddingBottom: "16px",
            borderBottom:
              "1px solid rgba(35,38,62,0.08)",
          }}
        >

          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >

              <div
                style={{
                  width: "30px",
                  height: "30px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg,#eeeaff,#e5e2ff)",
                  color: "#635bdb",
                }}
              >
                <Sparkles size={15} />
              </div>

              <strong
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#191b31",
                }}
              >
                Notifications
              </strong>

            </div>


            <span
              style={{
                display: "block",
                marginTop: "7px",
                marginLeft: "38px",
                fontSize: "12px",
                color: "#85889c",
              }}
            >
              Your latest capability updates
            </span>

          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              borderRadius: "10px",
              background: "#f2f3f8",
              color: "#6f7288",
              fontSize: "20px",
              lineHeight: 1,
              cursor: "pointer",
              transition: "0.2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                "#e8e9f1";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "#f2f3f8";
            }}
          >
            ×
          </button>

        </div>


        {/* NOTIFICATION 1 */}

        <button
          type="button"
          className="capacity-notification-action"
          onClick={onOpenLearningPath}
          style={{
            ...itemBaseStyle,
            marginTop: "10px",
            border: "none",
            background: "transparent",
            textAlign: "left",
            cursor: "pointer",
          }}
        >

          <div
            style={{
              ...dotStyle,
              background: "#31b978",
              boxShadow:
                "0 0 0 5px rgba(49,185,120,0.10)",
            }}
          ></div>

          <div>

            <strong
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 800,
                color: "#202238",
              }}
            >
              Learning path updated
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "12px",
                lineHeight: 1.55,
                color: "#7c7f95",
              }}
            >
              Your personalized recommendations are ready.
            </span>

          </div>

        </button>


        {/* NOTIFICATION 2 */}

        <button
          type="button"
          className="capacity-notification-action"
          onClick={() => { }}
          style={{
            ...itemBaseStyle,
            border: "none",
            background: "transparent",
            textAlign: "left",
            cursor: "default",
          }}
        >

          <div
            style={{
              ...dotStyle,
              background: "#635bdb",
              boxShadow:
                "0 0 0 5px rgba(99,91,219,0.10)",
            }}
          ></div>

          <div>

            <strong
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 800,
                color: "#202238",
              }}
            >
              Capability insight available
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "12px",
                lineHeight: 1.55,
                color: "#7c7f95",
              }}
            >
              Complete more assessments to improve your capability score.
            </span>

          </div>

        </button>


        {/* NOTIFICATION 3 */}

        <div
          style={{
            ...itemBaseStyle,
          }}
        >

          <div
            style={{
              ...dotStyle,
              background: "#ef9b3b",
              boxShadow:
                "0 0 0 5px rgba(239,155,59,0.10)",
            }}
          ></div>

          <div>

            <strong
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 800,
                color: "#202238",
              }}
            >
              Keep building momentum
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "12px",
                lineHeight: 1.55,
                color: "#7c7f95",
              }}
            >
              You have learning activity waiting for your attention.
            </span>

          </div>

        </div>


        {/* FOOTER */}

        <button
          type="button"
          className="capacity-notification-footer"
          onClick={onOpenProgress}
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "12px 15px",
            border: "none",
            borderRadius: "13px",
            background:
              "linear-gradient(135deg,#f0efff,#e8e5ff)",
            color: "#635bdb",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            transition:
              "transform 160ms ease, box-shadow 160ms ease",
          }}
        >
          View learning activity
          <span
            style={{
              marginLeft: "6px",
              fontSize: "14px",
            }}
          >
            →
          </span>
        </button>

      </div>
    </>
  );
}


/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  icon,
  title,
  value,
  type,
}) {

  const displayValue =
    typeof value === "string" &&
      value.endsWith("%")
      ? value
      : value;

  return (
    <div className="dashboard-stat-card">

      <div
        className={`dashboard-stat-icon ${type}`}
      >
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong className="stat-number">
          {displayValue}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   RECOMMENDATION CARD
========================================================= */

function Recommendation({
  title,
  category,
  reason,
  priority,
  index,
  onStartLearning,
}) {

  return (
    <div
      className="recommendation-card"
      style={{
        animationDelay:
          `${index * 120}ms`,
      }}
    >

      <div className="recommendation-banner">

        <div className="recommendation-glow"></div>

        <div className="recommendation-symbol">
          ✦
        </div>

        <span className="recommendation-priority">
          {priority}
        </span>

      </div>


      <div className="recommendation-content">

        <div className="recommendation-category">
          {category ||
            "Capability development"}
        </div>


        <h3>
          {title}
        </h3>


        <p className="recommendation-reason">

          {reason ||
            "Selected to support your current capability development."}

        </p>


        <div className="recommendation-insight">

          <span>

            <span className="insight-dot"></span>

            Matched to your capability gap

          </span>

          <strong>
            Personalized
          </strong>

        </div>


        <button
          className="recommendation-button"
          onClick={onStartLearning}
        >

          Start learning

          <ArrowRight size={14} />

        </button>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyDashboard({
  icon,
  title,
  text,
  buttonText,
  onClick,
}) {

  return (
    <div className="dashboard-empty-state">

      <div className="dashboard-empty-icon">
        {icon}
      </div>

      <strong>
        {title}
      </strong>

      <span>
        {text}
      </span>

      <button
        className="dashboard-outline-button"
        onClick={onClick}
      >

        {buttonText}

        <ArrowRight size={13} />

      </button>

    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function DashboardLoading() {

  return (
    <div className="dashboard-loading-state">

      <div className="dashboard-loading-ring"></div>

      <span>
        Loading capability insights...
      </span>

    </div>
  );
}


export default App;
