from .database import Base, engine, SessionLocal
from .schemas import LoginRequest
from .models import (
    User,
    Course,
    Enrollment,
    Module,
    ModuleCompletion,
    QuizQuestion,
    QuizResult,
    Competency,
    UserCompetency,
    KnowledgeResource,
)
import hashlib
import hmac
import os

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.auth import hash_password


def hash_password(password: str) -> str:
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode("ascii")
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000,
    )
    return salt.decode("ascii") + ":" + derived_key.hex()


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, expected_hash = stored_hash.split(":", 1)
        derived_key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("ascii"),
            100000,
        )
        return hmac.compare_digest(derived_key.hex(), expected_hash)
    except (ValueError, TypeError):
        return False


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Capacity Connect")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Welcome to Capacity Connect"
    }


@app.post("/register")
def register(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }

    new_user = User(
        name=name,
        email=email,
        password=hash_password(password),
        role="employee"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user_id": new_user.id
    }


@app.post("/create-admin")
def create_admin(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        return {"message": "User already exists"}

    admin = User(
        name=name,
        email=email,
        password=hash_password(password),
        role="admin"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "message": "Admin created successfully",
        "user_id": admin.id,
        "role": admin.role
    }


@app.post("/make-admin")
def make_admin(
    email: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return {"message": "User not found"}

    user.role = "admin"
    db.commit()
    db.refresh(user)

    return {
        "message": "User promoted to admin",
        "email": user.email,
        "role": user.role
    }


@app.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:
        return {
            "message": "Invalid email or password"
        }

    if not verify_password(login_data.password, user.password):
        return {
            "message": "Invalid email or password"
        }

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "role": user.role
    }


@app.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()

    return courses


@app.post("/courses/seed")
def seed_courses(db: Session = Depends(get_db)):

    existing_courses = db.query(Course).count()

    if existing_courses > 0:
        return {
            "message": "Courses already exist"
        }

    courses = [
        Course(
            title="Data Analysis Fundamentals",
            description="Learn the fundamentals of data analysis and visualization.",
            category="Data & Analytics",
            difficulty="Beginner",
            duration="4 hours"
        ),
        Course(
            title="SQL Essentials",
            description="Learn how to work with organizational data using SQL.",
            category="Technology",
            difficulty="Beginner",
            duration="3 hours"
        ),
        Course(
            title="Effective Communication",
            description="Develop stronger communication and collaboration skills.",
            category="Professional Skills",
            difficulty="Intermediate",
            duration="2.5 hours"
        ),
        Course(
            title="Leadership Essentials",
            description="Develop leadership, decision-making and team skills.",
            category="Leadership",
            difficulty="Intermediate",
            duration="5 hours"
        ),
    ]

    db.add_all(courses)
    db.commit()

    return {
        "message": "Courses created successfully"
    }


@app.post("/enroll")
def enroll(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db)
):
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course_id
    ).first()

    if existing:
        return {
            "message": "Already enrolled"
        }

    enrollment = Enrollment(
        user_id=user_id,
        course_id=course_id,
        progress=0,
        status="enrolled"
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "message": "Enrollment successful",
        "enrollment_id": enrollment.id,
        "course_id": enrollment.course_id,
        "progress": enrollment.progress
    }


@app.get("/my-learning")
def my_learning(
    user_id: int,
    db: Session = Depends(get_db)
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == user_id
    ).all()

    result = []

    for enrollment in enrollments:
        course = db.query(Course).filter(
            Course.id == enrollment.course_id
        ).first()

        if course:
            result.append({
                "enrollment_id": enrollment.id,
                "course_id": course.id,
                "title": course.title,
                "description": course.description,
                "category": course.category,
                "difficulty": course.difficulty,
                "duration": course.duration,
                "progress": enrollment.progress,
                "status": enrollment.status
            })

    return result


@app.get("/courses/{course_id}/modules")
def get_course_modules(
    course_id: int,
    db: Session = Depends(get_db)
):
    modules = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.order)
        .all()
    )

    return modules


