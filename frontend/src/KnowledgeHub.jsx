import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Video,
  Link2,
  Sparkles,
  ArrowUpRight,
  X,
} from "lucide-react";

import "./KnowledgeHub.css";

function KnowledgeHub({ user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/knowledge"
        );

        const data = await response.json();

        setResources(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to load knowledge resources:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        resources
          .map((resource) => resource.category)
          .filter(Boolean)
      ),
    ];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.title?.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.category?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" ||
        resource.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [resources, searchTerm, category]);

  const getIcon = (type) => {
    const value = type?.toLowerCase();

    if (value?.includes("video")) {
      return <Video size={20} />;
    }

    if (
      value?.includes("link") ||
      value?.includes("web")
    ) {
      return <Link2 size={20} />;
    }

    return <FileText size={20} />;
  };

  if (loading) {
    return (
      <div className="knowledge-page knowledge-loading">
        <div className="knowledge-loader"></div>

        <h2>Opening the knowledge hub...</h2>

        <p>
          Gathering organizational knowledge and resources.
        </p>
      </div>
    );
  }

  return (
    <div className="knowledge-page">

      {/* HERO */}

      <section className="knowledge-hero">

        <div className="knowledge-hero-copy">

          <div className="knowledge-eyebrow">
            <Sparkles size={14} />
            ORGANIZATIONAL KNOWLEDGE HUB
          </div>

          <h1>
            Knowledge should
            <span> move with people.</span>
          </h1>

          <p>
            Discover policies, guides, best practices and shared
            organizational knowledge in one centralized space.
          </p>

        </div>


        <div className="knowledge-visual">

          <div className="knowledge-orbit orbit-a"></div>
          <div className="knowledge-orbit orbit-b"></div>

          <div className="knowledge-core">
            <BookOpen size={29} />
          </div>

          <div className="knowledge-float float-a">
            <FileText size={15} />
          </div>

          <div className="knowledge-float float-b">
            <Sparkles size={15} />
          </div>

        </div>

      </section>


      {/* SEARCH */}

      <section className="knowledge-toolbar">

        <div className="knowledge-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search policies, guides, best practices..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          {searchTerm && (
            <button
              className="knowledge-clear"
              onClick={() => setSearchTerm("")}
            >
              <X size={14} />
            </button>
          )}

        </div>

      </section>


      {/* FILTERS */}

      <section className="knowledge-filters">

        <span>
          Browse by category
        </span>

        <div>

          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "knowledge-filter active"
                  : "knowledge-filter"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>

      </section>


      {/* RESULTS */}

      <section className="knowledge-results-header">

        <div>
          <span>SHARED KNOWLEDGE</span>

          <h2>
            Explore resources
          </h2>
        </div>

        <strong>
          {filteredResources.length}{" "}
          {filteredResources.length === 1
            ? "resource"
            : "resources"}
        </strong>

      </section>


      {filteredResources.length === 0 ? (

        <div className="knowledge-empty">

          <div className="knowledge-empty-icon">
            <Search size={24} />
          </div>

          <h3>
            No resources found
          </h3>

          <p>
            Try another search term or category.
          </p>

        </div>

      ) : (

        <section className="knowledge-grid">

          {filteredResources.map(
            (resource, index) => (

              <article
                className="knowledge-card"
                key={resource.id || index}
                style={{
                  "--knowledge-delay": `${index * 80}ms`,
                }}
              >

                <div className="knowledge-card-top">

                  <div className="knowledge-resource-icon">
                    {getIcon(resource.resource_type)}
                  </div>

                  <span>
                    {resource.resource_type ||
                      "Resource"}
                  </span>

                </div>


                <div className="knowledge-card-category">
                  {resource.category ||
                    "Organizational knowledge"}
                </div>


                <h3>
                  {resource.title}
                </h3>


                <p>
                  {resource.description}
                </p>


                <div className="knowledge-card-footer">

                  <div className="knowledge-author">
                    <div>
                      {resource.author
                        ?.charAt(0)
                        .toUpperCase() || "C"}
                    </div>

                    <span>
                      {resource.author || "Capacity Connect"}
                    </span>
                  </div>


                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="knowledge-open"
                  >
                    Open
                    <ArrowUpRight size={14} />
                  </a>

                </div>

              </article>

            )
          )}

        </section>

      )}

    </div>
  );
}

export default KnowledgeHub;