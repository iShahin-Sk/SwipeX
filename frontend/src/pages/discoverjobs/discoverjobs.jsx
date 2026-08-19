import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./discoverjobs.css";
import JobCard from "../../components/jobcard/jobcard";
import API from "../../services/api";

function DiscoverJobs() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [appliedJobs, setAppliedJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");

  // ==========================
  // ATS / AI
  // ==========================

  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // ==========================
  // URL PARAMETERS
  // ==========================

  const [searchParams] = useSearchParams();

  const company = searchParams.get("company");
  const notificationJobId =
    searchParams.get("job");

  // ==========================
  // Initial / URL Change
  // ==========================

  useEffect(() => {

    fetchJobs();
    fetchApplications();

  }, [company, notificationJobId]);

  // ==========================
  // Fetch Jobs
  // ==========================

  const fetchJobs = async () => {

    setLoading(true);

    try {

      // =================================================
      // CASE 1:
      // User clicked a notification
      // Open ONLY that particular job
      // =================================================

      if (notificationJobId) {

        const response = await API.get(
          `jobs/${notificationJobId}/`
        );

        setJobs([response.data]);

        setCurrentIndex(0);

        setAtsResult(null);

        setLoading(false);

        return;
      }

      // =================================================
      // CASE 2:
      // Normal Discover Jobs
      // =================================================

      const params = new URLSearchParams();

      if (search) {
        params.append(
          "search",
          search
        );
      }

      if (location) {
        params.append(
          "location",
          location
        );
      }

      if (jobType) {
        params.append(
          "job_type",
          jobType
        );
      }

      if (experience) {
        params.append(
          "experience",
          experience
        );
      }

      if (company) {
        params.append(
          "company",
          company
        );
      }

      const response = await API.get(
        `jobs/?${params.toString()}`
      );

      setJobs(response.data);

      setCurrentIndex(0);

      setAtsResult(null);

    } catch (error) {

      console.log(
        "Job loading error:",
        error.response?.data ||
        error.message
      );

      setJobs([]);

    } finally {

      setLoading(false);
    }
  };

  // ==========================
  // Fetch Applications
  // ==========================

  const fetchApplications = async () => {

    try {

      const res = await API.get(
        "my-applications/"
      );

      const ids = res.data.map(
        (item) => item.job.id
      );

      setAppliedJobs(ids);

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );
    }
  };

  // ==========================
  // Search
  // ==========================

  const handleSearch = () => {

    // Do not apply search to a
    // notification-specific job.
    if (notificationJobId) {
      return;
    }

    fetchJobs();
  };

  // ==========================
  // Clear Filters
  // ==========================

  const clearFilters = () => {

    setSearch("");
    setLocation("");
    setJobType("");
    setExperience("");

    setTimeout(() => {

      if (!notificationJobId) {
        fetchJobs();
      }

    }, 0);
  };

  // ==========================
  // ATS + AI ANALYSIS
  // ==========================

  const handleATSAnalysis = async () => {

    const currentJob =
      jobs[currentIndex];

    if (!currentJob) {
      return;
    }

    setAtsLoading(true);
    setAtsResult(null);

    try {

      const response = await API.get(
        `jobs/${currentJob.id}/ats-score/`
      );

      setAtsResult(
        response.data
      );

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      setAtsResult({
        error:
          error.response?.data?.error ||
          "Unable to analyze resume."
      });

    } finally {

      setAtsLoading(false);
    }
  };

  // ==========================
  // Swipe
  // ==========================

  const handleSwipe = async (action) => {

    const currentJob =
      jobs[currentIndex];

    if (!currentJob) {
      return;
    }

    try {

      await API.post(
        "swipe/",
        {
          job: currentJob.id,
          action,
        }
      );

      setCurrentIndex(
        (prev) => prev + 1
      );

      setAtsResult(null);

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );
    }
  };

  // ==========================
  // Apply Job
  // ==========================

  const handleApply = async () => {

    const currentJob =
      jobs[currentIndex];

    if (!currentJob) {
      return;
    }

    try {

      await API.post(
        "apply/",
        {
          job: currentJob.id,
        }
      );

      alert(
        "Application Submitted!"
      );

      setAppliedJobs(
        (prev) => [
          ...prev,
          currentJob.id,
        ]
      );

    } catch (err) {

      if (
        err.response &&
        err.response.data.message ===
          "Already Applied"
      ) {

        alert(
          "Already Applied!"
        );

        setAppliedJobs(
          (prev) => [
            ...prev,
            currentJob.id,
          ]
        );

      } else {

        console.log(
          err.response?.data
        );

        alert(
          "Unable to Apply"
        );
      }
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <h2>
        Loading Jobs...
      </h2>
    );
  }

  return (
    <div>

      <h1>
        Discover Jobs
      </h1>

      {/* =================================
          NOTIFICATION JOB MESSAGE
      ================================= */}

      {notificationJobId && (
        <div className="company-filter-message">

          🔔 Showing the opportunity
          from your notification

        </div>
      )}

      {/* ==========================
          FILTERS
      ========================== */}

      <div className="filters-container">

        <input
          type="text"
          placeholder="🔍 Search by title, skill or company..."
          className="search-bar"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          disabled={!!notificationJobId}
        />

        <select
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
          disabled={!!notificationJobId}
        >

          <option value="">
            All Locations
          </option>

          <option value="Bangalore">
            Bangalore
          </option>

          <option value="Hyderabad">
            Hyderabad
          </option>

          <option value="Chennai">
            Chennai
          </option>

          <option value="Mumbai">
            Mumbai
          </option>

          <option value="Delhi">
            Delhi
          </option>

          <option value="Remote">
            Remote
          </option>

        </select>

        <select
          value={jobType}
          onChange={(e) =>
            setJobType(e.target.value)
          }
          disabled={!!notificationJobId}
        >

          <option value="">
            All Job Types
          </option>

          <option value="Full-Time">
            Full-Time
          </option>

          <option value="Part-Time">
            Part-Time
          </option>

          <option value="Internship">
            Internship
          </option>

          <option value="Remote">
            Remote
          </option>

        </select>

        <select
          value={experience}
          onChange={(e) =>
            setExperience(e.target.value)
          }
          disabled={!!notificationJobId}
        >

          <option value="">
            All Experience
          </option>

          <option value="Fresher">
            Fresher
          </option>

          <option value="0-1 years">
            0-1 years
          </option>

          <option value="1-3 years">
            1-3 years
          </option>

          <option value="3-5 years">
            3-5 years
          </option>

          <option value="5+ years">
            5+ years
          </option>

        </select>

        <div className="filter-buttons">

          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={!!notificationJobId}
          >
            Search
          </button>

          <button
            className="clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>

        </div>

      </div>

      {/* ==========================
          COMPANY FILTER
      ========================== */}

      {company && !notificationJobId && (
        <h3 className="company-filter-message">
          Showing jobs for selected company
        </h3>
      )}

      {/* ==========================
          JOB CARD
      ========================== */}

      {jobs.length === 0 ? (

        <h2>
          No Jobs Found
        </h2>

      ) : currentIndex >= jobs.length ? (

        <h2>
          🎉 No More Jobs Available
        </h2>

      ) : (

        <>

          <p className="job-counter">

            Job {currentIndex + 1} of{" "}
            {jobs.length}

          </p>

          <JobCard
            job={jobs[currentIndex]}
            onLike={() =>
              handleSwipe("LIKE")
            }
            onDislike={() =>
              handleSwipe("DISLIKE")
            }
            onApply={handleApply}
            applied={appliedJobs.includes(
              jobs[currentIndex].id
            )}
          />

          {/* ==========================
              ATS BUTTON
          ========================== */}

          <button
            className="ats-btn"
            onClick={handleATSAnalysis}
            disabled={atsLoading}
          >

            {atsLoading
              ? "🤖 Analyzing Resume..."
              : "🤖 Check Resume Compatibility"}

          </button>

          {/* ==========================
              ATS RESULT
          ========================== */}

          {atsResult &&
            !atsResult.error && (

            <div className="ats-result">

              <h2>
                📊 Resume Compatibility
                Analysis
              </h2>

              {/* Overall Score */}

              <div className="ats-main-score">

                <span>
                  Overall ATS Score
                </span>

                <strong>
                  {atsResult.ats_score}%
                </strong>

              </div>

              {/* Individual Scores */}

              <div className="ats-stats">

                <div>

                  <span>
                    Skill Match
                  </span>

                  <strong>
                    {atsResult.skill_match}%
                  </strong>

                </div>

                <div>

                  <span>
                    Keyword Match
                  </span>

                  <strong>
                    {atsResult.keyword_match}%
                  </strong>

                </div>

                <div>

                  <span>
                    Resume Completeness
                  </span>

                  <strong>
                    {
                      atsResult.resume_completeness
                    }%
                  </strong>

                </div>

              </div>

              {/* Matched Skills */}

              <div className="ats-section">

                <h3>
                  ✅ Matched Skills
                </h3>

                {atsResult.matched_skills
                  ?.length > 0 ? (

                  <ul>

                    {atsResult.matched_skills.map(
                      (skill, index) => (
                        <li key={index}>
                          {skill}
                        </li>
                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No matching skills found.
                  </p>

                )}

              </div>

              {/* Missing Skills */}

              <div className="ats-section">

                <h3>
                  ❌ Missing Skills
                </h3>

                {atsResult.missing_skills
                  ?.length > 0 ? (

                  <ul>

                    {atsResult.missing_skills.map(
                      (skill, index) => (
                        <li key={index}>
                          {skill}
                        </li>
                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No major missing skills
                    detected.
                  </p>

                )}

              </div>

              {/* ==========================
                  GEMINI AI ANALYSIS
              ========================== */}

              {atsResult.ai_analysis && (

                <div className="ai-analysis">

                  <h2>
                    🤖 AI Career Analysis
                  </h2>

                  <div className="ai-score">

                    <span>
                      AI Compatibility Score
                    </span>

                    <strong>
                      {
                        atsResult
                          .ai_analysis
                          .ai_score
                      }/100
                    </strong>

                  </div>

                  <h3>
                    📝 AI Summary
                  </h3>

                  <p>
                    {
                      atsResult
                        .ai_analysis
                        .summary
                    }
                  </p>

                  <h3>
                    💪 Strengths
                  </h3>

                  {atsResult
                    .ai_analysis
                    .strengths
                    ?.length > 0 ? (

                    <ul>

                      {atsResult.ai_analysis.strengths.map(
                        (item, index) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  ) : (

                    <p>
                      No AI strengths available.
                    </p>

                  )}

                  <h3>
                    📚 AI Missing Skills
                  </h3>

                  {atsResult
                    .ai_analysis
                    .missing_skills
                    ?.length > 0 ? (

                    <ul>

                      {atsResult.ai_analysis.missing_skills.map(
                        (item, index) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  ) : (

                    <p>
                      No additional missing
                      skills identified.
                    </p>

                  )}

                  <h3>
                    💡 AI Suggestions
                  </h3>

                  {atsResult
                    .ai_analysis
                    .suggestions
                    ?.length > 0 ? (

                    <ul>

                      {atsResult.ai_analysis.suggestions.map(
                        (item, index) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  ) : (

                    <p>
                      No AI suggestions available.
                    </p>

                  )}

                </div>

              )}

            </div>

          )}

          {/* ==========================
              ATS ERROR
          ========================== */}

          {atsResult?.error && (

            <div className="ats-error">
              ⚠️ {atsResult.error}
            </div>

          )}

        </>

      )}

    </div>
  );
}

export default DiscoverJobs;