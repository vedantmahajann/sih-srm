import { useEffect, useState } from "react";
import {
    Sparkles,
    Target,
    BookOpen,
    CheckCircle2,
    Lock,
    ArrowRight,
    Brain,
} from "lucide-react";

import "./LearningPath.css";

function LearningPath({ user, onOpenCourse }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPath = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/recommendations/${user.user_id}`
                );

                const data = await response.json();

                setRecommendations(
                    Array.isArray(data) ? data.slice(0, 4) : []
                );
            } catch (error) {
                console.error("Failed to load learning path:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.user_id) {
            loadPath();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="learning-path-loading">
                <div className="path-loader"></div>
                <h2>Building your learning path...</h2>
                <p>Matching your capability gaps with learning opportunities.</p>
            </div>
        );
    }

    return (
        <div className="learning-path-page">

            <section className="learning-path-hero">
                <div>
                    <div className="path-eyebrow">
                        <Sparkles size={15} />
                        PERSONALIZED DEVELOPMENT
                    </div>

                    <h1>
                        Your Learning
                        <br />
                        <span>Path</span>
                    </h1>

                    <p>
                        A focused sequence of learning recommendations based on
                        your current competency gaps.
                    </p>
                </div>

                <div className="path-visual">
                    <div className="path-glow"></div>

                    <div className="path-center">
                        <Brain size={32} />
                    </div>

                    <div className="path-orbit path-orbit-1"></div>
                    <div className="path-orbit path-orbit-2"></div>
                </div>
            </section>

            <section className="path-summary">
                <div className="summary-item">
                    <Target size={18} />
                    <div>
                        <span>Development areas</span>
                        <strong>{recommendations.length}</strong>
                    </div>
                </div>

                <div className="summary-item">
                    <BookOpen size={18} />
                    <div>
                        <span>Recommended programs</span>
                        <strong>{recommendations.length}</strong>
                    </div>
                </div>

                <div className="summary-item">
                    <Sparkles size={18} />
                    <div>
                        <span>Path status</span>
                        <strong>
                            {recommendations.length > 0 ? "Ready" : "Complete"}
                        </strong>
                    </div>
                </div>
            </section>

            <section className="path-section">
                <div className="path-section-heading">
                    <span>RECOMMENDED JOURNEY</span>
                    <h2>Build your capabilities</h2>
                    <p>
                        Follow the recommended sequence to close your most relevant
                        competency gaps.
                    </p>
                </div>

                {recommendations.length === 0 ? (
                    <div className="path-empty">
                        <div className="path-empty-icon">
                            <CheckCircle2 size={28} />
                        </div>

                        <h3>Your capability profile is on track</h3>

                        <p>
                            No additional learning recommendations are currently
                            available.
                        </p>
                    </div>
                ) : (
                    <div className="learning-timeline">

                        <div className="timeline-line"></div>

                        {recommendations.map((item, index) => (
                            <div
                                className="path-step"
                                key={`${item.course_id}-${index}`}
                                style={{
                                    "--step-delay": `${index * 120}ms`,
                                }}
                            >
                                <div className="step-marker">
                                    {index === 0 ? (
                                        <Sparkles size={15} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                <div className="step-card">

                                    <div className="step-card-top">
                                        <div>
                                            <span className="step-number">
                                                STEP {index + 1}
                                            </span>

                                            <h3>{item.course_title}</h3>

                                            <p>
                                                Recommended to improve{" "}
                                                <strong>{item.competency}</strong>
                                            </p>
                                        </div>

                                        <div className="step-status">
                                            {index === 0 ? (
                                                <>
                                                    <Sparkles size={12} />
                                                    Start here
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={12} />
                                                    Next
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="step-reason">
                                        <Target size={15} />

                                        <span>{item.reason}</span>
                                    </div>

                                    <div className="step-footer">
                                        <div className="step-progress">
                                            <div className="step-progress-track">
                                                <div
                                                    className="step-progress-fill"
                                                    style={{
                                                        width: index === 0 ? "18%" : "0%",
                                                    }}
                                                ></div>
                                            </div>

                                            <span>
                                                {index === 0 ? "Ready to begin" : "Upcoming"}
                                            </span>
                                        </div>

                                        <button
                                            className="path-action"
                                            onClick={() => onOpenCourse(item.course_id)}
                                        >
                                            Continue
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </section>
        </div>
    );
}

export default LearningPath;