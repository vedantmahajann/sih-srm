import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import "./Progress.css";

function Progress({ user }) {
  const [learning, setLearning] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [learningResponse, competencyResponse] =
          await Promise.all([
            fetch(
              `/api/my-learning?user_id=${user.user_id}`
            ),
            fetch(
              `/api/competencies/${user.user_id}`
            ),
          ]);

        const learningData = await learningResponse.json();
        const competencyData = await competencyResponse.json();

        setLearning(
          Array.isArray(learningData) ? learningData : []
        );

        setCompetencies(
          Array.isArray(competencyData) ? competencyData : []
        );
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const overallProgress = useMemo(() => {
    if (!learning.length) return 0;

    return Math.round(
      learning.reduce(
        (sum, course) =>
          sum + Number(course.progress || 0),
        0
      ) / learning.length
    );
  }, [learning]);

  const completedCourses = learning.filter(
    (course) => Number(course.progress || 0) >= 100
  ).length;

  const activeCourses = learning.filter(
    (course) =>
      Number(course.progress || 0) > 0 &&
      Number(course.progress || 0) < 100
  ).length;

  const assessed = competencies.filter(
    (item) =>
      item.level &&
      item.level !== "Not Assessed"
  );

  const capabilityScore = assessed.length
    ? Math.round(
        assessed.reduce(
          (sum, item) =>
            sum + Number(item.score || 0),
          0
        ) / assessed.length
      )
    : 0;

  const strongSkills = competencies.filter(
    (item) => Number(item.score || 0) >= 80
  ).length;

  const developmentAreas = competencies.filter(
    (item) =>
      item.level === "Beginner" ||
      item.level === "Not Assessed" ||
      Number(item.score || 0) < 60
  ).length;

  if (loading) {
    return (
      <div className="progress-page progress-loading">
        <div className="progress-loader"></div>
        <h2>Building your progress view...</h2>
        <p>Analyzing learning and capability data.</p>
      </div>
    );
  }

  return (
    <div className="progress-page">

      {/* HERO */}

      <section className="progress-hero">

        <div className="progress-hero-copy">

          <div className="progress-eyebrow">
            <Sparkles size={14} />
            CAPABILITY IMPACT
          </div>

          <h1>
            Your progress tells
            <span> the bigger story.</span>
          </h1>

          <p>
            See how learning activity is translating into
            measurable capability growth.
          </p>

        </div>

        <div className="progress-score-orb">

          <div className="progress-orbit orbit-one"></div>
          <div className="progress-orbit orbit-two"></div>

          <div className="progress-score-center">
            <strong>{overallProgress}%</strong>
            <span>overall progress</span>
          </div>

        </div>

      </section>


      {/* KPI CARDS */}

      <section className="progress-stats">

        <ProgressStat
          icon={<TrendingUp size={20} />}
          label="Overall progress"
          value={`${overallProgress}%`}
        />

        <ProgressStat
          icon={<BookOpen size={20} />}
          label="Active courses"
          value={activeCourses}
        />

        <ProgressStat
          icon={<CheckCircle2 size={20} />}
          label="Completed courses"
          value={completedCourses}
        />

        <ProgressStat
          icon={<Target size={20} />}
          label="Capability score"
          value={`${capabilityScore}%`}
        />

      </section>


      {/* COURSE PROGRESS */}

      <section className="progress-card">

        <div className="progress-card-header">

          <div>
            <span>LEARNING JOURNEY</span>
            <h2>Course progress</h2>
            <p>
              Your learning activity across enrolled programs.
            </p>
          </div>

        </div>

        {learning.length === 0 ? (

          <div className="progress-empty">
            <BookOpen size={24} />
            <strong>No course activity yet</strong>
            <span>
              Enroll in a course to start tracking progress.
            </span>
          </div>

        ) : (

          <div className="progress-course-list">

            {learning.map((course, index) => {

              const value = Math.min(
                Math.max(
                  Number(course.progress || 0),
                  0
                ),
                100
              );

              return (
                <div
                  className="progress-course-row"
                  key={course.id || index}
                  style={{
                    "--progress-delay": `${index * 80}ms`,
                  }}
                >

                  <div className="progress-course-icon">
                    {course.title
                      ?.substring(0, 2)
                      .toUpperCase() || "CC"}
                  </div>

                  <div className="progress-course-main">

                    <div className="progress-course-top">

                      <div>
                        <strong>{course.title}</strong>
                        <span>
                          {value >= 100
                            ? "Completed"
                            : "In progress"}
                        </span>
                      </div>

                      <strong>{value}%</strong>

                    </div>

                    <div className="progress-track">
                      <div
                        style={{
                          width: `${value}%`,
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


      {/* CAPABILITY */}

      <section className="progress-card">

        <div className="progress-card-header">

          <div>
            <span>CAPABILITY DEVELOPMENT</span>
            <h2>Competency growth</h2>
            <p>
              Current capability levels based on your assessments.
            </p>
          </div>

          <div className="progress-capability-badge">
            <Award size={14} />
            {strongSkills} strong
          </div>

        </div>


        {competencies.length === 0 ? (

          <div className="progress-empty">
            <Target size={24} />
            <strong>No competency data yet</strong>
            <span>
              Complete an assessment to build your capability profile.
            </span>
          </div>

        ) : (

          <div className="competency-progress-grid">

            {competencies.map((competency, index) => {

              const score = Math.min(
                Math.max(
                  Number(competency.score || 0),
                  0
                ),
                100
              );

              return (
                <div
                  className="competency-progress-card"
                  key={competency.id || index}
                >

                  <div className="competency-progress-top">

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

                  <div className="competency-progress-track">
                    <div
                      className={
                        score < 60
                          ? "needs-development"
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

          </div>
        )}

      </section>


      {/* INSIGHT */}

      <section className="progress-insight">

        <div className="progress-insight-icon">
          <Sparkles size={19} />
        </div>

        <div>

          <span>CAPACITY CONNECT INSIGHT</span>

          <strong>
            {developmentAreas > 0
              ? `${developmentAreas} capability area${
                  developmentAreas === 1 ? "" : "s"
                } need further development.`
              : "Your capability profile is showing strong momentum."}
          </strong>

          <p>
            Keep completing targeted learning and assessments
            to strengthen your capability profile.
          </p>

        </div>

        <ArrowRight size={17} />

      </section>

    </div>
  );
}


function ProgressStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="progress-stat">

      <div className="progress-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

export default Progress;
