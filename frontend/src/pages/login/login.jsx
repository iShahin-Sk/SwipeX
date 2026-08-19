import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaArrowLeft,
  FaBriefcase,
  FaRobot,
  FaShieldAlt,
} from "react-icons/fa";
import API from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("login/", formData);

      // Save JWT Tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // Save User Details
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("email", response.data.email);

      alert("Login Successful!");

      // Redirect based on role
      if (response.data.role === "job_seeker") {
        navigate("/jobseeker/dashboard");
      } else if (response.data.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error(error.response?.data);
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="auth-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="auth-left">

        <Link to="/" className="auth-back">
          <FaArrowLeft />
          Back to SwipeX
        </Link>

        <div className="auth-brand">

          <h1>
            Swipe<span>X</span>
          </h1>

          <div className="auth-illustration">
            <FaRobot />
          </div>

          <h2>
            Discover opportunities
            <br />
            made for you.
          </h2>

          <p>
            Sign in to continue discovering personalized
            job opportunities with SwipeX.
          </p>

          <div className="auth-benefits">

            <div>
              <FaBriefcase />
              AI-powered job recommendations
            </div>

            <div>
              <FaShieldAlt />
              Secure account authentication
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="auth-right">

        <div className="auth-card">

          <div className="mobile-logo">
            Swipe<span>X</span>
          </div>

          <h2>Welcome back 👋</h2>

          <p className="auth-subtitle">
            Sign in to continue to your account.
          </p>


          <form onSubmit={handleLogin}>

            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />


            <button
              type="submit"
              className="auth-submit"
            >
              Login
            </button>

          </form>


          <div className="auth-divider">
            <span>or</span>
          </div>


          <p className="auth-switch">

            Don't have an account?{" "}

            <Link to="/register">
              Create an account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;