@app.post("/modules/seed")
def seed_modules(db: Session = Depends(get_db)):

    existing_modules = db.query(Module).count()

    if existing_modules > 0:
        return {
            "message": "Modules already exist"
        }

    modules = [
        Module(
            course_id=1,
            title="Introduction to Data Analysis",
            description="Understand what data analysis is and how organizations use data.",
            duration="25 min",
            order=1
        ),
        Module(
            course_id=1,
            title="Understanding Data",
            description="Learn about datasets, variables, data types and data quality.",
            duration="30 min",
            order=2
        ),
        Module(
            course_id=1,
            title="Data Visualization",
            description="Learn how to communicate insights using effective visualizations.",
            duration="35 min",
            order=3
        ),
        Module(
            course_id=1,
            title="Practical Data Analysis",
            description="Apply the concepts to a practical organizational scenario.",
            duration="40 min",
            order=4
        ),

        Module(
            course_id=2,
            title="Introduction to SQL",
            description="Understand databases, tables, rows and SQL queries.",
            duration="25 min",
            order=1
        ),
        Module(
            course_id=2,
            title="SELECT and Filtering",
            description="Learn how to retrieve and filter data using SQL.",
            duration="30 min",
            order=2
        ),
        Module(
            course_id=2,
            title="Sorting and Aggregation",
            description="Use sorting, grouping and aggregation to analyze data.",
            duration="35 min",
            order=3
        ),
        Module(
            course_id=2,
            title="Practical SQL",
            description="Solve real-world organizational data problems using SQL.",
            duration="40 min",
            order=4
        ),

        Module(
            course_id=3,
            title="Communication Fundamentals",
            description="Understand the principles of effective workplace communication.",
            duration="20 min",
            order=1
        ),
        Module(
            course_id=3,
            title="Listening and Collaboration",
            description="Develop stronger listening and collaborative communication skills.",
            duration="25 min",
            order=2
        ),
        Module(
            course_id=3,
            title="Presentation Skills",
            description="Learn how to present ideas clearly and confidently.",
            duration="30 min",
            order=3
        ),
        Module(
            course_id=3,
            title="Communication in Practice",
            description="Apply effective communication strategies to workplace scenarios.",
            duration="35 min",
            order=4
        ),

        Module(
            course_id=4,
            title="Leadership Fundamentals",
            description="Understand the foundations of effective leadership.",
            duration="30 min",
            order=1
        ),
        Module(
            course_id=4,
            title="Decision Making",
            description="Learn practical approaches to organizational decision making.",
            duration="35 min",
            order=2
        ),
        Module(
            course_id=4,
            title="Building High Performing Teams",
            description="Learn how leaders develop effective and collaborative teams.",
            duration="40 min",
            order=3
        ),
        Module(
            course_id=4,
            title="Leadership in Practice",
            description="Apply leadership principles to realistic workplace situations.",
            duration="45 min",
            order=4
        ),
    ]

    db.add_all(modules)
    db.commit()

    return {
        "message": "Modules created successfully"
    }


@app.post("/modules/{module_id}/complete")
def complete_module(
    module_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    module = db.query(Module).filter(
        Module.id == module_id
    ).first()

    if not module:
        return {
            "message": "Module not found"
        }

    existing_completion = db.query(ModuleCompletion).filter(
        ModuleCompletion.user_id == user_id,
        ModuleCompletion.module_id == module_id
    ).first()

    if not existing_completion:
        completion = ModuleCompletion(
            user_id=user_id,
            module_id=module_id,
            completed=1
        )

        db.add(completion)

    # Get all modules in this course
    total_modules = db.query(Module).filter(
        Module.course_id == module.course_id
    ).count()

    # Get completed modules for this user and course
    completed_modules = (
        db.query(ModuleCompletion)
        .join(
            Module,
            Module.id == ModuleCompletion.module_id
        )
        .filter(
            ModuleCompletion.user_id == user_id,
            Module.course_id == module.course_id,
            ModuleCompletion.completed == 1
        )
        .count()
    )

    if total_modules > 0:
        progress = round(
            (completed_modules / total_modules) * 100
        )
    else:
        progress = 0

    # Update enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.course_id == module.course_id
    ).first()

    if enrollment:
        enrollment.progress = progress

        if progress >= 100:
            enrollment.status = "completed"
        else:
            enrollment.status = "in_progress"
    else:
        enrollment = Enrollment(
            user_id=user_id,
            course_id=module.course_id,
            progress=progress,
            status=(
                "completed"
                if progress >= 100
                else "in_progress"
            )
        )

        db.add(enrollment)

    db.commit()

    return {
        "message": "Module completed successfully",
        "course_id": module.course_id,
        "module_id": module_id,
        "completed_modules": completed_modules,
        "total_modules": total_modules,
        "progress": progress,
        "status": enrollment.status
    }


