import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Clock3,
  FileText,
  Layers3,
  Lightbulb,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
  X,
} from "lucide-react";

function KnowledgeHub({ user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(
          "/api/knowledge"
        );

        if (!response.ok) {
          throw new Error("Failed to load resources");
        }

        const data = await response.json();

        setResources(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        resources
          .map((r) => r.category)
          .filter(Boolean)
      ),
    ];
  }, [resources]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return resources.filter((resource) => {
      const searchable = [
        resource.title,
        resource.description,
        resource.category,
        resource.author,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!q || searchable.includes(q)) &&
        (category === "All" ||
          resource.category === category)
      );
    });
  }, [resources, search, category]);

  const initials = (name) => {
    if (!name) return "CC";

    return name
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();
  };

  const iconFor = (resource) => {
    const type =
      resource?.resource_type
        ?.toLowerCase() || "";

    if (type.includes("video")) {
      return <Video size={20} />;
    }

    if (
      type.includes("link") ||
      type.includes("web")
    ) {
      return <Link2 size={20} />;
    }

    return <FileText size={20} />;
  };

  const pointsFor = (resource) => {
    const category =
      resource?.category
        ?.toLowerCase() || "";

    if (category.includes("leadership")) {
      return [
        "Understand practical leadership behaviours",
        "Apply principles to workplace situations",
        "Strengthen decision-making capability",
      ];
    }

    if (category.includes("communication")) {
      return [
        "Communicate with greater clarity",
        "Handle important workplace conversations",
        "Strengthen collaboration and alignment",
      ];
    }

    if (category.includes("digital")) {
      return [
        "Improve digital workplace capability",
        "Use modern tools more effectively",
        "Build more efficient working practices",
      ];
    }

    return [
      "Understand practical workplace concepts",
      "Connect knowledge with real situations",
      "Turn learning into measurable capability",
    ];
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="cc-knowledge-loading">
          <div className="cc-loading-orbit">
            <div className="cc-loading-core">
              <Layers3 size={26} />
            </div>
          </div>

          <h2>Preparing Knowledge Hub</h2>
          <p>
            Connecting your organizational knowledge
            space...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="cc-knowledge-page">

        {/* ================= HERO ================= */}

        <section className="cc-knowledge-hero">

          <div className="cc-hero-grid"></div>

          <div className="cc-hero-left">

            <div className="cc-eyebrow">
              <Sparkles size={14} />
              ORGANIZATIONAL KNOWLEDGE
            </div>

            <h1>
              Knowledge that
              <span> moves capability.</span>
            </h1>

            <p>
              One intelligent space for your
              organization's playbooks, guides,
              insights and practical knowledge.
            </p>

            <div className="cc-hero-metrics">

              <div>
                <strong>
                  {resources.length}
                </strong>
                <span>
                  Knowledge assets
                </span>
              </div>

              <div>
                <strong>
                  {Math.max(
                    categories.length - 1,
                    0
                  )}
                </strong>
                <span>
                  Knowledge domains
                </span>
              </div>

              <div>
                <strong>
                  {filtered.length}
                </strong>
                <span>
                  Available now
                </span>
              </div>

            </div>

          </div>

          {/* INTELLIGENCE ORBIT */}

          <div className="cc-knowledge-visual">

            <div className="cc-orbit cc-orbit-one">
              <span></span>
            </div>

            <div className="cc-orbit cc-orbit-two">
              <span></span>
            </div>

            <div className="cc-orbit cc-orbit-three">
              <span></span>
            </div>

            <div className="cc-knowledge-core">

              <div className="cc-core-icon">
                <Layers3 size={28} />
              </div>

              <span>
                CAPACITY
              </span>

              <strong>
                KNOWLEDGE
              </strong>

              <small>
                Connected intelligence
              </small>

            </div>

            <div className="cc-floating cc-floating-one">
              <FileText size={14} />
              <span>Playbooks</span>
            </div>

            <div className="cc-floating cc-floating-two">
              <Brain size={14} />
              <span>Insights</span>
            </div>

            <div className="cc-floating cc-floating-three">
              <BookOpen size={14} />
              <span>Guides</span>
            </div>

          </div>
        </section>

        {/* ================= SEARCH ================= */}

        <section className="cc-discovery">

          <div className="cc-discovery-heading">

            <div>
              <span>
                KNOWLEDGE LIBRARY
              </span>

              <h2>
                Explore organizational knowledge
              </h2>

              <p>
                Find useful knowledge without leaving
                Capacity Connect.
              </p>
            </div>

            <div className="cc-library-count">
              <strong>
                {filtered.length}
              </strong>

              <span>
                resources
              </span>
            </div>

          </div>

          <div className="cc-search">

            <Search size={19} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search resources, topics or contributors..."
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

          </div>

        </section>

        {/* ================= FILTERS ================= */}

        <section className="cc-filter-row">

          <div className="cc-filter-label">
            <span>
              FILTER BY DOMAIN
            </span>
          </div>

          <div className="cc-filters">

            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "cc-filter active"
                    : "cc-filter"
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ))}

          </div>

        </section>

        {/* ================= CARDS ================= */}

        {filtered.length === 0 ? (
          <section className="cc-empty">

            <div className="cc-empty-icon">
              <Search size={24} />
            </div>

            <h3>
              No resources found
            </h3>

            <p>
              Try a different search or reset
              your knowledge filters.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset discovery
            </button>

          </section>
        ) : (
          <section className="cc-resource-grid">

            {filtered.map(
              (resource, index) => (
                <article
                  key={
                    resource.id ??
                    `${resource.title}-${index}`
                  }
                  className="cc-resource-card"
                  style={{
                    "--delay": `${index * 80}ms`,
                  }}
                >

                  <div className="cc-card-shine"></div>

                  <div className="cc-card-top">

                    <div className="cc-resource-icon">
                      {iconFor(resource)}
                    </div>

                    <span>
                      {resource.resource_type ||
                        "KNOWLEDGE"}
                    </span>

                  </div>

                  <div className="cc-category">
                    {resource.category ||
                      "CAPABILITY DEVELOPMENT"}
                  </div>

                  <h3>
                    {resource.title ||
                      "Knowledge Resource"}
                  </h3>

                  <p>
                    {resource.description ||
                      "Practical knowledge to strengthen organizational capability."}
                  </p>

                  <div className="cc-card-divider"></div>

                  <div className="cc-card-footer">

                    <div className="cc-author">

                      <div className="cc-author-avatar">
                        {initials(
                          resource.author
                        )}
                      </div>

                      <div>
                        <span>
                          CONTRIBUTOR
                        </span>

                        <strong>
                          {resource.author ||
                            "Capacity Connect Team"}
                        </strong>
                      </div>

                    </div>

                    <button
                      className="cc-open"
                      onClick={() =>
                        setSelected(resource)
                      }
                    >
                      Open
                      <ArrowUpRight
                        size={15}
                      />
                    </button>

                  </div>

                </article>
              )
            )}

          </section>
        )}

        {/* ================= VIEWER ================= */}

        {selected && (
          <div
            className="cc-viewer-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelected(null);
              }
            }}
          >

            <div className="cc-viewer">

              <div className="cc-viewer-header">

                <div className="cc-viewer-brand">

                  <div className="cc-viewer-brand-icon">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <span>
                      CAPACITY CONNECT
                    </span>

                    <strong>
                      KNOWLEDGE VIEWER
                    </strong>
                  </div>

                </div>

                <button
                  className="cc-viewer-close"
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  <X size={19} />
                </button>

              </div>

              <div className="cc-viewer-content">

                <main>

                  <div className="cc-internal-badge">
                    <ShieldCheck size={14} />
                    INTERNAL KNOWLEDGE ASSET
                  </div>

                  <div className="cc-viewer-icon">
                    {iconFor(selected)}
                  </div>

                  <div className="cc-viewer-category">
                    {selected.category ||
                      "CAPABILITY DEVELOPMENT"}
                  </div>

                  <h2>
                    {selected.title}
                  </h2>

                  <p className="cc-viewer-description">
                    {selected.description ||
                      "This resource supports practical capability development within the organization."}
                  </p>

                  <div className="cc-viewer-meta">

                    <div>
                      <UserRound size={15} />
                      <span>
                        Contributor
                      </span>
                      <strong>
                        {selected.author ||
                          "Capacity Connect Team"}
                      </strong>
                    </div>

                    <div>
                      <FileText size={15} />
                      <span>
                        Format
                      </span>
                      <strong>
                        {selected.resource_type ||
                          "Knowledge"}
                      </strong>
                    </div>

                    <div>
                      <Clock3 size={15} />
                      <span>
                        Access
                      </span>
                      <strong>
                        Centralized
                      </strong>
                    </div>

                  </div>

                  <div className="cc-viewer-rule"></div>

                  <div className="cc-learning-section">

                    <div className="cc-learning-title">
                      <Lightbulb size={17} />

                      <span>
                        WHAT YOU CAN TAKE FROM THIS
                      </span>
                    </div>

                    <div className="cc-learning-points">

                      {pointsFor(selected).map(
                        (point, index) => (
                          <div
                            key={index}
                            className="cc-learning-point"
                          >
                            <div>
                              {index + 1}
                            </div>

                            <span>
                              {point}
                            </span>
                          </div>
                        )
                      )}

                    </div>

                  </div>

                  <div className="cc-insight-box">

                    <div className="cc-insight-icon">
                      <Brain size={18} />
                    </div>

                    <div>
                      <strong>
                        Capacity Connect insight
                      </strong>

                      <p>
                        Knowledge creates organizational
                        value when employees can discover,
                        understand and apply it.
                      </p>
                    </div>

                  </div>

                </main>

                <aside>

                  <div className="cc-side-orbit">

                    <div></div>
                    <div></div>

                    <div className="cc-side-core">
                      <Layers3 size={25} />
                    </div>

                  </div>

                  <div className="cc-side-card">

                    <span>
                      KNOWLEDGE DOMAIN
                    </span>

                    <strong>
                      {selected.category ||
                        "Capability Development"}
                    </strong>

                    <p>
                      This resource is available
                      through the centralized
                      Capacity Connect experience.
                    </p>

                  </div>

                </aside>

              </div>

              <div className="cc-viewer-footer">

                <div>
                  <span>
                    CAPACITY CONNECT
                  </span>

                  <strong>
                    Knowledge stays inside the platform.
                  </strong>
                </div>

                <button
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  Close viewer
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

