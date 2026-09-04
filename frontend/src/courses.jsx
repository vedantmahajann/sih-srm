import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Clock3,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

import CourseDetails from "./courseDetails";
import "./courses.css";

function Courses({ user, selectedCourseId }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  /* =========================================================
     LOAD COURSES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/courses"
        );

        if (!response.ok) {
          throw new Error("Failed to load courses");
        }

        const data = await response.json();

        const safeCourses = Array.isArray(data)
          ? data
          : [];

        if (cancelled) return;

        setCourses(safeCourses);

        /*
         * IMPORTANT:
         * When My Learning sends selectedCourseId,
         * immediately find that course and open it.
         */
        if (selectedCourseId !== null && selectedCourseId !== undefined) {
          const matchingCourse = safeCourses.find(
            (course) =>
              Number(course.id) === Number(selectedCourseId)
          );

          if (matchingCourse) {
            setSelectedCourse(matchingCourse);
          } else {
            console.warn(
              "Selected course was not found:",
              selectedCourseId
            );
            setSelectedCourse(null);
          }
        }
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to load courses:",
          err
        );

        setError("Unable to load courses.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  /* =========================================================
     IMPORTANT NAVIGATION FIX
  ========================================================= */

  useEffect(() => {
    if (
      selectedCourseId === null ||
      selectedCourseId === undefined ||
      courses.length === 0
    ) {
      return;
    }

    const matchingCourse = courses.find(
      (course) =>
        Number(course.id) === Number(selectedCourseId)
    );

    if (matchingCourse) {
      setSelectedCourse(matchingCourse);
    }
  }, [selectedCourseId, courses]);

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        courses
          .map((course) => course.category)
          .filter(Boolean)
      ),
    ];
  }, [courses]);

  const difficulties = useMemo(() => {
    return [
      "All",
      ...new Set(
        courses
          .map((course) => course.difficulty)
          .filter(Boolean)
      ),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title
          ?.toLowerCase()
          .includes(query) ||
        course.description
          ?.toLowerCase()
          .includes(query) ||
        course.category
          ?.toLowerCase()
          .includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        course.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        course.difficulty === selectedDifficulty;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty
      );
    });
  }, [
    courses,
    searchTerm,
    selectedCategory,
    selectedDifficulty,
  ]);

  /* =========================================================
     FILTER RESET
  ========================================================= */

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
  };

  /* =========================================================
     BACK FROM COURSE DETAILS
  ========================================================= */

  const handleBack = () => {
    setSelectedCourse(null);
  };

  /* =========================================================
     COURSE DETAILS
  ========================================================= */

  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        user={user}
        onBack={handleBack}
      />
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="courses-page courses-state">
        <div className="courses-loader">
          <div className="courses-loader-ring"></div>

          <BookOpen size={22} />
        </div>

        <h2>
          Preparing your learning library...
        </h2>

        <p>
          Loading programs designed to build
          organizational capability.
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="courses-page courses-state">
        <div className="courses-error-icon">
          <X size={24} />
        </div>

        <h2>Something went wrong</h2>

        <p>{error}</p>

        <button
          className="courses-retry-button"
          type="button"
          onClick={() =>
            window.location.reload()
          }
        >
          Try again
        </button>
      </div>
    );
  }

  /* =========================================================
     MAIN COURSES PAGE
  ========================================================= */

  return (
    <div className="courses-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="courses-hero">

        <div className="courses-hero-content">

          <div className="courses-eyebrow">
            <Sparkles size={14} />
            CAPABILITY LEARNING LIBRARY
          </div>

          <h1>
            Learn skills that
            <span> move you forward.</span>
          </h1>

          <p>
            Explore curated learning programs designed
            to strengthen the competencies that matter
            to your role and growth.
          </p>

        </div>

        <div className="courses-hero-visual">

          <div className="course-orbit orbit-1"></div>

          <div className="course-orbit orbit-2"></div>

          <div className="course-hero-core">
            <BookOpen size={30} />
          </div>

          <div className="course-floating-icon floating-a">
            <BarChart3 size={15} />
          </div>

          <div className="course-floating-icon floating-b">
            <Sparkles size={15} />
          </div>

        </div>

      </section>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="courses-toolbar">

        <div className="courses-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search courses, skills or topics..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={() =>
                setSearchTerm("")
              }
            >
              <X size={14} />
            </button>
          )}

        </div>

        <div className="courses-toolbar-icon">
          <SlidersHorizontal size={17} />
        </div>

      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="courses-filters">

        <div className="filter-group">

          <span className="filter-label">
            Category
          </span>

          <div className="filter-pills">

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  selectedCategory === category
                    ? "course-filter active"
                    : "course-filter"
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category}
              </button>
            ))}

          </div>

        </div>

        <div className="filter-group difficulty-group">

          <span className="filter-label">
            Level
          </span>

          <div className="filter-pills">

            {difficulties.map((difficulty) => (
              <button
                type="button"
                key={difficulty}
                className={
                  selectedDifficulty === difficulty
                    ? "course-filter active"
                    : "course-filter"
                }
                onClick={() =>
                  setSelectedDifficulty(difficulty)
                }
              >
                {difficulty}
              </button>
            ))}

          </div>

        </div>

      </section>

      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      <section className="courses-results-header">

        <div>
          <span>LEARNING PROGRAMS</span>

          <h2>
            Explore courses
          </h2>
        </div>

        <div className="course-result-count">
          {filteredCourses.length}{" "}
          {filteredCourses.length === 1
            ? "program"
            : "programs"}
        </div>

      </section>

      {/* =================================================
          COURSE GRID
      ================================================= */}

      {filteredCourses.length === 0 ? (

        <div className="courses-empty">

          <div className="courses-empty-icon">
            <Search size={24} />
          </div>

          <h3>
            No matching courses
          </h3>

          <p>
            Try a different search or clear your filters.
          </p>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>

        </div>

      ) : (

        <section className="course-grid">

          {filteredCourses.map(
            (course, index) => (

              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onOpen={() =>
                  setSelectedCourse(course)
                }
              />

            )
          )}

        </section>

      )}

    </div>
  );
}

/* =========================================================
   COURSE CARD
========================================================= */

function CourseCard({
  course,
  index,
  onOpen,
}) {
  const title =
    course.title ||
    "Learning Program";

  const initials =
    title
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  return (
    <article
      className="course-card"
      style={{
        "--course-delay": `${index * 80}ms`,
      }}
    >

      <div className="course-card-visual">

        <div className="course-card-pattern"></div>

        <div className="course-card-symbol">
          {initials || "CC"}
        </div>

        <span className="course-difficulty">
          {course.difficulty ||
            "Intermediate"}
        </span>

      </div>

      <div className="course-card-content">

        <div className="course-category">
          {course.category ||
            "Capability Development"}
        </div>

        <h3>{title}</h3>

        <p>
          {course.description ||
            "Develop practical capability through focused learning."}
        </p>

        <div className="course-card-meta">

          <span>
            <Clock3 size={13} />
            {course.duration ||
              "Self paced"}
          </span>

          <span>
            <BarChart3 size={13} />
            {course.difficulty ||
              "Intermediate"}
          </span>

        </div>

        <button
          type="button"
          className="course-view-button"
          onClick={onOpen}
        >
          View course

          <ArrowRight size={14} />
        </button>

      </div>

    </article>
  );
}

export default Courses;