@app.post("/quiz/seed")
def seed_quiz(db: Session = Depends(get_db)):

    # Prevent duplicate seeding
    existing_questions = db.query(QuizQuestion).count()

    if existing_questions > 0:
        return {
            "message": "Quiz questions already seeded",
            "count": existing_questions
        }

    questions = [

        # ==================================================
        # COURSE 1 — DATA ANALYSIS
        # ==================================================

        QuizQuestion(
            course_id=1,
            question="Which chart is commonly used to show trends over time?",
            option_a="Pie chart",
            option_b="Line chart",
            option_c="Scatter plot",
            option_d="Histogram",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=1,
            question="What does data cleaning primarily involve?",
            option_a="Deleting the database",
            option_b="Improving data quality",
            option_c="Creating presentations",
            option_d="Writing emails",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=1,
            question="Which measure represents the middle value of ordered data?",
            option_a="Mean",
            option_b="Mode",
            option_c="Median",
            option_d="Range",
            correct_option="C"
        ),

        QuizQuestion(
            course_id=1,
            question="What is an outlier?",
            option_a="A repeated value",
            option_b="An unusually different observation",
            option_c="A missing column",
            option_d="A data type",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=1,
            question="What is the purpose of data visualization?",
            option_a="Hide information",
            option_b="Make patterns easier to understand",
            option_c="Delete incorrect rows",
            option_d="Increase file size",
            correct_option="B"
        ),


        # ==================================================
        # COURSE 2 — SQL / DIGITAL SKILLS
        # ==================================================

        QuizQuestion(
            course_id=2,
            question="Which SQL command is used to retrieve data?",
            option_a="SELECT",
            option_b="DELETE",
            option_c="UPDATE",
            option_d="DROP",
            correct_option="A"
        ),

        QuizQuestion(
            course_id=2,
            question="Which SQL clause filters rows?",
            option_a="ORDER BY",
            option_b="WHERE",
            option_c="GROUP BY",
            option_d="JOIN",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=2,
            question="Which key uniquely identifies a row?",
            option_a="Foreign key",
            option_b="Primary key",
            option_c="Duplicate key",
            option_d="Sort key",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=2,
            question="Which command adds a new row to a table?",
            option_a="INSERT",
            option_b="CREATE",
            option_c="ALTER",
            option_d="MERGE",
            correct_option="A"
        ),

        QuizQuestion(
            course_id=2,
            question="Which SQL operation combines data from multiple tables?",
            option_a="JOIN",
            option_b="FILTER",
            option_c="SORT",
            option_d="COUNT",
            correct_option="A"
        ),


        # ==================================================
        # COURSE 3 — COMMUNICATION
        # ==================================================

        QuizQuestion(
            course_id=3,
            question="Which is an important part of active listening?",
            option_a="Interrupting frequently",
            option_b="Ignoring the speaker",
            option_c="Paying attention and clarifying",
            option_d="Changing the topic",
            correct_option="C"
        ),

        QuizQuestion(
            course_id=3,
            question="Which communication style is generally most effective at work?",
            option_a="Aggressive",
            option_b="Passive",
            option_c="Clear and respectful",
            option_d="Avoidant",
            correct_option="C"
        ),

        QuizQuestion(
            course_id=3,
            question="What should a professional email subject line be?",
            option_a="Vague",
            option_b="Clear and specific",
            option_c="Very long",
            option_d="Empty",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=3,
            question="What is constructive feedback intended to do?",
            option_a="Blame someone",
            option_b="Help improve performance",
            option_c="Avoid communication",
            option_d="Create conflict",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=3,
            question="Which skill helps resolve workplace misunderstandings?",
            option_a="Clarification",
            option_b="Assumption",
            option_c="Silence",
            option_d="Avoidance",
            correct_option="A"
        ),


        # ==================================================
        # COURSE 4 — LEADERSHIP
        # ==================================================

        QuizQuestion(
            course_id=4,
            question="What is a key responsibility of a leader?",
            option_a="Avoid decisions",
            option_b="Guide and support the team",
            option_c="Work alone",
            option_d="Ignore feedback",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=4,
            question="What does effective delegation involve?",
            option_a="Giving every task to one person",
            option_b="Assigning responsibilities appropriately",
            option_c="Avoiding accountability",
            option_d="Doing everything yourself",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=4,
            question="Which quality supports effective leadership?",
            option_a="Poor communication",
            option_b="Adaptability",
            option_c="Avoiding responsibility",
            option_d="Micromanagement",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=4,
            question="Why is feedback important for leaders?",
            option_a="It supports improvement",
            option_b="It creates confusion",
            option_c="It removes accountability",
            option_d="It prevents learning",
            correct_option="A"
        ),

        QuizQuestion(
            course_id=4,
            question="What helps a team work toward a common goal?",
            option_a="Unclear expectations",
            option_b="Shared objectives",
            option_c="Lack of communication",
            option_d="Individual priorities only",
            correct_option="B"
        ),
    ]

    db.add_all(questions)
    db.commit()

    return {
        "message": "Quiz questions seeded successfully",
        "count": len(questions)
    }


