import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import ModulePlayer from "./ModulePlayer";
import "./CourseDetails.css";

function CourseDetails({ course, onBack, user }) {
  const [learning, setLearning] = useState(false);
  if (learning) {
    return (
      <ModulePlayer
        course={course}
        user={user}
        onBack={() => setLearning(false)}
      />
    );
  }
  const handleEnroll = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/enroll?user_id=${user.user_id}&course_id=${course.id}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert("Enrollment failed");
        return;
      }

      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="course-details-page">

      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to courses
      </button>

      <section className="course-hero">

        <div className="course-hero-content">

          <span className="course-detail-category">
            {course.category}
          </span>

          <h1>{course.title}</h1>

          <p>{course.description}</p>

          <div className="course-detail-meta">

            <span>
              <Clock3 size={16} />
              {course.duration}
            </span>

            <span>
              <BookOpen size={16} />
              {course.difficulty}
            </span>

            <span>
              <CheckCircle2 size={16} />
              Certificate available
            </span>

          </div>

          <button
            className="enroll-button"
            onClick={handleEnroll}
          >
            Enroll in course
          </button>
          <button
            className="start-learning-button"
            onClick={() => setLearning(true)}
          >
            Start learning
          </button>

        </div>

        <div className="course-hero-visual">
          <BookOpen size={70} />
        </div>

      </section>


      <section className="course-detail-content">

        <div className="course-modules">

          <div className="section-heading">
            <h2>Course modules</h2>
            <p>Complete each module to build your capability.</p>
          </div>

          <Module
            number="01"
            title="Introduction and Fundamentals"
            duration="25 min"
          />

          <Module
            number="02"
            title="Core Concepts"
            duration="35 min"
          />

          <Module
            number="03"
            title="Practical Application"
            duration="40 min"
          />

          <Module
            number="04"
            title="Assessment and Knowledge Check"
            duration="20 min"
          />

        </div>


        <aside className="course-overview-card">

          <h3>Course overview</h3>

          <div className="overview-item">
            <span>Duration</span>
            <strong>{course.duration}</strong>
          </div>

          <div className="overview-item">
            <span>Difficulty</span>
            <strong>{course.difficulty}</strong>
          </div>

          <div className="overview-item">
            <span>Category</span>
            <strong>{course.category}</strong>
          </div>

          <div className="overview-item">
            <span>Learning mode</span>
            <strong>Self-paced</strong>
          </div>

        </aside>

      </section>

    </div>
  );
}


function Module({ number, title, duration }) {
  return (
    <div className="module-card">

      <div className="module-number">
        {number}
      </div>

      <div className="module-info">
        <strong>{title}</strong>

        <span>
          <Clock3 size={13} />
          {duration}
        </span>
      </div>

      <PlayCircle size={20} className="module-play" />

    </div>
  );
}

export default CourseDetails;