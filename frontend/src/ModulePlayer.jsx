import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  Layers3,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

import "./ModulePlayer.css";

const LESSON_CONTENT = {
  "Getting Started with SQL": {
    eyebrow: "SQL FUNDAMENTALS • LESSON 1",
    title: "Getting Started with SQL",
    description:
      "Build a strong mental model of relational databases and learn how SQL turns business questions into structured answers.",
    sections: [
      {
        title: "What is a database?",
        paragraphs: [
          "A database is an organised collection of information designed to be stored, searched, updated and retrieved efficiently.",
          "In an organisation, information quickly becomes too large and interconnected to manage reliably using individual documents or spreadsheets. A database gives that information structure and makes relationships between records explicit.",
          "For example, a company may need to store employees, departments, courses, enrolments and assessment results. A relational database can store these records in separate but connected tables."
        ],
        note:
          "Think of a database as the system of record. SQL is the language you use to ask that system questions."
      },
      {
        title: "Tables, rows and columns",
        paragraphs: [
          "Relational databases organise information into tables. Each table represents a type of entity, such as employees, customers, products or courses.",
          "A row represents one record. A column represents one attribute of that record.",
          "For example, an employees table could contain employee_id, name, department and job_title. One row would represent one employee."
        ],
        table: {
          headers: ["employee_id", "name", "department"],
          rows: [
            ["101", "Aarav", "Finance"],
            ["102", "Meera", "Technology"],
            ["103", "Kabir", "HR"]
          ]
        }
      },
      {
        title: "How SQL fits into the picture",
        paragraphs: [
          "SQL stands for Structured Query Language. It allows people and applications to communicate with relational databases.",
          "A business question such as “Which employees completed the most training?” must be translated into a series of database operations. SQL provides the vocabulary for doing this.",
          "A typical workflow is: identify the relevant data, select the records you need, filter them, organise or summarise them, and finally interpret the result."
        ],
        workflow: [
          "Define the business question",
          "Identify the relevant table or tables",
          "Select the fields required",
          "Filter unnecessary records",
          "Aggregate or organise the information",
          "Interpret the result"
        ]
      },
      {
        title: "Your first SQL query",
        paragraphs: [
          "The SELECT statement is one of the most important building blocks in SQL. It tells the database which columns you want returned.",
          "The FROM clause identifies the table from which those columns should be retrieved."
        ],
        code: `SELECT name, department
FROM employees;`,
        example:
          "This query asks the database to return the name and department columns from the employees table."
      },
      {
        title: "Business example",
        paragraphs: [
          "Imagine the HR team wants a list of employees and the departments they belong to. Instead of manually opening hundreds of records, a SQL query can retrieve exactly the required fields.",
          "The value of SQL is not simply that it is faster than manual lookup. It is that the same question can be expressed precisely, repeated consistently and combined with much more advanced analysis."
        ],
        note:
          "Good SQL begins with a clear question. Do not start writing syntax before deciding what answer the business actually needs."
      }
    ]
  },

  "SELECT, FROM & WHERE": {
    eyebrow: "SQL FUNDAMENTALS • LESSON 2",
    title: "SELECT, FROM & WHERE",
    description:
      "Learn how to retrieve exactly the fields and records you need from a relational table.",
    sections: [
      {
        title: "Choosing columns with SELECT",
        paragraphs: [
          "SELECT controls which columns appear in the result. You can request one column, several columns, or every column in a table.",
          "Selecting only the fields required makes your query easier to read and often makes the result easier to interpret."
        ],
        code: `SELECT name, department
FROM employees;`
      },
      {
        title: "Choosing the source with FROM",
        paragraphs: [
          "FROM tells SQL where the requested information lives.",
          "A useful way to read a simple query is: “Show me these columns FROM this table.”"
        ],
        example:
          "SELECT name, department FROM employees means: return the employee name and department from the employees table."
      },
      {
        title: "Filtering records with WHERE",
        paragraphs: [
          "WHERE limits the rows returned by a query. Instead of retrieving every record, you define a condition that must be true.",
          "This is essential when working with large business datasets because a database may contain millions of records."
        ],
        code: `SELECT name
FROM employees
WHERE department = 'Finance';`
      },
      {
        title: "Combining conditions",
        paragraphs: [
          "Conditions can be combined using AND and OR. AND requires both conditions to be true. OR requires at least one condition to be true.",
          "Parentheses are useful when a query contains several conditions because they make the intended logic explicit."
        ],
        code: `SELECT name
FROM employees
WHERE department = 'Finance'
  AND status = 'Active';`
      },
      {
        title: "Practical habit",
        paragraphs: [
          "Before running a query, read it like a sentence. Ask yourself what records it will return and whether the result matches the business question.",
          "A large number of SQL mistakes are logical mistakes rather than syntax mistakes."
        ],
        note:
          "A query can be perfectly valid SQL and still answer the wrong business question."
      }
    ]
  },

  "GROUP BY, HAVING & COUNT": {
    eyebrow: "SQL FUNDAMENTALS • LESSON 3",
    title: "GROUP BY, HAVING & COUNT",
    description:
      "Move from individual records to meaningful summaries using grouping and aggregate functions.",
    sections: [
      {
        title: "Why aggregation matters",
        paragraphs: [
          "Business reporting rarely stops at individual rows. Managers often need summaries such as the number of employees in each department or the number of courses completed by each team.",
          "Aggregate functions allow SQL to turn many records into useful measurements."
        ],
        workflow: [
          "Identify the dimension you want to compare",
          "Choose the measure you want to calculate",
          "Group records by the chosen dimension",
          "Apply the aggregate function"
        ]
      },
      {
        title: "COUNT and other aggregate functions",
        paragraphs: [
          "COUNT measures how many records or non-null values meet the query conditions.",
          "Other common aggregate functions include SUM, AVG, MIN and MAX."
        ],
        code: `SELECT COUNT(*) AS employee_count
FROM employees;`
      },
      {
        title: "GROUP BY",
        paragraphs: [
          "GROUP BY creates a separate group for each distinct value in a selected column.",
          "For example, grouping by department allows you to count employees department by department instead of producing one total for the whole company."
        ],
        code: `SELECT department,
       COUNT(*) AS employee_count
FROM employees
GROUP BY department;`
      },
      {
        title: "HAVING vs WHERE",
        paragraphs: [
          "WHERE filters individual rows before grouping takes place.",
          "HAVING filters groups after aggregation has been calculated.",
          "This distinction is one of the most important concepts to understand when writing analytical SQL."
        ],
        code: `SELECT department,
       COUNT(*) AS employee_count
FROM employees
GROUP BY department
HAVING COUNT(*) >= 10;`
      },
      {
        title: "Real-world application",
        paragraphs: [
          "Suppose the learning team wants to identify departments with at least ten employees enrolled in a development programme. GROUP BY can create the departmental groups, COUNT can measure participation, and HAVING can keep only departments meeting the threshold."
        ],
        note:
          "Remember: WHERE filters rows. HAVING filters grouped results."
      }
    ]
  },

  "ORDER BY": {
    eyebrow: "SQL FUNDAMENTALS • LESSON 4",
    title: "ORDER BY",
    description:
      "Control how query results are presented so the most useful records appear first.",
    sections: [
      {
        title: "Why ordering matters",
        paragraphs: [
          "Databases do not guarantee a meaningful display order unless you explicitly request one.",
          "ORDER BY lets you sort results by one or more columns."
        ],
        code: `SELECT name, score
FROM assessments
ORDER BY score DESC;`
      },
      {
        title: "Ascending and descending order",
        paragraphs: [
          "ASC sorts values from smaller to larger or alphabetically from A to Z.",
          "DESC reverses that order. For scores, descending order is often useful when looking for the strongest results first."
        ]
      },
      {
        title: "Sorting by multiple fields",
        paragraphs: [
          "You can sort by more than one column. SQL applies the first ordering rule, and then uses the next rule to break ties.",
          "This is useful when many records share the same primary value."
        ],
        code: `SELECT department, name, score
FROM assessments
ORDER BY department ASC,
         score DESC;`
      },
      {
        title: "Business example",
        paragraphs: [
          "A learning manager may want employees shown by department, with the highest assessment score appearing first inside each department.",
          "A carefully designed ORDER BY clause makes the output immediately useful to a human reader."
        ]
      }
    ]
  },

  "AS & WITH": {
    eyebrow: "SQL FUNDAMENTALS • LESSON 5",
    title: "AS & WITH",
    description:
      "Make analytical SQL easier to read with aliases and common table expressions.",
    sections: [
      {
        title: "Column aliases with AS",
        paragraphs: [
          "Aliases give a temporary, readable name to an output column.",
          "This is especially useful when a calculated expression would otherwise produce a technical or confusing heading."
        ],
        code: `SELECT COUNT(*) AS total_employees
FROM employees;`
      },
      {
        title: "Table aliases",
        paragraphs: [
          "Aliases can also be used for tables. This becomes particularly valuable when queries involve several related tables.",
          "Short aliases reduce repetition and make joins easier to read."
        ],
        code: `SELECT e.name
FROM employees AS e;`
      },
      {
        title: "Why WITH is useful",
        paragraphs: [
          "The WITH clause creates a common table expression, often called a CTE.",
          "A CTE lets you define a temporary named result and then reference it in the main query. This can make complex analytical logic much easier to understand."
        ],
        code: `WITH active_employees AS (
  SELECT *
  FROM employees
  WHERE status = 'Active'
)
SELECT COUNT(*) AS total_active
FROM active_employees;`
      },
      {
        title: "Readable SQL is professional SQL",
        paragraphs: [
          "As queries grow, readability becomes a major engineering concern. Meaningful aliases and clearly separated query stages make SQL easier to review, debug and maintain.",
          "In professional environments, code is written for the next person who has to understand it as well as for the database engine."
        ],
        note:
          "Use aliases to improve communication, not simply to make queries shorter."
      }
    ]
  },

  "Joining Data": {
    eyebrow: "SQL FUNDAMENTALS • LESSON 6",
    title: "Joining Data",
    description:
      "Connect related tables so you can answer questions that require information from more than one source.",
    sections: [
      {
        title: "Why databases use multiple tables",
        paragraphs: [
          "Relational databases often store different types of information in separate tables rather than putting everything into one enormous table.",
          "This reduces unnecessary duplication and allows related entities to be managed independently."
        ],
        example:
          "An employees table can store employee details while an enrollments table stores which courses those employees have joined."
      },
      {
        title: "The idea behind a JOIN",
        paragraphs: [
          "A JOIN connects rows from two tables using related fields.",
          "A common pattern is to connect a primary key in one table with a matching foreign key in another."
        ],
        code: `SELECT e.name, en.course_id
FROM employees AS e
JOIN enrollments AS en
  ON e.employee_id = en.employee_id;`
      },
      {
        title: "INNER JOIN",
        paragraphs: [
          "An INNER JOIN returns rows where a match exists in both participating tables.",
          "It is appropriate when your analysis should include only records that have a valid relationship in both sources."
        ]
      },
      {
        title: "LEFT JOIN",
        paragraphs: [
          "A LEFT JOIN keeps every row from the left table and adds matching information from the right table when available.",
          "This is useful when you want to identify records with no corresponding activity."
        ],
        code: `SELECT e.name, en.course_id
FROM employees AS e
LEFT JOIN enrollments AS en
  ON e.employee_id = en.employee_id;`
      },
      {
        title: "Think in relationships",
        paragraphs: [
          "The most important skill in joining tables is not memorising syntax. It is understanding how the entities in the database relate to each other.",
          "Before writing a JOIN, identify what each table represents, which field connects them, and whether unmatched records should be retained."
        ],
        note:
          "Good joins start with a correct data model."
      }
    ]
  }
};