@app.post("/quiz/seed-all")
def seed_all_quizzes(db: Session = Depends(get_db)):

    additional_questions = [

        # SQL
        QuizQuestion(
            course_id=2,
            question="Which SQL command is used to retrieve data?",
            option_a="SELECT",
            option_b="DELETE",
            option_c="UPDATE",
            option_d="DROP",
            correct_option="A"
        ),

        QuizQuestion(
            course_id=2,
            question="Which SQL clause filters rows?",
            option_a="ORDER BY",
            option_b="WHERE",
            option_c="GROUP BY",
            option_d="JOIN",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=2,
            question="Which key uniquely identifies a row?",
            option_a="Foreign key",
            option_b="Primary key",
            option_c="Duplicate key",
            option_d="Sort key",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=2,
            question="Which command adds a new row to a table?",
            option_a="INSERT",
            option_b="CREATE",
            option_c="ALTER",
            option_d="MERGE",
            correct_option="A"
        ),

        QuizQuestion(
            course_id=2,
            question="Which SQL operation combines data from multiple tables?",
            option_a="JOIN",
            option_b="FILTER",
            option_c="SORT",
            option_d="COUNT",
            correct_option="A"
        ),


        # Communication
        QuizQuestion(
            course_id=3,
            question="Which is an important part of active listening?",
            option_a="Interrupting frequently",
            option_b="Ignoring the speaker",
            option_c="Paying attention and clarifying",
            option_d="Changing the topic",
            correct_option="C"
        ),

        QuizQuestion(
            course_id=3,
            question="Which communication style is generally most effective at work?",
            option_a="Aggressive",
            option_b="Passive",
            option_c="Clear and respectful",
            option_d="Avoidant",
            correct_option="C"
        ),

        QuizQuestion(
            course_id=3,
            question="What should a professional email subject line be?",
            option_a="Vague",
            option_b="Clear and specific",
            option_c="Very long",
            option_d="Empty",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=3,
            question="What is constructive feedback intended to do?",
            option_a="Blame someone",
            option_b="Help improve performance",
            option_c="Avoid communication",
            option_d="Create conflict",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=3,
            question="Which skill helps resolve workplace misunderstandings?",
            option_a="Clarification",
            option_b="Assumption",
            option_c="Silence",
            option_d="Avoidance",
            correct_option="A"
        ),


        # Leadership
        QuizQuestion(
            course_id=4,
            question="What is a key responsibility of a leader?",
            option_a="Avoid decisions",
            option_b="Guide and support the team",
            option_c="Work alone",
            option_d="Ignore feedback",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=4,
            question="What does effective delegation involve?",
            option_a="Giving every task to one person",
            option_b="Assigning responsibilities appropriately",
            option_c="Avoiding accountability",
            option_d="Doing everything yourself",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=4,
            question="Which quality supports effective leadership?",
            option_a="Poor communication",
            option_b="Adaptability",
            option_c="Avoiding responsibility",
            option_d="Micromanagement",
            correct_option="B"
        ),

        QuizQuestion(
            course_id=4,
            question="Why is feedback important for leaders?",
            option_a="It supports improvement",
            option_b="It creates confusion",
            option_c="It removes accountability",
            option_d="It prevents learning",
            correct_option="A"
        ),

        QuizQuestion(
            course_id=4,
            question="What helps a team work toward a common goal?",
            option_a="Unclear expectations",
            option_b="Shared objectives",
            option_c="Lack of communication",
            option_d="Individual priorities only",
            correct_option="B"
        ),
    ]

    added = 0

    for question in additional_questions:

        existing = db.query(QuizQuestion).filter(
            QuizQuestion.course_id == question.course_id,
            QuizQuestion.question == question.question
        ).first()

        if not existing:
            db.add(question)
            added += 1

    db.commit()

    return {
        "message": "Additional quizzes seeded successfully",
        "added_questions": added
    }