.cc-knowledge-page {
  min-height: 100vh;
  padding: 4px 0 50px;
  color: #17152b;
}

.cc-knowledge-loading {
  min-height: 65vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cc-knowledge-loading h2 {
  margin: 22px 0 6px;
  font-size: 22px;
}

.cc-knowledge-loading p {
  margin: 0;
  color: #8b8da0;
  font-size: 12px;
}

.cc-loading-orbit {
  width: 72px;
  height: 72px;
  border: 1px solid #dedaf4;
  border-radius: 50%;
  display: grid;
  place-items: center;
  animation: ccSpin 5s linear infinite;
}

.cc-loading-core {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #735ff0, #5240bd);
  color: white;
  animation: ccCounterSpin 5s linear infinite;
  box-shadow: 0 12px 30px rgba(86, 67, 199, .22);
}

@keyframes ccSpin {
  to { transform: rotate(360deg); }
}

@keyframes ccCounterSpin {
  to { transform: rotate(-360deg); }
}

/* HERO */

.cc-knowledge-hero {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  padding: 42px 48px;
  border: 1px solid rgba(222, 219, 240, .95);
  border-radius: 28px;
  background:
    radial-gradient(circle at 82% 35%, rgba(120, 99, 239, .16), transparent 24%),
    radial-gradient(circle at 8% 100%, rgba(92, 119, 214, .09), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #f9f8ff 58%, #f0f3fb 100%);
  box-shadow: 0 24px 55px rgba(46, 35, 106, .08);
}

.cc-hero-grid {
  position: absolute;
  inset: 0;
  opacity: .34;
  background-image:
    linear-gradient(rgba(93, 81, 177, .035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(93, 81, 177, .035) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}

.cc-hero-left {
  position: relative;
  z-index: 2;
  max-width: 650px;
}

.cc-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  color: #6958d5;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.6px;
}

.cc-hero-left h1 {
  margin: 0;
  font-size: clamp(34px, 4vw, 53px);
  line-height: 1.02;
  letter-spacing: -2.2px;
  color: #1d1931;
}

.cc-hero-left h1 span {
  display: block;
  color: #6755d2;
}

.cc-hero-left > p {
  max-width: 600px;
  margin: 17px 0 26px;
  color: #85889b;
  font-size: 13px;
  line-height: 1.75;
}

.cc-hero-metrics {
  display: flex;
  gap: 26px;
}

.cc-hero-metrics div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cc-hero-metrics strong {
  color: #25203b;
  font-size: 21px;
}

.cc-hero-metrics span {
  color: #9698a9;
  font-size: 9px;
}

.cc-knowledge-visual {
  position: relative;
  width: 355px;
  height: 255px;
  flex-shrink: 0;
}

.cc-orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid rgba(103, 83, 208, .14);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.cc-orbit-one {
  width: 185px;
  height: 185px;
  animation: ccOrbitOne 15s linear infinite;
}

.cc-orbit-two {
  width: 245px;
  height: 245px;
  border-style: dashed;
  animation: ccOrbitTwo 20s linear infinite reverse;
}

.cc-orbit-three {
  width: 305px;
  height: 305px;
  opacity: .55;
  animation: ccOrbitThree 28s linear infinite;
}

.cc-orbit span {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b58d8;
  box-shadow: 0 0 0 5px rgba(107, 88, 216, .08);
}

.cc-orbit-one span {
  top: 10px;
  left: 50%;
}

.cc-orbit-two span {
  right: 18px;
  bottom: 34px;
}

.cc-orbit-three span {
  left: 20px;
  bottom: 54px;
}

@keyframes ccOrbitOne {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes ccOrbitTwo {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes ccOrbitThree {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.cc-knowledge-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 132px;
  min-height: 136px;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px solid rgba(225, 222, 241, .95);
  border-radius: 24px;
  background: rgba(255, 255, 255, .88);
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 45px rgba(48, 37, 112, .11);
  animation: ccFloat 4s ease-in-out infinite;
}

@keyframes ccFloat {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, calc(-50% - 6px)); }
}

.cc-core-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  margin-bottom: 9px;
  border-radius: 14px;
  background: #efecff;
  color: #6352cf;
}

.cc-knowledge-core span {
  color: #9591a5;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.cc-knowledge-core strong {
  margin-top: 3px;
  color: #302b46;
  font-size: 14px;
}

.cc-knowledge-core small {
  margin-top: 5px;
  color: #9999a9;
  font-size: 7px;
}

.cc-floating {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 11px;
  border: 1px solid rgba(225, 222, 241, .96);
  border-radius: 11px;
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 24px rgba(53, 42, 116, .08);
  color: #5f51c9;
  font-size: 8px;
  font-weight: 800;
}

.cc-floating-one {
  top: 15px;
  right: 6px;
  animation: ccFloatTop 4.5s ease-in-out infinite;
}

.cc-floating-two {
  left: 2px;
  top: 98px;
  animation: ccFloatMiddle 4s ease-in-out infinite;
}

.cc-floating-three {
  right: 6px;
  bottom: 22px;
  animation: ccFloatBottom 5s ease-in-out infinite;
}

@keyframes ccFloatTop {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}

@keyframes ccFloatMiddle {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

@keyframes ccFloatBottom {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(7px); }
}

/* DISCOVERY */

.cc-discovery {
  margin-top: 30px;
}

.cc-discovery-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 17px;
}

.cc-discovery-heading > div:first-child > span {
  display: block;
  margin-bottom: 7px;
  color: #6a5ad2;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.4px;
}

.cc-discovery-heading h2 {
  margin: 0;
  color: #242039;
  font-size: 25px;
  letter-spacing: -.7px;
}

.cc-discovery-heading p {
  margin: 7px 0 0;
  color: #8c8fa1;
  font-size: 11px;
}

.cc-library-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.cc-library-count strong {
  color: #322c4b;
  font-size: 21px;
}

.cc-library-count span {
  color: #999cad;
  font-size: 10px;
}

.cc-search {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.cc-search > svg {
  position: absolute;
  left: 16px;
  color: #878b9e;
}

.cc-search input {
  width: 100%;
  height: 50px;
  padding: 0 48px;
  border: 1px solid #dfddea;
  border-radius: 14px;
  outline: none;
  background: rgba(255,255,255,.9);
  color: #2c2840;
  font-family: inherit;
  font-size: 11px;
  box-shadow: 0 10px 26px rgba(46,35,103,.045);
}

.cc-search input:focus {
  border-color: #aaa0ef;
  box-shadow: 0 10px 28px rgba(91,71,187,.10);
}

.cc-search button {
  position: absolute;
  right: 11px;
  width: 31px;
  height: 31px;
  border: none;
  border-radius: 9px;
  background: #f1effb;
  color: #6b61a1;
  cursor: pointer;
}

.cc-filter-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 17px;
}

.cc-filter-label span {
  color: #9799a9;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1.1px;
}

.cc-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.cc-filter {
  border: 1px solid #dfdeea;
  border-radius: 999px;
  padding: 8px 13px;
  background: #fff;
  color: #7d8092;
  font-family: inherit;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition: .2s ease;
}

.cc-filter:hover {
  transform: translateY(-1px);
  border-color: #cfc8ee;
  color: #5e51c9;
}

.cc-filter.active {
  border-color: transparent;
  background: linear-gradient(135deg,#6958d5,#5141be);
  color: #fff;
  box-shadow: 0 8px 18px rgba(83,65,186,.20);
}

/* CARDS */

.cc-resource-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 17px;
}

.cc-resource-card {
  position: relative;
  overflow: hidden;
  min-height: 250px;
  padding: 21px;
  border: 1px solid #e4e3ed;
  border-radius: 20px;
  background: rgba(255,255,255,.89);
  box-shadow: 0 12px 35px rgba(43,34,92,.055);
  animation: ccCardIn .6s cubic-bezier(.22,1,.36,1) both;
  animation-delay: var(--delay);
  transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
}

.cc-resource-card:hover {
  transform: translateY(-6px);
  border-color: rgba(100,82,210,.20);
  box-shadow: 0 22px 45px rgba(43,34,92,.11);
}

@keyframes ccCardIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cc-card-shine {
  position: absolute;
  width: 150px;
  height: 150px;
  right: -80px;
  top: -80px;
  border-radius: 50%;
  background: rgba(104,84,217,.08);
  filter: blur(3px);
}

.cc-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cc-resource-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #efedff;
  color: #6253cf;
}

