import { useEffect, useState } from "react";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
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
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to restore session:", error);
      return null;
    }
  });

  const handleLogin = (userData) => {
    localStorage.setItem(
      "capacity_connect_user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("capacity_connect_user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
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
            `http://127.0.0.1:8000/recommendations/${user.user_id}`
          ),
          fetch(
            `http://127.0.0.1:8000/my-learning?user_id=${user.user_id}`
          ),
          fetch(
            `http://127.0.0.1:8000/competencies/${user.user_id}`
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
    (course) =>
      Number(course.progress || 0) >= 100
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
     NAVIGATION
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
            <span>
              Organizational Capability Platform
            </span>
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
        >

          {/* DASHBOARD */}

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


          {/* COURSES */}

          {page === "courses" && (
            <Courses
              user={user}
              selectedCourseId={selectedCourseId}
            />
          )}


          {/* MY LEARNING */}

          {page === "learning" && (
            <MyLearning
              user={user}
              onOpenCourse={(courseId) => {
                setSelectedCourseId(courseId);
                setPage("courses");
              }}
            />
          )}


          {/* COMPETENCIES */}

          {page === "competencies" && (
            <Competencies user={user} />
          )}


          {/* KNOWLEDGE HUB */}

          {page === "knowledge" && (
            <KnowledgeHub user={user} />
          )}


          {/* PROGRESS */}

          {page === "progress" && (
            <Progress user={user} />
          )}


          {/* LEARNING PATH */}

          {page === "learning-path" && (
            <LearningPath
              user={user}
              onOpenCourse={(courseId) => {
                setSelectedCourseId(courseId);
                setPage("courses");
              }}
            />
          )}


          {/* ADMIN */}

          {page === "admin" && user.role === "admin" && (
            <Admin user={user} />
          )}

        </div>

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

  return (
    <div className="dashboard-home">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <h1>
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 17
                ? "Good afternoon"
                : "Good evening"}
            ,{" "}
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
          >
            <Sparkles size={17} />
            <span></span>
          </button>

          <div className="dashboard-avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

        </div>

      </div>


      {/* HERO */}

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
              Assess my capabilities
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


      {/* KPI STATS */}

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


      {/* MAIN TWO COLUMN */}

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
                      key={course.id || index}
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
              buttonText="Assess capabilities"
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


      {/* RECOMMENDATIONS */}

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
                Assess my capabilities
                <ArrowRight size={13} />
              </button>

            </div>

          ) : (

            recommendations
              .slice(0, 3)
              .map((recommendation, index) => (

                <Recommendation
                  key={`${recommendation.course_id}-${index}`}
                  title={recommendation.course_title}
                  category={recommendation.competency}
                  reason={recommendation.reason}
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


      {/* CAPABILITY INSIGHT */}

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


      {/* FOOTER */}

      <footer className="dashboard-footer">

        <div>
          <strong>
            Capacity Connect
          </strong>

          <span>
            From training to organizational capability.
          </span>
        </div>

        <span>
          Adaptive learning • Competency intelligence • Knowledge sharing
        </span>

      </footer>

    </div>
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
  return (
    <div className="dashboard-stat-card">

      <div className={`dashboard-stat-icon ${type}`}>
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong className="stat-number">
          {value}
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
        animationDelay: `${index * 120}ms`,
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