@app.get("/courses/{course_id}/quiz")
def get_quiz(
    course_id: int,
    db: Session = Depends(get_db)
):
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.course_id == course_id
    ).all()

    return [
        {
            "id": question.id,
            "question": question.question,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d
        }
        for question in questions
    ]


@app.post("/courses/{course_id}/quiz/submit")
def submit_quiz(
    course_id: int,
    user_id: int,
    answers: dict,
    db: Session = Depends(get_db)
):
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.course_id == course_id
    ).all()

    if not questions:
        return {
            "message": "No quiz found for this course"
        }

    correct = 0

    for question in questions:
        submitted_answer = answers.get(str(question.id))

        if submitted_answer == question.correct_option:
            correct += 1

    total = len(questions)

    score = round(
        (correct / total) * 100
    )

    # Save quiz result
    result = QuizResult(
        user_id=user_id,
        course_id=course_id,
        score=score,
        correct_answers=correct,
        total_questions=total
    )

    db.add(result)

    # -----------------------------------------------------
    # COURSE → COMPETENCY MAPPING
    # -----------------------------------------------------

    course_competency_map = {
        1: "Data Analysis",
        2: "Digital Skills",
        3: "Communication",
        4: "Leadership"
    }

    competency_name = course_competency_map.get(course_id)

    # -----------------------------------------------------
    # UPDATE COMPETENCY
    # -----------------------------------------------------

    if competency_name:

        competency = db.query(Competency).filter(
            Competency.name == competency_name
        ).first()

        if competency:

            if score >= 80:
                level = "Advanced"
            elif score >= 60:
                level = "Intermediate"
            else:
                level = "Beginner"

            user_competency = db.query(
                UserCompetency
            ).filter(
                UserCompetency.user_id == user_id,
                UserCompetency.competency_id == competency.id
            ).first()

            if user_competency:

                # Keep the strongest demonstrated result
                if score > user_competency.score:
                    user_competency.score = score
                    user_competency.level = level

            else:

                user_competency = UserCompetency(
                    user_id=user_id,
                    competency_id=competency.id,
                    level=level,
                    score=score
                )

                db.add(user_competency)

    db.commit()

    return {
        "message": "Quiz evaluated successfully",
        "correct_answers": correct,
        "total_questions": total,
        "score": score,
        "competency": competency_name
    }


@app.post("/competencies/seed")
def seed_competencies(db: Session = Depends(get_db)):

    existing = db.query(Competency).count()

    if existing > 0:
        return {
            "message": "Competencies already exist"
        }

    competencies = [
        Competency(
            name="Data Analysis",
            description="Ability to analyze, interpret and communicate insights from data.",
            required_level="Intermediate"
        ),
        Competency(
            name="Communication",
            description="Ability to communicate ideas clearly and effectively.",
            required_level="Intermediate"
        ),
        Competency(
            name="Leadership",
            description="Ability to guide teams and make effective decisions.",
            required_level="Intermediate"
        ),
        Competency(
            name="Digital Skills",
            description="Ability to effectively use modern digital workplace tools.",
            required_level="Intermediate"
        ),
    ]

    db.add_all(competencies)
    db.commit()

    return {
        "message": "Competencies created successfully"
    }


@app.get("/competencies/{user_id}")
def get_user_competencies(
    user_id: int,
    db: Session = Depends(get_db)
):
    competencies = db.query(Competency).all()

    result = []

    for competency in competencies:
        user_competency = db.query(UserCompetency).filter(
            UserCompetency.user_id == user_id,
            UserCompetency.competency_id == competency.id
        ).first()

        if user_competency:
            level = user_competency.level
            score = user_competency.score
        else:
            level = "Not Assessed"
            score = 0

        result.append({
            "id": competency.id,
            "name": competency.name,
            "description": competency.description,
            "required_level": competency.required_level,
            "level": level,
            "score": score
        })

    return result


