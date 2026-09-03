import Quiz from "./Quiz";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PlayCircle,
} from "lucide-react";

import "./ModulePlayer.css";

function ModulePlayer({ course, user, onBack }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/courses/${course.id}/modules`
    )
      .then((response) => response.json())
      .then((data) => {
        setModules(data);

        if (data.length > 0) {
          setSelectedModule(data[0]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [course.id]);
  if (showQuiz) {
    return (
      <Quiz
        course={course}
        user={user}
        onBack={() => setShowQuiz(false)}
      />
    );

  }
  if (loading) {
    return (
      <div className="module-player-page">
        <h1>Loading modules...</h1>
      </div>
    );
  }

  return (
    <div className="module-player-page">

      <button
        className="module-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        Back to course
      </button>

      <div className="module-player-header">

        <div>
          <span>{course.category}</span>

          <h1>{course.title}</h1>

          <p>
            Complete each module to build your capability.
          </p>
        </div>

      </div>


      <div className="module-player-layout">

        {/* MODULE LIST */}

        <aside className="module-list">

          <h2>Course modules</h2>

          <p>
            {modules.length} modules
          </p>

          {modules.map((module, index) => (

            <button
              key={module.id}
              className={`module-list-item ${selectedModule?.id === module.id
                ? "selected"
                : ""
                }`}
              onClick={() => setSelectedModule(module)}
            >

              <div className="module-list-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div>
                <strong>{module.title}</strong>

                <span>
                  <Clock3 size={12} />
                  {module.duration}
                </span>
              </div>

            </button>

          ))}

        </aside>


        {/* CONTENT */}

        <main className="module-content">

          {selectedModule && (

            <>
              <div className="module-video-placeholder">

                <PlayCircle size={48} />

                <span>
                  Learning content
                </span>

              </div>

              <div className="module-content-body">

                <span className="module-label">
                  MODULE {selectedModule.order}
                </span>

                <h2>
                  {selectedModule.title}
                </h2>

                <p>
                  {selectedModule.description}
                </p>

                <div className="module-duration">

                  <Clock3 size={15} />

                  {selectedModule.duration}

                </div>

                <button
                  className="complete-module-button"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `http://127.0.0.1:8000/modules/${selectedModule.id}/complete?user_id=${user.user_id}`,
                        {
                          method: "POST",
                        }
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        alert("Unable to complete module");
                        return;
                      }

                      alert(data.message);
                    } catch (error) {
                      console.error(error);
                      alert("Unable to connect to the server.");
                    }
                  }}
                >
                  <CheckCircle2 size={17} />
                  Mark module as complete
                </button>
                <button
                  className="complete-module-button"
                  onClick={() => setShowQuiz(true)}
                >
                  Take knowledge assessment
                </button>
              </div>
            </>

          )}

        </main>

      </div>

    </div>
  );
}

export default ModulePlayer;