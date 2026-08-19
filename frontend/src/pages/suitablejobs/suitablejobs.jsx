import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../services/api";
import "./suitablejobs.css";

function SuitableJobs() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSuitableJobs();
  }, []);

  const loadSuitableJobs = async () => {
    try {
      const response = await API.get("resume-suitable-jobs/");
      setData(response.data);
    } catch (error) {
      console.error("Error loading suitable jobs:", error);

      setError("Unable to load suitable jobs.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="suitable-jobs-page">
        <div className="suitable-loading">
          Loading suitable jobs...
        </div>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (error) {
    return (
      <div className="suitable-jobs-page">
        <div className="suitable-error">
          {error}
        </div>
      </div>
    );
  }

  // -----------------------------
  // NO RESUME
  // -----------------------------

  if (!data?.has_resume) {
    return (
      <div className="suitable-jobs-page">
        <div className="suitable-empty">
          <div className="suitable-empty-icon">
            📄
          </div>

          <h2>Resume Required</h2>

          <p>
            Upload your resume first to find suitable jobs.
          </p>

          <button
            onClick={() =>
              navigate("/jobseeker/profile")
            }
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  const jobs = data.jobs || [];

  // -----------------------------
  // DISPLAY JOBS
  // -----------------------------

  return (
    <div className="suitable-jobs-page">

      {/* HEADER */}

      <div className="suitable-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/jobseeker/dashboard")
          }
        >
          ← Dashboard
        </button>

        <h1>Suitable Jobs</h1>

        <p>
          Jobs matching your resume.
        </p>

      </div>

      {/* COUNT */}

      <div className="suitable-count">
        {jobs.length} suitable job
        {jobs.length !== 1 ? "s" : ""} found
      </div>

      {/* JOBS */}

      {jobs.length === 0 ? (

        <div className="suitable-empty">

          <div className="suitable-empty-icon">
            🔍
          </div>

          <h2>No Suitable Jobs Found</h2>

          <p>
            No available job currently matches
            your resume above the required threshold.
          </p>

        </div>

      ) : (

        <div className="suitable-jobs-grid">

          {jobs.map((job) => (

            <div
              className="suitable-job-card"
              key={job.id}
            >

              {/* TITLE */}

              <h2>
                {job.title}
              </h2>

              {/* COMPANY */}

              {job.company && (
                <p className="suitable-company">
                  {job.company}
                </p>
              )}

              {/* ATS SCORE */}

              <div className="suitable-job-details">

                <span>
                  ATS Match: {job.ats_score}%
                </span>

                {job.location && (
                  <span>
                    📍 {job.location}
                  </span>
                )}

                {job.job_type && (
                  <span>
                    {job.job_type}
                  </span>
                )}

                {job.experience && (
                  <span>
                    {job.experience}
                  </span>
                )}

                {job.salary && (
                  <span>
                    ₹{job.salary}
                  </span>
                )}

              </div>

              {/* DESCRIPTION */}

              {job.description && (
                <p className="suitable-description">
                  {job.description}
                </p>
              )}

              {/* SKILLS */}

              {job.skills && (
                <div className="suitable-skills">

                  {Array.isArray(job.skills) ? (

                    job.skills.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )

                  ) : (

                    <span>
                      {job.skills}
                    </span>

                  )}

                </div>
              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default SuitableJobs;