@app.get("/skill-gaps/{user_id}")
def get_skill_gaps(
    user_id: int,
    db: Session = Depends(get_db)
):
    competencies = db.query(Competency).all()

    gaps = []

    level_value = {
        "Beginner": 1,
        "Intermediate": 2,
        "Advanced": 3
    }

    for competency in competencies:

        user_competency = db.query(UserCompetency).filter(
            UserCompetency.user_id == user_id,
            UserCompetency.competency_id == competency.id
        ).first()

        current_level = (
            user_competency.level
            if user_competency
            else "Beginner"
        )

        required_level = competency.required_level

        if level_value.get(current_level, 1) < level_value.get(
            required_level, 2
        ):
            gaps.append({
                "competency": competency.name,
                "current_level": current_level,
                "required_level": required_level,
                "gap": level_value[required_level]
                - level_value[current_level]
            })

    return gaps


@app.get("/recommendations/{user_id}")
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db)
):
    competencies = db.query(Competency).all()

    recommendations = []

    level_value = {
        "Beginner": 1,
        "Intermediate": 2,
        "Advanced": 3
    }

    # Which courses help develop which competencies
    competency_courses = {
        "Data Analysis": [1, 2],
        "Communication": [3],
        "Leadership": [4],
        "Digital Skills": [2]
    }

    for competency in competencies:

        user_competency = db.query(UserCompetency).filter(
            UserCompetency.user_id == user_id,
            UserCompetency.competency_id == competency.id
        ).first()

        current_level = (
            user_competency.level
            if user_competency
            else "Beginner"
        )

        required_level = competency.required_level

        if level_value.get(current_level, 1) < level_value.get(
            required_level, 2
        ):

            course_ids = competency_courses.get(
                competency.name,
                []
            )

            for course_id in course_ids:

                course = db.query(Course).filter(
                    Course.id == course_id
                ).first()

                if course:
                    recommendations.append({
                        "course_id": course.id,
                        "course_title": course.title,
                        "competency": competency.name,
                        "current_level": current_level,
                        "required_level": required_level,
                        "reason": (
                            f"Recommended to improve "
                            f"{competency.name}"
                        )
                    })

    return recommendations


@app.get("/knowledge")
def get_knowledge_resources(
    db: Session = Depends(get_db)
):
    resources = db.query(KnowledgeResource).all()

    return resources


@app.post("/knowledge/seed")
def seed_knowledge(db: Session = Depends(get_db)):

    existing = db.query(KnowledgeResource).count()

    if existing > 0:
        return {
            "message": "Knowledge resources already exist"
        }

    resources = [
        KnowledgeResource(
            title="Employee Data Handling Policy",
            description="Guidelines for securely handling organizational and employee data.",
            category="Policies",
            resource_type="Document",
            url="https://example.com/data-policy",
            author="HR & Compliance"
        ),
        KnowledgeResource(
            title="Data Analysis Best Practices",
            description="Practical guidance for analyzing and presenting organizational data.",
            category="Best Practices",
            resource_type="Guide",
            url="https://example.com/data-best-practices",
            author="Analytics Team"
        ),
        KnowledgeResource(
            title="Effective Workplace Communication Guide",
            description="A practical guide to clear communication, collaboration and presentations.",
            category="Guides",
            resource_type="Guide",
            url="https://example.com/communication",
            author="Learning Team"
        ),
        KnowledgeResource(
            title="Leadership Playbook",
            description="A collection of leadership principles and real-world workplace practices.",
            category="Leadership",
            resource_type="Document",
            url="https://example.com/leadership",
            author="People Development"
        ),
        KnowledgeResource(
            title="Digital Productivity Toolkit",
            description="Recommended tools and practices for improving digital workplace productivity.",
            category="Digital Skills",
            resource_type="Video",
            url="https://example.com/productivity",
            author="Digital Transformation Team"
        ),
    ]

    db.add_all(resources)
    db.commit()

    return {
        "message": "Knowledge resources created successfully"
    }


@app.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    total_completions = db.query(ModuleCompletion).count()
    total_quiz_results = db.query(QuizResult).count()

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_module_completions": total_completions,
        "total_quiz_attempts": total_quiz_results
    }


