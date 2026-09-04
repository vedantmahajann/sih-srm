import { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Play,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Trophy,
} from "lucide-react";

import "./MyLearning.css";

function MyLearning({ user, onOpenCourse }) {
  const [learning, setLearning] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLearning = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/my-learning?user_id=${user.user_id}`
        );

        if (!response.ok) {
          throw new Error("Failed to load learning data");
        }

        const data = await response.json();
        const safeData = Array.isArray(data) ? data : [];

        setLearning(safeData);

        const progressEntries = await Promise.all(
          safeData.map(async (course) => {
            try {
              const progressResponse = await fetch(
                `/api/courses/${course.id}/progress?user_id=${user.user_id}`
              );

              if (!progressResponse.ok) {
                return [
                  course.id,
                  Number(course.progress || 0),
                ];
              }

              const progressData = await progressResponse.json();

              return [
                course.id,
                Number(
                  progressData?.progress ??
                  course.progress ??
                  0
                ),
              ];
            } catch {
              return [
                course.id,
                Number(course.progress || 0),
              ];
            }
          })
        );

        setProgressMap(Object.fromEntries(progressEntries));
      } catch (err) {
        console.error("My Learning error:", err);
        setError("Unable to load your learning dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      loadLearning();
    }
  }, [user]);

  const courses = useMemo(() => {
    return learning.map((course) => ({
      ...course,
      progress: Math.min(
        Math.max(
          Number(
            progressMap[course.id] ??
            course.progress ??
            0
          ),
          0
        ),
        100
      ),
    }));
  }, [learning, progressMap]);

  const completed = courses.filter(
    (course) => course.progress >= 100
  );

  const active = courses.filter(
    (course) => course.progress < 100
  );

  const overallProgress =
    courses.length > 0
      ? Math.round(
        courses.reduce(
          (sum, course) =>
            sum + Number(course.progress || 0),
          0
        ) / courses.length
      )
      : 0;

  const handleOpenCourse = (courseId) => {
    if (!courseId) {
      console.error("Course ID is missing");
      return;
    }

    if (typeof onOpenCourse !== "function") {
      console.error(
        "onOpenCourse handler was not provided."
      );
      return;
    }

    onOpenCourse(Number(courseId));
  };

  if (loading) {
    return (
      <div className="my-learning-page learning-loading">
        <div className="learning-loader">
          <BookOpen size={22} />
        </div>

        <h2>Loading your learning journey...</h2>

        <p>
          Preparing your personalized progress overview.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-learning-page learning-loading">
        <div className="learning-error-icon">
          <BookOpen size={24} />
        </div>

        <h2>Something went wrong</h2>

        <p>{error}</p>

        <button
          className="learning-retry"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="my-learning-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="learning-hero">

        <div className="learning-hero-copy">

          <div className="learning-eyebrow">
            <Sparkles size={14} />
            YOUR LEARNING COMMAND CENTER
          </div>

          <h1>
            Keep learning.
            <span> Keep growing.</span>
          </h1>

          <p>
            Pick up where you left off and turn every
            completed learning activity into stronger
            capability.
          </p>

        </div>

        <div className="learning-progress-orb">

          <div className="learning-orb-ring"></div>

          <div className="learning-progress-center">
            <strong>{overallProgress}%</strong>
            <span>overall</span>
          </div>

        </div>

      </section>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="learning-summary">

        <SummaryCard
          icon={<BookOpen size={20} />}
          label="Total programs"
          value={courses.length}
        />

        <SummaryCard
          icon={<Play size={20} />}
          label="In progress"
          value={active.length}
        />

        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={completed.length}
        />

        <SummaryCard
          icon={<TrendingUp size={20} />}
          label="Overall progress"
          value={`${overallProgress}%`}
        />

      </section>

      {/* =====================================================
          ACTIVE COURSES
      ===================================================== */}

      <section className="learning-section">

        <div className="learning-section-header">

          <div>
            <span>CONTINUE YOUR JOURNEY</span>

            <h2>In progress</h2>

            <p>
              Learning programs that are currently underway.
            </p>
          </div>

          <div className="learning-count">
            {active.length} active
          </div>

        </div>

        {active.length === 0 ? (

          <div className="learning-empty">

            <div className="learning-empty-icon">
              <Trophy size={25} />
            </div>

            <h3>
              Your active queue is clear
            </h3>

            <p>
              Explore courses and start your next
              capability-building journey.
            </p>

          </div>

        ) : (

          <div className="learning-course-grid">

            {active.map((course, index) => (
              <LearningCard
                key={course.id}
                course={course}
                index={index}
                onOpenCourse={handleOpenCourse}
              />
            ))}

          </div>

        )}

      </section>

      {/* =====================================================
          COMPLETED COURSES
      ===================================================== */}

      <section className="learning-section completed-section">

        <div className="learning-section-header">

          <div>
            <span>MILESTONES</span>

            <h2>Completed programs</h2>

            <p>
              Courses you've successfully finished.
            </p>
          </div>

          <div className="completed-badge">
            <CheckCircle2 size={13} />
            {completed.length} completed
          </div>

        </div>

        {completed.length === 0 ? (

          <div className="learning-empty compact">

            <div className="learning-empty-icon">
              <CheckCircle2 size={24} />
            </div>

            <h3>
              No completed programs yet
            </h3>

            <p>
              Complete your first course to start
              building your achievement history.
            </p>

          </div>

        ) : (

          <div className="completed-list">

            {completed.map((course, index) => (

              <div
                className="completed-course"
                key={course.id}
                style={{
                  "--learning-delay": `${index * 80}ms`,
                }}
              >

                <div className="completed-course-icon">
                  <CheckCircle2 size={19} />
                </div>

                <div className="completed-course-info">

                  <strong>
                    {course.title}
                  </strong>

                  <span>
                    {course.category ||
                      "Capability Development"}
                  </span>

                </div>

                <div className="completed-course-status">
                  100%
                </div>

                <button
                  className="completed-arrow"
                  title="View course"
                  onClick={() =>
                    handleOpenCourse(course.id)
                  }
                >
                  <ArrowRight size={15} />
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="learning-summary-card">

      <div className="learning-summary-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}


/* =========================================================
   LEARNING CARD
========================================================= */

function LearningCard({
  course,
  index,
  onOpenCourse,
}) {
  const progress = Math.min(
    Math.max(
      Number(course.progress || 0),
      0
    ),
    100
  );

  const initials =
    course.title
      ?.split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "CC";

  return (
    <article
      className="learning-course-card"
      style={{
        "--learning-delay": `${index * 90}ms`,
      }}
    >

      <div className="learning-course-visual">

        <div className="learning-visual-pattern"></div>

        <div className="learning-course-symbol">
          {initials}
        </div>

        <span>
          {progress}% complete
        </span>

      </div>


      <div className="learning-course-content">

        <div className="learning-course-category">
          {course.category ||
            "Capability Development"}
        </div>

        <h3>{course.title}</h3>

        <div className="learning-course-meta">

          <span>
            <Clock3 size={12} />
            {course.duration ||
              "Self paced"}
          </span>

          <span>
            <TrendingUp size={12} />
            {course.difficulty ||
              "Intermediate"}
          </span>

        </div>


        <div className="learning-bar">

          <div className="learning-bar-top">

            <span>
              Your progress
            </span>

            <strong>
              {progress}%
            </strong>

          </div>

          <div className="learning-bar-track">

            <div
              style={{
                width: `${progress}%`,
              }}
            ></div>

          </div>

        </div>


        <button
          type="button"
          className="continue-learning-button"
          onClick={() =>
            onOpenCourse(course.id)
          }
        >
          Continue learning
          <ArrowRight size={14} />
        </button>

      </div>

    </article>
  );
}

export default MyLearning;