.cc-card-top > span {
  color: #999bad;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .9px;
  text-transform: uppercase;
}

.cc-category {
  color: #6453cb;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.cc-resource-card h3 {
  margin: 6px 0 9px;
  color: #2d2942;
  font-size: 17px;
  line-height: 1.32;
}

.cc-resource-card > p {
  margin: 0;
  color: #888b9d;
  font-size: 10.5px;
  line-height: 1.7;
}

.cc-card-divider {
  height: 1px;
  margin: 20px 0 15px;
  background: #eeecf3;
}

.cc-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cc-author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cc-author-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f0eeff;
  color: #6254ce;
  font-size: 9px;
  font-weight: 900;
}

.cc-author div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cc-author span {
  color: #a1a3b0;
  font-size: 7px;
  font-weight: 800;
}

.cc-author strong {
  overflow: hidden;
  max-width: 160px;
  color: #777a8b;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cc-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 13px;
  border: 1px solid #ddd9f2;
  border-radius: 10px;
  background: #faf9ff;
  color: #5c4fc6;
  font-family: inherit;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
  transition: .2s ease;
}

.cc-open:hover {
  transform: translateY(-2px);
  background: #f1eeff;
  box-shadow: 0 8px 17px rgba(82,65,180,.10);
}

/* EMPTY */