@app.get("/admin/users")
def admin_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]
@app.post("/courses/seed-real")
def seed_real_courses(db: Session = Depends(get_db)):

    real_courses = [
        {
            "title": "Intro to SQL",
            "description": "Learn SQL for working with databases using Google BigQuery. Covers SELECT, filtering, grouping, ordering, common table expressions and joins.",
            "category": "Data Analysis",
            "difficulty": "Beginner",
            "duration": "3 hours"
        },
        {
            "title": "Get started with Microsoft data analytics",
            "description": "Explore the role of a data analyst and learn how Power BI transforms data into useful reports and dashboards for data-driven decisions.",
            "category": "Data Analysis",
            "difficulty": "Intermediate",
            "duration": "1h 28m"
        },
        {
            "title": "Prepare and visualize data with Power BI",
            "description": "Learn how to connect to data, transform and shape it, and create interactive visuals and reports in Power BI.",
            "category": "Data Analysis",
            "difficulty": "Beginner",
            "duration": "8h 12m"
        },
        {
            "title": "Effective communication in the workplace",
            "description": "Develop practical workplace communication skills including listening, questioning, written communication, difficult conversations and personal development planning.",
            "category": "Communication",
            "difficulty": "Beginner",
            "duration": "24 hours"
        },
        {
            "title": "Leadership and followership",
            "description": "Explore leadership styles, leadership challenges, followership and practical ways to develop leadership capability.",
            "category": "Leadership",
            "difficulty": "Beginner",
            "duration": "24 hours"
        },
        {
            "title": "Introduction to cyber security: stay safe online",
            "description": "Build foundational cybersecurity awareness and learn how to recognise online threats and protect your digital information.",
            "category": "Digital Skills",
            "difficulty": "Beginner",
            "duration": "24 hours"
        },
    ]

    added = 0

    for course_data in real_courses:

        existing = db.query(Course).filter(
            Course.title == course_data["title"]
        ).first()

        if not existing:
            course = Course(
                title=course_data["title"],
                description=course_data["description"],
                category=course_data["category"],
                difficulty=course_data["difficulty"],
                duration=course_data["duration"]
            )

            db.add(course)
            added += 1

    db.commit()

    return {
        "message": "Real course catalog added successfully",
        "courses_added": added
    }
@app.post("/modules/seed-real")
def seed_real_course_modules(db: Session = Depends(get_db)):

    course_modules = {
        "Intro to SQL": [
            {
                "title": "SQL basics and SELECT",
                "description": "Understand tables, columns and how to retrieve data using SELECT statements.",
                "duration": "30 min",
                "order": 1
            },
            {
                "title": "Filtering and sorting data",
                "description": "Work with WHERE, ORDER BY and basic filtering techniques.",
                "duration": "30 min",
                "order": 2
            },
            {
                "title": "Grouping and aggregation",
                "description": "Use GROUP BY and aggregate functions to summarize datasets.",
                "duration": "35 min",
                "order": 3
            },
            {
                "title": "Common table expressions",
                "description": "Learn how CTEs help structure more readable and reusable SQL queries.",
                "duration": "30 min",
                "order": 4
            },
            {
                "title": "Working with joins",
                "description": "Understand how to combine information from multiple related tables.",
                "duration": "40 min",
                "order": 5
            }
        ],

        "Get started with Microsoft data analytics": [
            {
                "title": "The role of a data analyst",
                "description": "Understand how analysts turn organizational data into useful insights.",
                "duration": "20 min",
                "order": 1
            },
            {
                "title": "The data analytics workflow",
                "description": "Explore the stages involved in preparing, analysing and communicating data.",
                "duration": "20 min",
                "order": 2
            },
            {
                "title": "Introduction to Power BI",
                "description": "Understand how Power BI supports interactive reporting and business intelligence.",
                "duration": "20 min",
                "order": 3
            },
            {
                "title": "Building useful reports",
                "description": "Learn the principles behind clear and decision-focused data reports.",
                "duration": "20 min",
                "order": 4
            }
        ],

        "Prepare and visualize data with Power BI": [
            {
                "title": "Connect to data",
                "description": "Explore common data sources and understand how Power BI connects to them.",
                "duration": "1 hour",
                "order": 1
            },
            {
                "title": "Clean and transform data",
                "description": "Prepare raw data for analysis using transformation and data-shaping techniques.",
                "duration": "1h 30m",
                "order": 2
            },
            {
                "title": "Create data models",
                "description": "Understand relationships and build models that support reliable analysis.",
                "duration": "1h 30m",
                "order": 3
            },
            {
                "title": "Build visualizations",
                "description": "Create meaningful charts and visual reports from prepared data.",
                "duration": "1h 30m",
                "order": 4
            },
            {
                "title": "Design interactive reports",
                "description": "Combine visuals and report features into useful interactive dashboards.",
                "duration": "1h 30m",
                "order": 5
            }
        ],

        "Effective communication in the workplace": [
            {
                "title": "Communication fundamentals",
                "description": "Understand the role of clear communication in professional environments.",
                "duration": "2 hours",
                "order": 1
            },
            {
                "title": "Active listening",
                "description": "Develop listening habits that improve understanding and collaboration.",
                "duration": "2 hours",
                "order": 2
            },
            {
                "title": "Effective workplace conversations",
                "description": "Explore techniques for constructive and productive professional conversations.",
                "duration": "2 hours",
                "order": 3
            },
            {
                "title": "Written communication",
                "description": "Improve clarity and structure in professional written communication.",
                "duration": "2 hours",
                "order": 4
            }
        ],

        "Leadership and followership": [
            {
                "title": "Understanding leadership",
                "description": "Explore what leadership means and how leadership capability develops.",
                "duration": "2 hours",
                "order": 1
            },
            {
                "title": "Leadership styles",
                "description": "Compare different leadership approaches and when they may be effective.",
                "duration": "2 hours",
                "order": 2
            },
            {
                "title": "The role of followers",
                "description": "Understand followership and its relationship with effective teams.",
                "duration": "2 hours",
                "order": 3
            },
            {
                "title": "Developing leadership capability",
                "description": "Create practical development goals for continued leadership growth.",
                "duration": "2 hours",
                "order": 4
            }
        ],

        "Introduction to cyber security: stay safe online": [
            {
                "title": "Cybersecurity fundamentals",
                "description": "Understand common cybersecurity concepts and why digital security matters.",
                "duration": "2 hours",
                "order": 1
            },
            {
                "title": "Recognising online threats",
                "description": "Learn how to identify common digital threats and suspicious activity.",
                "duration": "2 hours",
                "order": 2
            },
            {
                "title": "Protecting accounts and information",
                "description": "Explore practical approaches to protecting personal and organisational information.",
                "duration": "2 hours",
                "order": 3
            },
            {
                "title": "Safe digital behaviour",
                "description": "Build everyday cybersecurity habits for professional and personal environments.",
                "duration": "2 hours",
                "order": 4
            }
        ]
    }

    added = 0

    for course_title, modules in course_modules.items():

        course = db.query(Course).filter(
            Course.title == course_title
        ).first()

        if not course:
            continue

        existing_modules = db.query(Module).filter(
            Module.course_id == course.id
        ).count()

        if existing_modules > 0:
            continue

        for module_data in modules:

            module = Module(
                course_id=course.id,
                title=module_data["title"],
                description=module_data["description"],
                duration=module_data["duration"],
                order=module_data["order"]
            )

            db.add(module)
            added += 1

    db.commit()

    return {
        "message": "Real-course learning structure added successfully",
        "modules_added": added
    }
