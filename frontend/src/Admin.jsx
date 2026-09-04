import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Activity,
} from "lucide-react";

import "./Admin.css";

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
        ]);

        const statsData = await statsResponse.json();
        const usersData = await usersResponse.json();

        setStats(statsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <Activity size={30} />
          <h1>Loading admin dashboard...</h1>
          <p>Preparing organizational insights.</p>
        </div>
      </div>
    );
  }

  const totalUsers = stats?.total_users ?? 0;
  const totalCourses = stats?.total_courses ?? 0;
  const totalEnrollments = stats?.total_enrollments ?? 0;
  const totalCompletions = stats?.total_module_completions ?? 0;
  const totalQuizAttempts = stats?.total_quiz_attempts ?? 0;

  const employeesPerCourse = totalCourses
    ? (totalUsers / totalCourses).toFixed(1)
    : "0";

  const enrollmentsPerEmployee = totalUsers
    ? (totalEnrollments / totalUsers).toFixed(1)
    : "0";

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">
            <ShieldCheck size={16} />
            ORGANIZATION INSIGHTS
          </div>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor learning activity, employee participation and
            organizational capability growth.
          </p>
        </div>

        <div className="admin-status">
          <span className="status-dot"></span>
          System Active
        </div>
      </div>


      {/* KPI CARDS */}
      <section className="admin-stats">

        <Stat
          icon={<Users size={22} />}
          title="Total employees"
          value={totalUsers}
          subtitle="Registered users"
        />

        <Stat
          icon={<BookOpen size={22} />}
          title="Available courses"
          value={totalCourses}
          subtitle="Learning programs"
        />

        <Stat
          icon={<UserCheck size={22} />}
          title="Enrollments"
          value={totalEnrollments}
          subtitle="Learning commitments"
        />

        <Stat
          icon={<ClipboardCheck size={22} />}
          title="Module completions"
          value={totalCompletions}
          subtitle="Completed learning units"
        />

      </section>


      {/* INSIGHTS */}
      <section className="admin-grid">

        <div className="admin-card">

          <div className="admin-card-header">
            <div>
              <div className="card-label">
                <TrendingUp size={15} />
                LEARNING ACTIVITY
              </div>

              <h2>Platform engagement</h2>

              <p>
                A snapshot of current learning activity across the
                organization.
              </p>
            </div>

            <div className="card-icon">
              <Activity size={20} />
            </div>
          </div>

          <div className="activity-list">

            <div className="activity-row">
              <div>
                <span>Course enrollments</span>
                <small>Employees joining learning programs</small>
              </div>

              <strong>{totalEnrollments}</strong>
            </div>

            <div className="activity-row">
              <div>
                <span>Modules completed</span>
                <small>Learning units successfully finished</small>
              </div>

              <strong>{totalCompletions}</strong>
            </div>

            <div className="activity-row">
              <div>
                <span>Quiz attempts</span>
                <small>Knowledge assessments completed</small>
              </div>

              <strong>{totalQuizAttempts}</strong>
            </div>

          </div>

        </div>


        <div className="admin-card">

          <div className="admin-card-header">
            <div>
              <div className="card-label">
                <GraduationCap size={15} />
                CAPABILITY SNAPSHOT
              </div>

              <h2>Organization overview</h2>

              <p>
                High-level indicators from current platform activity.
              </p>
            </div>
          </div>

          <div className="overview-grid">

            <div className="overview-stat">
              <span>Employees per course</span>
              <strong>{employeesPerCourse}</strong>
            </div>

            <div className="overview-stat">
              <span>Enrollments per employee</span>
              <strong>{enrollmentsPerEmployee}</strong>
            </div>

            <div className="overview-stat">
              <span>Learning completions</span>
              <strong>{totalCompletions}</strong>
            </div>

            <div className="overview-stat">
              <span>Assessment attempts</span>
              <strong>{totalQuizAttempts}</strong>
            </div>

          </div>

        </div>

      </section>


      {/* EMPLOYEE TABLE */}
      <section className="admin-card">

        <div className="admin-card-header employee-header">

          <div>
            <div className="card-label">
              <Users size={15} />
              WORKFORCE
            </div>

            <h2>Employees</h2>

            <p>
              Registered users currently using Capacity Connect.
            </p>
          </div>

          <div className="employee-count">
            {users.length} users
          </div>

        </div>


        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Role</th>
                <th>User ID</th>
              </tr>
            </thead>

            <tbody>

              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <div className="user-name-cell">

                        <div className="user-avatar">
                          {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        <div className="user-details">
                          <strong>{user.name}</strong>
                          <span>Capacity Connect user</span>
                        </div>

                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={
                          user.role === "admin"
                            ? "role admin-role"
                            : "role employee-role"
                        }
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span className="user-id">
                        #{user.id}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-users">
                    No users found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}


function Stat({ icon, title, value, subtitle }) {
  return (
    <div className="admin-stat">

      <div className="admin-stat-icon">
        {icon}
      </div>

      <div className="admin-stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>

    </div>
  );
}


export default Admin;