.cc-empty {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cc-empty-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #efedff;
  color: #6554cf;
}

.cc-empty h3 {
  margin: 14px 0 5px;
  color: #302c43;
  font-size: 16px;
}

.cc-empty p {
  margin: 0 0 15px;
  color: #9194a4;
  font-size: 10px;
}

.cc-empty button {
  height: 38px;
  padding: 0 15px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg,#6857d5,#5041bb);
  color: #fff;
  font-family: inherit;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

/* VIEWER */

.cc-viewer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  background: rgba(17,15,33,.52);
  backdrop-filter: blur(13px);
  animation: ccFade .2s ease both;
}

@keyframes ccFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cc-viewer {
  width: min(1080px,100%);
  max-height: calc(100vh - 44px);
  overflow: hidden;
  border: 1px solid rgba(230,227,244,.94);
  border-radius: 26px;
  background:
    radial-gradient(circle at 85% 0%,rgba(105,84,217,.08),transparent 25%),
    #fff;
  box-shadow: 0 40px 100px rgba(13,11,36,.27);
  animation: ccViewerIn .35s cubic-bezier(.22,1,.36,1) both;
}

@keyframes ccViewerIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(.975);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cc-viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eceaf2;
}

.cc-viewer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-viewer-brand-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(135deg,#7160df,#5140b8);
  color: white;
}

