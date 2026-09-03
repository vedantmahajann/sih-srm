import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";

import "./Quiz.css";

function Quiz({ course, user, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/courses/${course.id}/quiz`
        );

        const data = await response.json();

        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [course.id]);

  const handleAnswer = (questionId, option) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `http://127.0.0.1:8000/courses/${course.id}/quiz/submit?user_id=${user.user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answers),
        }
      );

      const data = await response.json();

      setResult(data);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-page quiz-state">
        <div className="quiz-loader"></div>
        <h2>Preparing your assessment...</h2>
        <p>Loading your knowledge check.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page quiz-state">
        <div className="quiz-empty-icon">
          <Target size={25} />
        </div>
        <h2>Assessment unavailable</h2>
        <p>This course does not have a quiz yet.</p>
      </div>
    );
  }

  if (result) {
    const score = Number(result.score || 0);

    const performance =
      score >= 80
        ? "Strong performance"
        : score >= 60
          ? "Good progress"
          : "Development opportunity";

    const performanceIcon =
      score >= 60 ? (
        <CheckCircle2 size={25} />
      ) : (
        <Target size={25} />
      );

    return (
      <div className="quiz-page quiz-result-page">

        <div className="result-glow"></div>

        <div className="quiz-result-card">

          <div className="result-icon">
            {score >= 80 ? (
              <Trophy size={28} />
            ) : (
              performanceIcon
            )}
          </div>

          <span className="result-eyebrow">
            ASSESSMENT COMPLETE
          </span>

          <h1>{score}%</h1>

          <h2>{performance}</h2>

          <p>
            You answered{" "}
            <strong>
              {result.correct_answers}
            </strong>{" "}
            out of{" "}
            <strong>
              {result.total_questions}
            </strong>{" "}
            questions correctly.
          </p>


          <div className="competency-result">

            <div className="competency-result-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <span>CAPABILITY UPDATE</span>

              <strong>
                {result.competency
                  ? `${result.competency} profile updated`
                  : "Competency profile updated"}
              </strong>

              <small>
                Your assessment result has been incorporated
                into your capability profile.
              </small>
            </div>

          </div>


          <div className="result-actions">

            <button
              className="result-primary"
              onClick={() => window.location.reload()}
            >
              Review assessment
              <ArrowRight size={14} />
            </button>

            <button
              className="result-secondary"
              onClick={() => {
                if (onComplete) {
                  onComplete(result);
                }
              }}
            >
              Continue journey
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="quiz-page">

      <div className="quiz-header">

        <div>
          <span className="quiz-eyebrow">
            <Sparkles size={13} />
            KNOWLEDGE ASSESSMENT
          </span>

          <h1>{course.title}</h1>

          <p>
            Test your understanding and update your competency profile.
          </p>
        </div>

        <div className="quiz-count">
          {questions.length} questions
        </div>

      </div>


      <div className="quiz-list">

        {questions.map((question, index) => (

          <div
            className="quiz-question-card"
            key={question.id}
          >

            <div className="question-number">
              QUESTION {index + 1}
            </div>

            <h2>{question.question}</h2>


            <div className="quiz-options">

              {[
                ["A", question.option_a],
                ["B", question.option_b],
                ["C", question.option_c],
                ["D", question.option_d],
              ].map(([option, text]) => (

                <button
                  key={option}
                  className={
                    answers[question.id] === option
                      ? "quiz-option selected"
                      : "quiz-option"
                  }
                  onClick={() =>
                    handleAnswer(
                      question.id,
                      option
                    )
                  }
                >

                  <span className="option-letter">
                    {option}
                  </span>

                  <span>{text}</span>

                  {answers[question.id] === option && (
                    <CheckCircle2
                      size={16}
                      className="selected-check"
                    />
                  )}

                </button>

              ))}

            </div>

          </div>

        ))}

      </div>


      <div className="quiz-submit-area">

        <div className="quiz-progress-note">
          {Object.keys(answers).length} / {questions.length} answered
        </div>

        <button
          className="quiz-submit-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? "Evaluating..."
            : "Submit assessment"}

          {!submitting && (
            <ArrowRight size={16} />
          )}
        </button>

      </div>

    </div>
  );
}

export default Quiz;