@app.post("/modules/reset-sql")
def reset_sql_modules(db: Session = Depends(get_db)):

    course = db.query(Course).filter(
        Course.title == "Intro to SQL"
    ).first()

    if not course:
        return {
            "message": "Intro to SQL course not found"
        }

    # Remove the old SQL module structure
    db.query(Module).filter(
        Module.course_id == course.id
    ).delete(synchronize_session=False)

    sql_modules = [
        {
            "title": "Getting Started with SQL",
            "description": "Understand relational databases, tables, rows, columns and the workflow used to answer questions with SQL.",
            "duration": "30 min",
            "order": 1
        },
        {
            "title": "SELECT, FROM & WHERE",
            "description": "Learn how to retrieve specific columns and filter records using practical SQL queries.",
            "duration": "35 min",
            "order": 2
        },
        {
            "title": "GROUP BY, HAVING & COUNT",
            "description": "Learn how to summarise data using aggregation, grouping and business-focused analysis.",
            "duration": "35 min",
            "order": 3
        },
        {
            "title": "ORDER BY",
            "description": "Learn how to sort query results and prioritise the information most relevant to a business question.",
            "duration": "20 min",
            "order": 4
        },
        {
            "title": "AS & WITH",
            "description": "Use aliases and common table expressions to make SQL queries clearer and easier to manage.",
            "duration": "30 min",
            "order": 5
        },
        {
            "title": "Joining Data",
            "description": "Learn how related tables are combined using JOIN operations and why joins are essential in real databases.",
            "duration": "30 min",
            "order": 6
        }
    ]

    for item in sql_modules:
        db.add(
            Module(
                course_id=course.id,
                title=item["title"],
                description=item["description"],
                duration=item["duration"],
                order=item["order"]
            )
        )

    db.commit()

    return {
        "message": "SQL course structure updated successfully",
        "modules_added": len(sql_modules)
    }