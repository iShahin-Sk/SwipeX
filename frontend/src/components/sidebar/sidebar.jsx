import "./sidebar.css";
import { Link } from "react-router-dom";

import {
  FaHome,
  FaBriefcase,
  FaBuilding,
  FaFileAlt,
  FaClipboardList,
  FaPlusCircle,
  FaUsers,
  FaChartBar,
  FaStar,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";

function Sidebar() {
  const role = localStorage.getItem("role");

  return (
    <div className="sidebar">

      <h2 className="logo">
        SwipeX
      </h2>

      <nav>

        {/* =======================
            JOB SEEKER SIDEBAR
        ======================== */}

        {role === "job_seeker" && (
          <>

            <Link to="/jobseeker/dashboard">
              <FaHome />
              Dashboard
            </Link>


            <Link to="/jobseeker/jobs">
              <FaBriefcase />
              Discover Jobs
            </Link>


            <Link to="/jobseeker/recommended-jobs">
              <FaStar />
              Recommended Jobs
            </Link>


            <Link to="/jobseeker/suitable-jobs">
              <FaCheckCircle />
              Suitable Jobs
            </Link>


            {/* =======================
                HIRING TRENDS
            ======================== */}

            <Link to="/jobseeker/hiring-trends">
              <FaChartLine />
              Hiring Trends
            </Link>


            <Link to="/jobseeker/companies">
              <FaBuilding />
              Companies
            </Link>


            <Link to="/jobseeker/saved-jobs">
              <FaFileAlt />
              Saved Jobs
            </Link>


            <Link to="/jobseeker/my-applications">
              <FaClipboardList />
              My Applications
            </Link>


            <Link to="/jobseeker/profile">
              <FaUsers />
              Profile
            </Link>

          </>
        )}


        {/* =======================
            RECRUITER SIDEBAR
        ======================== */}

        {role === "recruiter" && (
          <>

            <Link to="/recruiter/dashboard">
              <FaHome />
              Dashboard
            </Link>


            <Link to="/recruiter/post-job">
              <FaPlusCircle />
              Post Job
            </Link>


            <Link to="/recruiter/my-jobs">
              <FaBriefcase />
              My Jobs
            </Link>


            <Link to="/recruiter/applicants">
              <FaUsers />
              Applicants
            </Link>


            <Link to="/recruiter/analytics">
              <FaChartBar />
              Analytics
            </Link>

          </>
        )}

      </nav>

    </div>
  );
}

export default Sidebar;