.cc-viewer-brand div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cc-viewer-brand span {
  color: #9b9cac;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 1.1px;
}

.cc-viewer-brand strong {
  color: #312c45;
  font-size: 10px;
  letter-spacing: .3px;
}

.cc-viewer-close {
  width: 37px;
  height: 37px;
  display: grid;
  place-items: center;
  border: 1px solid #dfdde8;
  border-radius: 10px;
  background: #fbfaff;
  color: #625e70;
  cursor: pointer;
  transition: .2s ease;
}

.cc-viewer-close:hover {
  transform: rotate(5deg);
  background: #efedff;
  color: #5d4fc6;
}

.cc-viewer-content {
  display: grid;
  grid-template-columns: 1.65fr .75fr;
  min-height: 510px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.cc-viewer-content main {
  padding: 32px;
}

.cc-viewer-content aside {
  padding: 28px;
  border-left: 1px solid #eeecf3;
  background: linear-gradient(180deg,#faf9ff,#f5f7fd);
}

.cc-internal-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid #ded8f4;
  border-radius: 999px;
  background: #f7f5ff;
  color: #6756d3;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 1px;
}

.cc-viewer-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin-top: 23px;
  border-radius: 17px;
  background: #efedff;
  color: #6252cf;
}

.cc-viewer-category {
  margin-top: 19px;
  color: #6554ce;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.cc-viewer-content h2 {
  margin: 7px 0 12px;
  color: #242039;
  font-size: 32px;
  line-height: 1.12;
  letter-spacing: -1px;
}

