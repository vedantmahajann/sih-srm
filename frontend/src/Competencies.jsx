import { useEffect, useMemo, useState } from "react";

import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Brain,
  ShieldCheck,
} from "lucide-react";

import "./Competencies.css";

function Competencies({ user, onNavigate }) {
  const [competencies, setCompetencies] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const loadCompetencyData = async () => {
      try {
        const [
          competencyResponse,
          gapResponse,
        ] = await Promise.all([
          fetch(
            `/api/competencies/${user.user_id}`
          ),
          fetch(
            `/api/skill-gaps/${user.user_id}`
          ),
        ]);

        const competencyData =
          await competencyResponse.json();

        const gapData =
          await gapResponse.json();

        setCompetencies(
          Array.isArray(competencyData)
            ? competencyData
            : []
        );

        setSkillGaps(
          Array.isArray(gapData)
            ? gapData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load competency data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      loadCompetencyData();
    }
  }, [user]);

  const assessedCount = competencies.filter(
    (item) =>
      item.level &&
      item.level !== "Not Assessed"
  ).length;

  const averageScore = useMemo(() => {
    const assessed = competencies.filter(
      (item) =>
        item.level &&
        item.level !== "Not Assessed"
    );

    if (!assessed.length) {
      return 0;
    }

    return Math.round(
      assessed.reduce(
        (sum, item) =>
          sum + Number(item.score || 0),
        0
      ) / assessed.length
    );
  }, [competencies]);

  const strongSkills = competencies.filter(
    (item) =>
      Number(item.score || 0) >= 80 ||
      item.level === "Advanced"
  ).length;

  const visibleCompetencies =
    competencies.filter((item) => {
      if (selectedFilter === "gaps") {
        return skillGaps.some(
          (gap) =>
            gap.competency === item.name
        );
      }

      if (selectedFilter === "assessed") {
        return item.level !== "Not Assessed";
      }

      return true;
    });

  if (loading) {
    return (
      <div className="competency-page competency-loading">
        <div className="competency-loader">
          <div className="loader-ring"></div>
          <Brain size={22} />
        </div>

        <h2>
          Analyzing your capabilities...
        </h2>

        <p>
          Building your personalized competency
          profile.
        </p>
      </div>
    );
  }

  return (
    <div className="competency-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="competency-hero">

        <div className="competency-hero-content">

          <div className="competency-eyebrow">
            <Sparkles size={15} />
            INTELLIGENT CAPABILITY ENGINE
          </div>

          <h1>
            Know where you stand.
            <br />
            <span>
              Know where to grow.
            </span>
          </h1>

          <p>
            Capacity Connect compares your current
            capabilities against organizational
            requirements and identifies the areas
            that need development.
          </p>

          <div className="hero-pills">

            <div className="hero-pill">
              <ShieldCheck size={14} />
              Personalized
            </div>

            <div className="hero-pill">
              <Target size={14} />
              Skill-gap driven
            </div>

            <div className="hero-pill">
              <TrendingUp size={14} />
              Measurable growth
            </div>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-orbit orbit-one"></div>

          <div className="hero-orbit orbit-two"></div>

          <div className="hero-core">
            <Target size={34} />
          </div>

          <div className="floating-node node-one">
            <Brain size={15} />
          </div>

          <div className="floating-node node-two">
            <TrendingUp size={15} />
          </div>

          <div className="floating-node node-three">
            <Sparkles size={15} />
          </div>

        </div>

      </section>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <section className="competency-metrics">

        <Metric
          icon={<Target size={21} />}
          label="Skill gaps"
          value={skillGaps.length}
          description="Priority development areas"
          variant="purple"
        />

        <Metric
          icon={<TrendingUp size={21} />}
          label="Average capability"
          value={`${averageScore}%`}
          description="Across assessed competencies"
          variant="blue"
        />

        <Metric
          icon={<CheckCircle2 size={21} />}
          label="Strong capabilities"
          value={strongSkills}
          description="Skills showing strong performance"
          variant="green"
        />

        <Metric
          icon={<Brain size={21} />}
          label="Assessed"
          value={assessedCount}
          description={`Of ${competencies.length} competencies`}
          variant="orange"
        />

      </section>

      {/* =========================
          GAP HIGHLIGHT
      ========================= */}

      <section className="gap-spotlight">

        <div className="gap-spotlight-icon">
          <AlertTriangle size={23} />
        </div>

        <div className="gap-spotlight-copy">

          <span>
            DEVELOPMENT PRIORITY
          </span>

          <h2>
            {skillGaps.length > 0
              ? `${skillGaps.length} capability ${skillGaps.length === 1
                ? "area needs"
                : "areas need"
              } attention`
              : "Your capability profile is on track"}
          </h2>

          <p>
            {skillGaps.length > 0
              ? "These gaps can be addressed through targeted learning recommendations."
              : "Your currently assessed competencies are meeting their required levels."}
          </p>

        </div>

        <div
          className={
            skillGaps.length > 0
              ? "gap-status needs-attention"
              : "gap-status on-track"
          }
        >

          {skillGaps.length > 0 ? (
            <>
              <AlertTriangle size={14} />
              Development needed
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              On track
            </>
          )}

        </div>

      </section>

      {/* =========================
          FILTERS
      ========================= */}

      <section className="competency-section-header">

        <div>

          <span>
            CAPABILITY PROFILE
          </span>

          <h2>
            Your Competencies
          </h2>

          <p>
            Understand your current level and the
            capability expected by your organization.
          </p>

        </div>

        <div className="competency-filters">

          <button
            className={
              selectedFilter === "all"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setSelectedFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              selectedFilter === "assessed"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setSelectedFilter("assessed")
            }
          >
            Assessed
          </button>

          <button
            className={
              selectedFilter === "gaps"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setSelectedFilter("gaps")
            }
          >
            Skill gaps
          </button>

        </div>

      </section>

      {/* =========================
          COMPETENCY CARDS
      ========================= */}

      <section className="competency-list">

        {visibleCompetencies.length === 0 ? (

          <div className="competency-empty">

            <div className="empty-icon">
              <Target size={26} />
            </div>

            <h3>
              No competencies found
            </h3>

            <p>
              Try another filter to view your
              capability profile.
            </p>

          </div>

        ) : (

          visibleCompetencies.map(
            (competency, index) => {

              const score = Math.min(
                Math.max(
                  Number(
                    competency.score || 0
                  ),
                  0
                ),
                100
              );

              const gap = skillGaps.find(
                (item) =>
                  item.competency ===
                  competency.name
              );

              const hasGap = Boolean(gap);

              const requiredLevel =
                competency.required_level ||
                gap?.required_level ||
                "Intermediate";

              const currentLevel =
                competency.level ||
                "Not Assessed";

              return (
                <article
                  className={
                    hasGap
                      ? "competency-card has-gap"
                      : "competency-card"
                  }
                  key={
                    competency.id ||
                    competency.competency_id ||
                    competency.name
                  }
                  style={{
                    "--card-delay": `${index * 80
                      }ms`,
                  }}
                >

                  {/* CARD HEADER */}

                  <div className="competency-card-top">

                    <div className="competency-name-group">

                      <div className="competency-card-icon">
                        <Brain size={20} />
                      </div>

                      <div>

                        <h3>
                          {competency.name}
                        </h3>

                        <p>
                          {competency.description}
                        </p>

                      </div>

                    </div>

                    <div
                      className={
                        hasGap
                          ? "level-badge gap-badge"
                          : "level-badge"
                      }
                    >

                      {hasGap ? (
                        <AlertTriangle size={13} />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}

                      {currentLevel}

                    </div>

                  </div>

                  {/* COMPARISON */}

                  <div className="capability-comparison">

                    <div className="comparison-column">

                      <span>
                        Current capability
                      </span>

                      <div className="comparison-value">

                        <strong>
                          {currentLevel}
                        </strong>

                        <small>
                          {score}%
                        </small>

                      </div>

                      <div className="skill-track">

                        <div
                          className="skill-fill current-fill"
                          style={{
                            width: `${score}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    <div className="comparison-arrow">
                      <ArrowUpRight size={18} />
                    </div>

                    <div className="comparison-column">

                      <span>
                        Required level
                      </span>

                      <div className="comparison-value">

                        <strong>
                          {requiredLevel}
                        </strong>

                        <small>
                          {requiredLevel === "Advanced"
                            ? "80%+"
                            : "60%+"}
                        </small>

                      </div>

                      <div className="skill-track required-track">

                        <div
                          className="skill-fill required-fill"
                          style={{
                            width:
                              requiredLevel ===
                                "Advanced"
                                ? "88%"
                                : "64%",
                          }}
                        ></div>

                      </div>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="competency-card-footer">

                    <div className="competency-status">

                      {hasGap ? (
                        <>
                          <span className="status-warning-dot"></span>

                          <span>
                            Gap detected —
                            development recommended
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="status-success-dot"></span>

                          <span>
                            Current capability
                            meets requirement
                          </span>
                        </>
                      )}

                    </div>

                    {hasGap && (
                      <button
                        type="button"
                        className="development-button"
                        onClick={() =>
                          onNavigate(
                            "learning-path"
                          )
                        }
                      >
                        View development path
                        <ArrowUpRight size={15} />
                      </button>
                    )}

                  </div>

                </article>
              );
            }
          )

        )}

      </section>

    </div>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function Metric({
  icon,
  label,
  value,
  description,
  variant,
}) {
  return (
    <div
      className={`competency-metric ${variant}`}
    >

      <div className="metric-icon">
        {icon}
      </div>

      <div className="metric-copy">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </div>
  );
}

export default Competencies;
