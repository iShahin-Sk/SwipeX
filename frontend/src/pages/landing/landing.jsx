import "./landing.css";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaBriefcase,
  FaChartLine,
  FaFileAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

function Landing() {
  return (
    <div className="landing-page">

      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="landing-navbar">

        <div className="landing-logo">
          <span>Swipe</span>X
        </div>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>

        <div className="landing-nav-buttons">
          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-register">
            Get Started
          </Link>
        </div>

      </nav>


      {/* =========================
          HERO SECTION
      ========================= */}
      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            <FaRobot />
            AI-Powered Job Discovery
          </div>

          <h1>
            Find the right job.
            <br />
            <span>Swipe your way there.</span>
          </h1>

          <p className="hero-description">
            SwipeX helps you discover relevant job opportunities
            through intelligent recommendations based on your
            skills, profile and career interests.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="hero-primary-btn">
              Get Started
              <FaArrowRight />
            </Link>

            <Link to="/login" className="hero-secondary-btn">
              Login
            </Link>

          </div>

          <div className="hero-points">

            <div>
              <FaCheckCircle />
              AI recommendations
            </div>

            <div>
              <FaCheckCircle />
              Swipe-based discovery
            </div>

            <div>
              <FaCheckCircle />
              Career insights
            </div>

          </div>

        </div>


        {/* =========================
            HERO VISUAL
        ========================= */}
        <div className="hero-visual">

          <div className="floating-card card-one">
            <FaBriefcase />
            <div>
              <strong>Software Engineer</strong>
              <small>95% Match</small>
            </div>
          </div>

          <div className="swipe-card">

            <div className="swipe-card-top">
              <span className="match-badge">
                95% Match
              </span>
            </div>

            <div className="job-icon">
              <FaBriefcase />
            </div>

            <h3>Software Engineer</h3>

            <p className="company-name">
              Tech Innovation Labs
            </p>

            <div className="job-details">
              <span>📍 Bangalore</span>
              <span>💼 Full Time</span>
            </div>

            <div className="skill-tags">
              <span>Python</span>
              <span>React</span>
              <span>AI/ML</span>
            </div>

            <div className="swipe-actions">
              <button className="dislike">
                ✕
              </button>

              <button className="like">
                ♥
              </button>
            </div>

          </div>

          <div className="floating-card card-two">
            <FaChartLine />
            <div>
              <strong>Career Insights</strong>
              <small>Track your progress</small>
            </div>
          </div>

        </div>

      </section>


      {/* =========================
          FEATURES
      ========================= */}
      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading">

          <span>WHY SWIPEX?</span>

          <h2>
            Smarter job discovery,
            <br />
            built around you.
          </h2>

          <p>
            Everything you need to discover opportunities
            and manage your career journey.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon blue">
              <FaRobot />
            </div>

            <h3>AI Recommendations</h3>

            <p>
              Discover jobs that match your skills,
              experience and career interests.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon purple">
              <FaBriefcase />
            </div>

            <h3>Swipe-Based Discovery</h3>

            <p>
              Quickly explore job opportunities using
              a simple swipe-based interface.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon green">
              <FaFileAlt />
            </div>

            <h3>Resume Insights</h3>

            <p>
              Understand how your resume fits potential
              job opportunities.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon orange">
              <FaChartLine />
            </div>

            <h3>Career Analytics</h3>

            <p>
              Monitor your applications and understand
              your career progress.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            Your next opportunity
            <br />
            is only a few swipes away.
          </h2>

        </div>


        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>Create your profile</h3>

            <p>
              Tell SwipeX about your skills,
              experience and career goals.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>Discover opportunities</h3>

            <p>
              Explore personalized job recommendations
              designed around your profile.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>Swipe & Apply</h3>

            <p>
              Like interesting opportunities and
              manage your applications in one place.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          CTA
      ========================= */}
      <section
        className="cta-section"
        id="about"
      >

        <div>

          <h2>
            Ready to discover
            <br />
            your next opportunity?
          </h2>

          <p>
            Start your career journey with SwipeX.
          </p>

        </div>

        <Link
          to="/register"
          className="cta-button"
        >
          Create Your Account
          <FaArrowRight />
        </Link>

      </section>


      {/* =========================
          FOOTER
      ========================= */}
      <footer className="landing-footer">

        <div className="footer-logo">
          Swipe<span>X</span>
        </div>

        <p>
          AI-powered job discovery and career assistance.
        </p>

        <span>
          © 2026 SwipeX. All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default Landing;