function getContent(moduleTitle) {
  return (
    LESSON_CONTENT[moduleTitle] ||
    LESSON_CONTENT["Getting Started with SQL"]
  );
}

export default function ModulePlayer({
  course,
  user,
  module,
  modules = [],
  onBack,
  onSelectModule,
}) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const safeModules = useMemo(
    () => (Array.isArray(modules) ? modules : []),
    [modules]
  );

  const currentIndex = Math.max(
    0,
    safeModules.findIndex((item) => item.id === module?.id)
  );

  const content = getContent(module?.title);
  const sections = content.sections || [];
  const section = sections[sectionIndex] || sections[0];

  useEffect(() => {
    setSectionIndex(0);
    setCompleted(false);
  }, [module?.id]);

  const progress =
    safeModules.length > 0
      ? Math.round(((currentIndex + 1) / safeModules.length) * 100)
      : 0;

  const isLastSection = sectionIndex === sections.length - 1;

  async function markComplete() {
    if (!module?.id || !user?.user_id || saving) return;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/modules/${module.id}/complete?user_id=${user.user_id}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Unable to mark module complete:", error);
    } finally {
      setSaving(false);
    }
  }

  function goNextSection() {
    if (!isLastSection) {
      setSectionIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!completed) {
      markComplete();
    }
  }

  return (
    <div className="module-player">
      {/* TOP BAR */}
      <header className="module-player-topbar">
        <button className="module-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          <span>Back to course</span>
        </button>

        <div className="module-topbar-course">
          <span>{course?.title || "Course"}</span>
          <span className="module-topbar-separator">•</span>
          <strong>
            Module {currentIndex + 1} of {safeModules.length || 1}
          </strong>
        </div>

        <div className="module-topbar-progress">
          <span>Course progress</span>

          <strong>{progress}%</strong>

          <div className="module-topbar-track">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="module-player-body">
        {/* CURRICULUM */}
        <aside className="module-curriculum">
          <div className="curriculum-header">
            <div className="curriculum-icon">
              <Layers3 size={19} />
            </div>

            <div>
              <span>COURSE CONTENT</span>
              <strong>{safeModules.length} modules</strong>
            </div>
          </div>

          <div className="curriculum-progress">
            <div className="curriculum-progress-top">
              <span>Your progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="curriculum-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="curriculum-list">
            {safeModules.map((item, index) => {
              const active = item.id === module?.id;
              const past = index < currentIndex;

              return (
                <button
                  key={item.id}
                  className={`curriculum-item ${active ? "active" : ""
                    } ${past ? "past" : ""}`}
                  onClick={() => {
                    if (item.id !== module?.id && onSelectModule) {
                      onSelectModule(item);
                    }
                  }}
                >
                  <div className="curriculum-number">
                    {past ? (
                      <Check size={14} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>

                  <div className="curriculum-item-main">
                    <strong>{item.title}</strong>

                    <span>
                      <Clock3 size={12} />
                      {item.duration}
                    </span>
                  </div>

                  {active && (
                    <ChevronRight
                      size={16}
                      className="curriculum-active-arrow"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* LESSON */}
        <main className="lesson-reader">
          <div className="lesson-reader-inner">
            <div className="lesson-eyebrow">
              <Sparkles size={14} />
              {content.eyebrow}
            </div>

            <div className="lesson-heading-row">
              <div>
                <h1>{content.title}</h1>

                <p className="lesson-description">
                  {content.description}
                </p>
              </div>

              <div className="lesson-time-card">
                <Clock3 size={17} />
                <span>{module?.duration || "30 min"}</span>
              </div>
            </div>

            <div className="lesson-stepper">
              <div className="lesson-stepper-left">
                <span>Lesson section</span>
                <strong>
                  {sectionIndex + 1} / {sections.length}
                </strong>
              </div>

              <div className="lesson-stepper-track">
                <div
                  style={{
                    width: `${((sectionIndex + 1) / sections.length) * 100
                      }%`,
                  }}
                />
              </div>
            </div>

            <article className="lesson-card">
              <div className="lesson-card-icon">
                {sectionIndex === 0 ? (
                  <Database size={20} />
                ) : (
                  <FileText size={20} />
                )}
              </div>

              <div className="lesson-card-label">
                LESSON SECTION
              </div>

              <h2>{section.title}</h2>

              {section.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {section.note && (
                <div className="lesson-note">
                  <Target size={18} />
                  <div>
                    <strong>Key idea</strong>
                    <span>{section.note}</span>
                  </div>
                </div>
              )}

              {section.workflow && (
                <div className="lesson-workflow">
                  <h3>Typical workflow</h3>

                  <div className="workflow-list">
                    {section.workflow.map((item, index) => (
                      <div className="workflow-item" key={index}>
                        <span>{index + 1}</span>
                        <strong>{item}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section.table && (
                <div className="lesson-table-card">
                  <table>
                    <thead>
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {section.table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.code && (
                <div className="lesson-code-card">
                  <div className="code-card-top">
                    <span>SQL EXAMPLE</span>
                    <span>Editable concept</span>
                  </div>

                  <pre>{section.code}</pre>
                </div>
              )}

              {section.example && (
                <div className="lesson-example-card">
                  <div className="example-icon">
                    <PlayCircle size={19} />
                  </div>

                  <div>
                    <span>REAL-WORLD EXAMPLE</span>
                    <p>{section.example}</p>
                  </div>
                </div>
              )}
            </article>

            <div className="lesson-navigation">
              <button
                className="lesson-nav secondary"
                disabled={sectionIndex === 0}
                onClick={() =>
                  setSectionIndex((value) =>
                    Math.max(0, value - 1)
                  )
                }
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <div className="lesson-navigation-center">
                <span>
                  {sectionIndex + 1} of {sections.length} sections
                </span>
              </div>

              {!isLastSection ? (
                <button
                  className="lesson-nav primary"
                  onClick={goNextSection}
                >
                  Next section
                  <ArrowRight size={15} />
                </button>
              ) : !completed ? (
                <button
                  className="lesson-nav primary"
                  disabled={saving}
                  onClick={markComplete}
                >
                  <CheckCircle2 size={16} />
                  {saving ? "Saving..." : "Mark lesson complete"}
                </button>
              ) : (
                <button className="lesson-nav completed" disabled>
                  <CheckCircle2 size={16} />
                  Completed
                </button>
              )}
            </div>

            {completed && (
              <div className="lesson-complete-banner">
                <div className="complete-banner-icon">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <strong>Lesson completed</strong>
                  <span>
                    Your course progress has been updated. Continue
                    to the next module from the curriculum.
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
