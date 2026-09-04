import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import ModulePlayer from "./ModulePlayer";
import "./courseDetails.css";


/* =========================================================
   REAL COURSE INFORMATION
========================================================= */

const REAL_COURSE_INFO = {
  "Intro to SQL": {
    provider: "Kaggle",
    url: "https://www.kaggle.com/learn/intro-to-sql",
    badge: "Free course",
    description:
      "Learn SQL for working with databases using Google BigQuery. Practice real SQL queries through interactive exercises.",
  },

  "Get started with Microsoft data analytics": {
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/",
    badge: "Microsoft Learning Path",
    description:
      "Explore the role of a data analyst and learn how Power BI transforms data into reports and dashboards for data-driven decisions.",
  },

  "Prepare and visualize data with Power BI": {
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/training/paths/prepare-visualize-data-power-bi/",
    badge: "Microsoft Learning Path",
    description:
      "Learn how to connect to data, transform and shape it, and create interactive visuals in Power BI.",
  },

  "Effective communication in the workplace": {
    provider: "OpenLearn · The Open University",
    url: "https://www.open.edu/openlearn/money-business/effective-communication-the-workplace",
    badge: "Free course",
    description:
      "Develop practical workplace communication skills through an eight-week course with interactive activities and quizzes.",
  },

  "Leadership and followership": {
    provider: "OpenLearn · The Open University",
    url: "https://www.open.edu/openlearn/",
    badge: "Free course",
    description:
      "Explore leadership styles, leadership challenges, followership and practical approaches to developing leadership capability.",
  },

  "Introduction to cyber security: stay safe online": {
    provider: "OpenLearn · The Open University",
    url: "https://www.open.edu/openlearn/",
    badge: "Free course",
    description:
      "Build foundational cybersecurity awareness and learn how to recognise common online threats and protect digital information.",
  },
};


function CourseDetails({
  course,
  user,
  onBack,
}) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] =
    useState(null);
  const [started, setStarted] = useState(false);

  const realInfo =
    REAL_COURSE_INFO[course?.title] || {
      provider: "External Learning Provider",
      url: "#",
      badge: "External course",
      description: course?.description || "",
    };


  /* -------------------------------------------------------
     LOAD MODULES
  ------------------------------------------------------- */

  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await fetch(
          `/api/courses/${course.id}/modules`
        );

        const data = await response.json();

        setModules(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to load modules:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (course?.id) {
      loadModules();
    }
  }, [course]);


  /* -------------------------------------------------------
     START INTERNAL LEARNING
  ------------------------------------------------------- */

  if (started && selectedModule) {
    return (
      <ModulePlayer
        course={course}
        user={user}
        module={selectedModule}
        modules={modules}
        onBack={() => setSelectedModule(null)}
        onSelectModule={(nextModule) => {
          setSelectedModule(nextModule);
        }}
      />
    );
  }


  /* -------------------------------------------------------
     COURSE PAGE
  ------------------------------------------------------- */

  return (
    <div className="course-details-page">

      {/* BACK */}

      <button
        className="course-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to courses
      </button>


      {/* HERO */}

      <section className="course-details-hero">

        <div className="course-details-hero-content">

          <div className="course-details-badge">
            <Sparkles size={14} />
            {realInfo.badge}
          </div>

          <h1>
            {course.title}
          </h1>

          <p className="course-details-provider">
            Provided by <strong>{realInfo.provider}</strong>
          </p>

          <p className="course-details-description">
            {realInfo.description}
          </p>


          {/* META */}

          <div className="course-details-meta">

            <div>
              <Clock3 size={16} />
              <span>
                {course.duration}
              </span>
            </div>

            <div>
              <GraduationCap size={16} />
              <span>
                {course.difficulty}
              </span>
            </div>

            <div>
              <BookOpen size={16} />
              <span>
                {loading
                  ? "Loading modules..."
                  : `${modules.length} modules`}
              </span>
            </div>

          </div>


          {/* ACTIONS */}

          <div className="course-details-actions">

            {realInfo.url !== "#" && (
              <a
                href={realInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="course-primary-action"
              >
                Start official course
                <ExternalLink size={16} />
              </a>
            )}

            {!loading && modules.length > 0 && (
              <button
                className="course-secondary-action"
                onClick={() => {
                  setSelectedModule(
                    modules[0]
                  );
                  setStarted(true);
                }}
              >
                Preview learning path
                <ArrowRight size={16} />
              </button>
            )}

          </div>

        </div>


        {/* VISUAL */}

        <div className="course-details-visual">

          <div className="course-orbit orbit-one"></div>
          <div className="course-orbit orbit-two"></div>

          <div className="course-visual-card">

            <div className="course-visual-icon">
              <PlayCircle size={28} />
            </div>

            <span>
              REAL-WORLD LEARNING
            </span>

            <strong>
              {realInfo.provider}
            </strong>

            <small>
              Official external course
            </small>

          </div>

        </div>

      </section>


      {/* COURSE MODULES */}

      <section className="course-modules-section">

        <div className="course-section-heading">

          <div>
            <span className="course-section-eyebrow">
              LEARNING STRUCTURE
            </span>

            <h2>
              Course modules
            </h2>

            <p>
              Use Capacity Connect to discover
              and track the learning journey.
            </p>
          </div>

          <div className="course-module-count">
            <strong>
              {modules.length}
            </strong>
            <span>
              Modules
            </span>
          </div>

        </div>


        {loading ? (

          <div className="course-loading">
            <div className="course-loading-ring"></div>
            <span>
              Loading course structure...
            </span>
          </div>

        ) : modules.length === 0 ? (

          <div className="course-empty">

            <BookOpen size={24} />

            <strong>
              Course structure available externally
            </strong>

            <span>
              Launch the official provider course
              above to begin the full learning experience.
            </span>

          </div>

        ) : (

          <div className="course-module-list">

            {modules.map(
              (module, index) => (

                <div
                  className="course-module-card"
                  key={module.id || index}
                >

                  <div className="course-module-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="course-module-content">

                    <div className="course-module-top">

                      <span>
                        Module {index + 1}
                      </span>

                      <small>
                        {module.duration}
                      </small>

                    </div>

                    <h3>
                      {module.title}
                    </h3>

                    <p>
                      {module.description}
                    </p>

                  </div>


                  <button
                    className="course-module-button"
                    onClick={() => {
                      setSelectedModule(
                        module
                      );
                      setStarted(true);
                    }}
                  >
                    Open
                    <ArrowRight size={15} />
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* TRUST STRIP */}

      <section className="course-trust-strip">

        <div className="course-trust-icon">
          <CheckCircle2 size={18} />
        </div>

        <div>
          <strong>
            Learn from the original provider
          </strong>

          <span>
            Capacity Connect keeps your learning
            journey, progress and competency data
            in one place.
          </span>
        </div>

      </section>

    </div>
  );
}


export default CourseDetails;
