import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaArrowLeft,
  FaUserPlus,
  FaBriefcase,
  FaBuilding,
} from "react-icons/fa";
import API from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "job_seeker",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "register/",
        formData
      );

      console.log("Success:", response.data);

      alert("Registration Successful!");

      navigate("/login");

    } catch (error) {

      console.error(
        "Backend Error:",
        error.response?.data
      );

      alert("Registration Failed!");
    }
  };

  return (
    <div className="register-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="register-left">

        <Link
          to="/"
          className="register-back"
        >
          <FaArrowLeft />
          Back to SwipeX
        </Link>

        <div className="register-intro">

          <h1>
            Join Swipe<span>X</span>
          </h1>

          <div className="register-icon">
            <FaUserPlus />
          </div>

          <h2>
            Start your career
            <br />
            journey today.
          </h2>

          <p>
            Create your SwipeX account and discover
            opportunities tailored to your career goals.
          </p>

          <div className="role-preview">

            <div>
              <FaBriefcase />
              <span>
                <strong>Job Seekers</strong>
                <small>Discover your next opportunity</small>
              </span>
            </div>

            <div>
              <FaBuilding />
              <span>
                <strong>Recruiters</strong>
                <small>Find talented candidates</small>
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="register-right">

        <div className="register-card">

          <div className="register-mobile-logo">
            Swipe<span>X</span>
          </div>

          <h2>Create your account</h2>

          <p className="register-subtitle">
            Join SwipeX and get started.
          </p>


          <form onSubmit={handleRegister}>

            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />


            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />


            <label>
              I am joining as
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="job_seeker">
                Job Seeker
              </option>

              <option value="recruiter">
                Recruiter
              </option>
            </select>


            <button
              type="submit"
              className="register-submit"
            >
              Create Account
            </button>

          </form>


          <p className="register-switch">

            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;