.cc-viewer-description {
  max-width: 690px;
  margin: 0;
  color: #73778a;
  font-size: 12px;
  line-height: 1.75;
}

.cc-viewer-meta {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 10px;
  margin-top: 24px;
}

.cc-viewer-meta > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 13px;
  border: 1px solid #e9e7ef;
  border-radius: 13px;
  background: #fcfcfe;
}

.cc-viewer-meta svg {
  color: #6655d1;
}

.cc-viewer-meta span {
  color: #a1a3b1;
  font-size: 7px;
}

.cc-viewer-meta strong {
  color: #343047;
  font-size: 9px;
}

.cc-viewer-rule {
  height: 1px;
  margin: 24px 0;
  background: #eceaf3;
}

.cc-learning-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #5e50cb;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1.1px;
}

.cc-learning-points {
  display: grid;
  gap: 9px;
  margin-top: 13px;
}

.cc-learning-point {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-learning-point > div {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: #f0eeff;
  color: #6050c9;
  font-size: 9px;
  font-weight: 900;
}

.cc-learning-point span {
  color: #686c7d;
  font-size: 10px;
}

.cc-insight-box {
  display: flex;
  gap: 11px;
  margin-top: 21px;
  padding: 14px;
  border: 1px solid #e4def8;
  border-radius: 14px;
  background: linear-gradient(135deg,#f8f6ff,#fcfcff);
}

.cc-insight-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: #ece8ff;
  color: #6251cf;
}

.cc-insight-box strong {
  display: block;
  margin-bottom: 4px;
  color: #423c57;
  font-size: 10px;
}

.cc-insight-box p {
  margin: 0;
  color: #8a8d9d;
  font-size: 9px;
  line-height: 1.55;
}

/* SIDE */

.cc-side-orbit {
  position: relative;
  width: 235px;
  height: 235px;
  margin: 28px auto 35px;
}

.cc-side-orbit > div {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(101,83,211,.14);
  border-radius: 50%;
  animation: ccSpin 18s linear infinite;
}

.cc-side-orbit > div:nth-child(2) {
  inset: 30px;
  border-style: dashed;
  animation-direction: reverse;
  animation-duration: 12s;
}

.cc-side-core {
  position: absolute !important;
  inset: 50%;
  width: 65px;
  height: 65px;
  transform: translate(-50%,-50%);
  display: grid;
  place-items: center;
  border-radius: 18px !important;
  background: linear-gradient(135deg,#725edf,#5140b9);
  color: white;
  box-shadow: 0 18px 32px rgba(79,61,183,.22);
}

.cc-side-card {
  padding: 17px;
  border: 1px solid #e5e3ed;
  border-radius: 15px;
  background: rgba(255,255,255,.72);
}

.cc-side-card span {
  display: block;
  margin-bottom: 6px;
  color: #999bac;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 1px;
}

.cc-side-card strong {
  color: #39344d;
  font-size: 11px;
}

.cc-side-card p {
  margin: 8px 0 0;
  color: #8e91a1;
  font-size: 9px;
  line-height: 1.6;
}

.cc-viewer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 24px;
  border-top: 1px solid #eceaf2;
}

.cc-viewer-footer div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cc-viewer-footer span {
  color: #a0a2b0;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .9px;
}

.cc-viewer-footer strong {
  color: #696c7d;
  font-size: 9px;
}

.cc-viewer-footer button {
  height: 37px;
  padding: 0 15px;
  border: 1px solid #ddd9eb;
  border-radius: 10px;
  background: #fff;
  color: #575267;
  font-family: inherit;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .cc-knowledge-hero {
    min-height: auto;
    padding: 32px;
  }

  .cc-knowledge-visual {
    display: none;
  }

  .cc-resource-grid {
    grid-template-columns: 1fr;
  }

  .cc-viewer-content {
    grid-template-columns: 1fr;
  }

  .cc-viewer-content aside {
    display: none;
  }
}

@media (max-width: 650px) {
  .cc-knowledge-hero {
    padding: 25px;
  }

  .cc-hero-left h1 {
    font-size: 35px;
  }

  .cc-hero-metrics {
    gap: 16px;
  }

  .cc-discovery-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .cc-filter-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .cc-viewer-backdrop {
    padding: 10px;
  }

  .cc-viewer {
    max-height: calc(100vh - 20px);
    border-radius: 20px;
  }

  .cc-viewer-content main {
    padding: 23px;
  }

  .cc-viewer-content h2 {
    font-size: 25px;
  }

  .cc-viewer-meta {
    grid-template-columns: 1fr;
  }

  .cc-viewer-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

export default KnowledgeHub;
