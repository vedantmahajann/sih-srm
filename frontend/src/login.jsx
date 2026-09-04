import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  Brain,
  BarChart3,
} from "lucide-react";

import "./login.css";

function Login({ onLogin }) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Login failed");
        return;
      }

      if (data.message !== "Login successful") {
        alert(data.message);
        return;
      }

      onLogin(data);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="login-page">

      {/* ANIMATED BACKGROUND */}
      <div className="login-bg-orb orb-one"></div>
      <div className="login-bg-orb orb-two"></div>
      <div className="login-bg-orb orb-three"></div>

      {/* LEFT EXPERIENCE */}
      <section className="login-left">

        <div className="login-grid"></div>

        <div className="login-brand">
          <div className="login-logo">
            C
          </div>

          <div>
            <h2>Capacity Connect</h2>
            <span>Organizational Capability Platform</span>
          </div>
        </div>


        <div className="login-hero">

          <div className="eyebrow">
            <Sparkles size={13} />
            LEARN • DEVELOP • CONNECT
          </div>

          <h1>
            Turn learning into
            <span> measurable capability.</span>
          </h1>

          <p>
            Build meaningful skills, identify competency gaps, and
            transform learning activity into measurable organizational
            capability.
          </p>


          <div className="login-feature-list">

            <div className="login-feature">
              <div className="feature-icon">
                <Target size={17} />
              </div>

              <div>
                <strong>Personalized learning paths</strong>
                <span>Learning aligned to your capability gaps.</span>
              </div>
            </div>


            <div className="login-feature">
              <div className="feature-icon">
                <Brain size={17} />
              </div>

              <div>
                <strong>Competency intelligence</strong>
                <span>See where you stand and where to grow.</span>
              </div>
            </div>


            <div className="login-feature">
              <div className="feature-icon">
                <BarChart3 size={17} />
              </div>

              <div>
                <strong>Measurable progress</strong>
                <span>Track learning impact across the journey.</span>
              </div>
            </div>

          </div>

        </div>


        {/* FLOATING VISUAL CARDS */}

        <div className="floating-card floating-card-one">
          <div className="floating-card-icon">
            <Target size={16} />
          </div>

          <div>
            <span>SKILL GAP</span>
            <strong>Data Analysis</strong>
          </div>

          <div className="floating-badge">
            +24%
          </div>
        </div>


        <div className="floating-card floating-card-two">
          <div className="mini-chart">
            <span style={{ height: "35%" }}></span>
            <span style={{ height: "50%" }}></span>
            <span style={{ height: "70%" }}></span>
            <span style={{ height: "88%" }}></span>
          </div>

          <div>
            <span>CAPABILITY</span>
            <strong>Growing</strong>
          </div>
        </div>


        <div className="floating-node node-a">
          <ShieldCheck size={15} />
        </div>

        <div className="floating-node node-b">
          <Sparkles size={15} />
        </div>


        <div className="login-footer">
          <span>Capacity Connect</span>
          <span className="footer-dot">•</span>
          <span>Empowering organizational growth</span>
        </div>

      </section>


      {/* LOGIN SIDE */}
      <section className="login-right">

        <div className="login-card">

          <div className="mobile-brand">
            <div className="login-logo">
              C
            </div>

            <div>
              <strong>Capacity Connect</strong>
              <span>Capability Platform</span>
            </div>
          </div>


          <div className="form-heading">

            <div className="heading-tag">
              WELCOME BACK
            </div>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Continue your journey toward stronger capabilities.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            <label htmlFor="email">
              Email address
            </label>

            <div className="input-wrapper">

              <Mail size={17} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />

            </div>


            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">

              <Lock size={17} />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />

            </div>


            <div className="form-options">

              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot"
              >
                Forgot password?
              </button>

            </div>


            <button
              className="login-button"
              type="submit"
            >
              <span>Sign in</span>

              <span className="login-button-arrow">
                <ArrowRight size={16} />
              </span>
            </button>

          </form>


          <div className="secure-note">

            <div className="secure-icon">
              <ShieldCheck size={16} />
            </div>

            <div>
              <strong>Secure organizational access</strong>

              <span>
                Your account is connected to the Capacity Connect
                learning environment.
              </span>
            </div>

          </div>

        </div>


        <div className="login-right-footer">
          <span>© 2026 Capacity Connect</span>
          <span>Organizational learning, reimagined.</span>
        </div>

      </section>

    </div>
  );
}

export default Login;
