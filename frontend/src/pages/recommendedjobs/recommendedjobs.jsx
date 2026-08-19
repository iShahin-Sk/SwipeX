import { useEffect, useState } from "react";
import "./recommendedjobs.css";
import JobCard from "../../components/JobCard/JobCard";
import API from "../../services/api";

function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetchRecommendedJobs();
    fetchApplications();
  }, []);

  // ==========================
  // Fetch Recommendations
  // ==========================

  const fetchRecommendedJobs = async () => {
    setLoading(true);

    try {
      const response = await API.get(
        "recommended-jobs/"
      );

      setJobs(response.data);

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Fetch Applications
  // ==========================

  const fetchApplications = async () => {
    try {
      const response = await API.get(
        "my-applications/"
      );

      const ids = response.data.map(
        (item) => item.job.id
      );

      setAppliedJobs(ids);

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    }
  };

  // ==========================
  // Like / Dislike
  // ==========================

  const handleSwipe = async (jobId, action) => {
    try {
      await API.post("swipe/", {
        job: jobId,
        action: action,
      });

      // Remove disliked job immediately
      if (action === "DISLIKE") {
        setJobs((prev) =>
          prev.filter(
            (job) =>
              (job.job_id || job.id) !== jobId
          )
        );
      }

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    }
  };

  // ==========================
  // Apply
  // ==========================

  const handleApply = async (jobId) => {
    try {
      await API.post("apply/", {
        job: jobId,
      });

      alert("Application Submitted!");

      setAppliedJobs((prev) => [
        ...prev,
        jobId,
      ]);

    } catch (error) {

      if (
        error.response?.data?.message ===
        "Already Applied"
      ) {
        alert("Already Applied!");

        setAppliedJobs((prev) => [
          ...prev,
          jobId,
        ]);

      } else {
        console.log(
          error.response?.data
        );

        alert("Unable to Apply");
      }
    }
  };

  if (loading) {
    return (
      <div className="recommended-loading">
        Loading recommended jobs...
      </div>
    );
  }

  return (
    <div className="recommended-page">

      <div className="recommended-header">

        <h1>⭐ Recommended Jobs</h1>

        <p>
          Jobs personalized for you based on
          your resume, skills, experience and
          activity.
        </p>

      </div>

      {jobs.length === 0 ? (

        <div className="no-recommendations">
          <h2>No Recommendations Yet</h2>

          <p>
            Complete your profile and resume
            to get personalized job
            recommendations.
          </p>
        </div>

      ) : (

        <div className="recommended-list">

          {jobs.map((item, index) => {

            /*
             * Your recommendation API may return:
             *
             * {
             *   job_id: 1,
             *   title: "...",
             *   company: "...",
             *   match_percentage: 81.5
             * }
             *
             * Therefore we first get the actual
             * Job object.
             */

            const jobId =
              item.job_id || item.id;

            return (
              <div
                className="recommended-item"
                key={jobId}
              >

                {/* Match percentage */}

                <div className="match-badge">
                  🎯 {item.match_percentage}%
                  Match
                </div>

                {/* Recommendation information */}

                <div className="recommendation-info">

                  <span>
                    Recommended #{index + 1}
                  </span>

                </div>

                {/* Job information */}

                <div className="recommended-job-info">

                  <h2>
                    {item.title}
                  </h2>

                  <p>
                    🏢 {item.company}
                  </p>

                  <p>
                    📍 {item.location}
                  </p>

                  <p>
                    💼 {item.job_type}
                  </p>

                  <p>
                    🧑‍💻 Semantic Match:
                    {" "}
                    {item.semantic_score}%
                  </p>

                  <p>
                    🛠️ Skill Match:
                    {" "}
                    {item.skill_score}%
                  </p>

                  <p>
                    📈 Experience Match:
                    {" "}
                    {item.experience_score}%
                  </p>

                </div>

                {/* Actions */}

                <div className="recommended-actions">

                  <button
                    className="like-btn"
                    onClick={() =>
                      handleSwipe(
                        jobId,
                        "LIKE"
                      )
                    }
                  >
                    ❤️ Like
                  </button>

                  <button
                    className="dislike-btn"
                    onClick={() =>
                      handleSwipe(
                        jobId,
                        "DISLIKE"
                      )
                    }
                  >
                    ❌ Dislike
                  </button>

                  <button
                    className="apply-btn"
                    disabled={appliedJobs.includes(
                      jobId
                    )}
                    onClick={() =>
                      handleApply(jobId)
                    }
                  >
                    {appliedJobs.includes(
                      jobId
                    )
                      ? "✅ Applied"
                      : "📩 Apply Now"}
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default RecommendedJobs;