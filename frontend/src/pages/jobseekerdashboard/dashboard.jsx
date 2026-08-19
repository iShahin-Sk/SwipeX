import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import API from "../../services/api";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // =====================================
  // STATE
  // =====================================

  const [applications, setApplications] = useState([]);
  const [resumeAnalytics, setResumeAnalytics] = useState(null);
  const [suitableJobs, setSuitableJobs] = useState(null);
  const [profile, setProfile] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] =
    useState(true);

  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingSuitableJobs, setLoadingSuitableJobs] = useState(true);

  // Hiring Trends
  const [hiringTrends, setHiringTrends] = useState(null);
  const [loadingHiringTrends, setLoadingHiringTrends] = useState(true);

  // =====================================
  // LOAD DASHBOARD DATA
  // =====================================

  useEffect(() => {
    loadApplications();
    loadResumeAnalytics();
    loadSuitableJobs();
    loadProfile();
    loadRecommendations();
    loadHiringTrends();
  }, []);

  // =====================================
  // APPLICATIONS
  // =====================================

  const loadApplications = async () => {
    try {
      const response = await API.get("my-applications/");
      setApplications(response.data || []);
    } catch (error) {
      console.error(
        "Error loading applications:",
        error
      );
    } finally {
      setLoadingApplications(false);
    }
  };

  // =====================================
  // RESUME ANALYTICS
  // =====================================

  const loadResumeAnalytics = async () => {
    try {
      const response = await API.get(
        "resume-analytics/"
      );

      setResumeAnalytics(response.data);
    } catch (error) {
      console.error(
        "Error loading resume analytics:",
        error
      );
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // =====================================
  // SUITABLE JOBS
  // =====================================

  const loadSuitableJobs = async () => {
    try {
      const response = await API.get(
        "resume-suitable-jobs/"
      );

      setSuitableJobs(response.data);
    } catch (error) {
      console.error(
        "Error loading suitable jobs:",
        error
      );
    } finally {
      setLoadingSuitableJobs(false);
    }
  };

  // =====================================
  // RECOMMENDATIONS
  // =====================================

  const loadRecommendations = async () => {
    try {
      const response = await API.get(
        "recommended-jobs/"
      );

      setRecommendations(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading recommendations:",
        error
      );

      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // =====================================
  // PROFILE
  // =====================================

  const loadProfile = async () => {
    try {
      const response = await API.get(
        "profile/"
      );

      setProfile(response.data);
    } catch (error) {
      console.error(
        "Error loading profile:",
        error
      );
    }
  };

  // =====================================
  // HIRING TRENDS
  // =====================================

  const loadHiringTrends = async () => {
    try {
      const response = await API.get(
        "hiring-trends/"
      );

      setHiringTrends(response.data);
    } catch (error) {
      console.error(
        "Error loading hiring trends:",
        error
      );

      setHiringTrends(null);
    } finally {
      setLoadingHiringTrends(false);
    }
  };

  // =====================================
  // APPLICATION COUNTS
  // =====================================

  const getCount = (status) => {
    return applications.filter(
      (application) =>
        String(
          application.status || ""
        ).toLowerCase() ===
        status.toLowerCase()
    ).length;
  };

  const total = applications.length;

  const applied = getCount("Applied");
  const shortlisted = getCount("Shortlisted");
  const interview = getCount("Interview");
  const selected = getCount("Selected");
  const rejected = getCount("Rejected");

  // =====================================
  // PIE CHART
  // =====================================

  const pieData = [
    {
      name: "Applied",
      value: applied,
    },
    {
      name: "Shortlisted",
      value: shortlisted,
    },
    {
      name: "Interview",
      value: interview,
    },
    {
      name: "Selected",
      value: selected,
    },
    {
      name: "Rejected",
      value: rejected,
    },
  ].filter(
    (item) => item.value > 0
  );

  const pieColors = [
    "#2563eb",
    "#16a34a",
    "#7c3aed",
    "#059669",
    "#dc2626",
  ];

  // =====================================
  // MONTHLY APPLICATION DATA
  // =====================================

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear =
    new Date().getFullYear();

  const activityData = months.map(
    (month, index) => {
      const count =
        applications.filter(
          (application) => {
            if (!application.applied_at) {
              return false;
            }

            const date =
              new Date(
                application.applied_at
              );

            return (
              date.getFullYear() ===
                currentYear &&
              date.getMonth() === index
            );
          }
        ).length;

      return {
        month,
        applications: count,
      };
    }
  );

  // =====================================
  // RESUME ANALYTICS VALUES
  // =====================================

  const atsScore =
    resumeAnalytics?.ats_score || 0;

  const skillMatch =
    resumeAnalytics?.skill_match || 0;

  const keywordMatch =
    resumeAnalytics?.keyword_match || 0;

  const resumeCompleteness =
    resumeAnalytics?.resume_completeness || 0;

  const suitableJobCount =
    suitableJobs?.suitable_jobs || 0;

  const totalAvailableJobs =
    suitableJobs?.total_jobs || 0;

  const suitableJobPercentage =
    suitableJobs?.suitable_percentage || 0;

  // =====================================
  // RECOMMENDATION ANALYTICS
  // =====================================

  const recommendedJobCount =
    recommendations.length;

  const highMatchJobCount =
    recommendations.filter(
      (job) =>
        Number(
          job.match_percentage || 0
        ) >= 80
    ).length;

  const averageMatch =
    recommendedJobCount > 0
      ? (
          recommendations.reduce(
            (total, job) =>
              total +
              Number(
                job.match_percentage || 0
              ),
            0
          ) /
          recommendedJobCount
        ).toFixed(1)
      : 0;

  // =====================================
  // SKILLS
  // =====================================

  const userSkills =
    profile?.skills || [];

  const missingSkills =
    resumeAnalytics?.missing_skills || [];

  const matchedSkills =
    resumeAnalytics?.matched_skills || [];

  // =====================================
  // HIRING TRENDS SUMMARY VALUES
  // =====================================

  const totalHiringJobs =
    hiringTrends?.total_jobs || 0;

  const totalHiringCompanies =
    hiringTrends?.total_companies || 0;

  const latestMonth =
    hiringTrends?.monthly_job_postings?.length
      ? hiringTrends.monthly_job_postings[
          hiringTrends.monthly_job_postings.length - 1
        ]
      : null;

  const topSkill =
    hiringTrends?.top_skills?.length
      ? hiringTrends.top_skills[0]
      : null;

  const topLocation =
    hiringTrends?.top_locations?.length
      ? hiringTrends.top_locations[0]
      : null;

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="dashboard-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Your career and job-search
            insights at a glance.
          </p>

        </div>

      </div>


      {/* =====================================
          APPLICATION ANALYTICS
      ====================================== */}

      <section className="dashboard-section">

        <div className="section-title">

          <div>

            <h2>
              Application Analytics
            </h2>

            <p>
              Track your application
              progress and activity.
            </p>

          </div>

          <button
            className="text-button"
            onClick={() =>
              navigate(
                "/jobseeker/my-applications"
              )
            }
          >
            View Applications →
          </button>

        </div>


        {/* SUMMARY CARDS */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              📄
            </div>

            <div>

              <span>
                Total Applications
              </span>

              <strong>
                {loadingApplications
                  ? "..."
                  : total}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon yellow">
              ⏳
            </div>

            <div>

              <span>
                Applied
              </span>

              <strong>
                {loadingApplications
                  ? "..."
                  : applied}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Shortlisted
              </span>

              <strong>
                {loadingApplications
                  ? "..."
                  : shortlisted}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              ★
            </div>

            <div>

              <span>
                Selected
              </span>

              <strong>
                {loadingApplications
                  ? "..."
                  : selected}
              </strong>

            </div>

          </div>

        </div>


        {/* CHARTS */}

        <div className="charts-grid">

          {/* PIE CHART */}

          <div className="dashboard-card">

            <div className="card-title">

              <h3>
                Application Status
              </h3>

              <p>
                Application distribution
              </p>

            </div>


            {pieData.length === 0 ? (

              <div className="empty-chart">

                <span>
                  📊
                </span>

                <p>
                  No applications yet.
                </p>

              </div>

            ) : (

              <div className="pie-container">

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >

                  <PieChart>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >

                      {pieData.map(
                        (item, index) => (

                          <Cell
                            key={item.name}
                            fill={
                              pieColors[
                                index %
                                pieColors.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>


                <div className="pie-label">

                  <strong>
                    {total}
                  </strong>

                  <span>
                    Applications
                  </span>

                </div>

              </div>

            )}

          </div>


          {/* AREA CHART */}

          <div className="dashboard-card">

            <div className="card-title">

              <h3>
                Application Activity
              </h3>

              <p>
                Monthly applications in{" "}
                {currentYear}
              </p>

            </div>


            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <AreaChart
                data={activityData}
              >

                <defs>

                  <linearGradient
                    id="activityFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0.03}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />


                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />


                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />


                <Tooltip />


                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#activityFill)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

      </section>


      {/* =====================================
          RESUME PERFORMANCE
      ====================================== */}

      <section className="dashboard-section">

        <div className="section-title">

          <div>

            <h2>
              Resume Performance
            </h2>

            <p>
              See how your resume performs
              against job requirements.
            </p>

          </div>

        </div>


        <div className="resume-grid">


          {/* ATS SCORE */}

          <div className="ats-card">

            <span>
              Overall ATS Score
            </span>


            <div className="ats-circle">

              <strong>
                {loadingAnalytics
                  ? "..."
                  : `${atsScore}%`}
              </strong>

            </div>


            <p>
              Your resume compatibility
              based on your analyzed
              applications.
            </p>


            {/* SUITABLE JOBS */}

            <div
              className="ats-suitable-jobs"
              onClick={() =>
                navigate(
                  "/jobseeker/suitable-jobs"
                )
              }
              style={{
                cursor: "pointer",
              }}
            >

              <div className="ats-suitable-title">
                Suitable Jobs
              </div>


              <div className="ats-suitable-count">

                {loadingSuitableJobs
                  ? "..."
                  : `${suitableJobCount} / ${totalAvailableJobs}`}

              </div>


              <div className="ats-suitable-percentage">

                {loadingSuitableJobs
                  ? "..."
                  : `${suitableJobPercentage}%`}
                {" "}resume match

              </div>


              <div className="ats-suitable-description">

                Jobs with an ATS score of{" "}

                {suitableJobs?.threshold ?? 60}%

                {" "}or above match your resume.

              </div>


              <div
                style={{
                  marginTop: "12px",
                  fontWeight: "600",
                  color: "#2563eb",
                  fontSize: "14px",
                }}
              >
                View Suitable Jobs →
              </div>

            </div>

          </div>


          {/* PERFORMANCE */}

          <div className="dashboard-card performance-card">

            <PerformanceBar
              label="Skill Match"
              value={skillMatch}
            />

            <PerformanceBar
              label="Keyword Match"
              value={keywordMatch}
            />

            <PerformanceBar
              label="Resume Completeness"
              value={resumeCompleteness}
            />

          </div>

        </div>

      </section>


      {/* =====================================
          SKILL GAP + RECOMMENDATIONS
      ====================================== */}

      <section className="two-column">


        {/* SKILL GAP */}

        <div className="dashboard-card">

          <div className="card-title">

            <h3>
              Skill Gap Analysis
            </h3>

            <p>
              Skills that can improve
              your opportunities.
            </p>

          </div>


          <h4>
            Your Skills
          </h4>


          <div className="skill-tags">

            {userSkills.length === 0 ? (

              <span className="skill-empty">
                No skills added yet.
              </span>

            ) : (

              userSkills.map(
                (skill, index) => (

                  <span
                    className="skill-good"
                    key={index}
                  >
                    {skill}
                  </span>

                )
              )

            )}

          </div>


          <h4 className="improve-title">
            Matched Skills
          </h4>


          <div className="skill-tags">

            {matchedSkills.length === 0 ? (

              <span className="skill-empty">
                No matched skills found.
              </span>

            ) : (

              matchedSkills.map(
                (skill, index) => (

                  <span
                    className="skill-good"
                    key={index}
                  >
                    {skill}
                  </span>

                )
              )

            )}

          </div>


          <h4 className="improve-title">
            Skills to Improve
          </h4>


          <div className="skill-tags">

            {missingSkills.length === 0 ? (

              <span className="skill-empty">
                No missing skills found.
              </span>

            ) : (

              missingSkills.map(
                (skill, index) => (

                  <span
                    className="skill-missing"
                    key={index}
                  >
                    {skill}
                  </span>

                )
              )

            )}

          </div>

        </div>


        {/* RECOMMENDATIONS */}

        <div className="dashboard-card">

          <div className="card-title">

            <h3>
              Recommendation Insights
            </h3>

            <p>
              Your personalized job
              recommendations.
            </p>

          </div>


          <div className="recommendation-grid">

            <div>

              <span>
                Recommended Jobs
              </span>

              <strong>
                {loadingRecommendations
                  ? "..."
                  : recommendedJobCount}
              </strong>

            </div>


            <div>

              <span>
                High Match Jobs
              </span>

              <strong>
                {loadingRecommendations
                  ? "..."
                  : highMatchJobCount}
              </strong>

            </div>


            <div>

              <span>
                Average Match
              </span>

              <strong>
                {loadingRecommendations
                  ? "..."
                  : `${averageMatch}%`}
              </strong>

            </div>

          </div>


          <button
            className="recommendation-button"
            onClick={() =>
              navigate(
                "/jobseeker/recommended-jobs"
              )
            }
          >
            View Recommendations →
          </button>

        </div>

      </section>


      {/* =====================================
          HIRING TRENDS SUMMARY
      ====================================== */}

      <section className="dashboard-section">

        <div className="section-title">

          <div>

            <h2>
              Hiring Trends
            </h2>

            <p>
              Quick overview of the current
              job market.
            </p>

          </div>

          <button
            className="text-button"
            onClick={() =>
              navigate(
                "/jobseeker/hiring-trends"
              )
            }
          >
            View Full Trends →
          </button>

        </div>


        <div className="hiring-summary-card">

          {loadingHiringTrends ? (

            <div className="hiring-summary-loading">
              Loading hiring trends...
            </div>

          ) : hiringTrends ? (

            <>

              <div className="hiring-summary-icon">
                📈
              </div>


              <div className="hiring-summary-content">

                <h3>
                  Job Market Overview
                </h3>

                <p>
                  A quick snapshot of current
                  hiring activity.
                </p>


                <div className="hiring-summary-grid">

                  <div className="hiring-summary-stat">

                    <span>
                      Total Jobs
                    </span>

                    <strong>
                      {totalHiringJobs}
                    </strong>

                  </div>


                  <div className="hiring-summary-stat">

                    <span>
                      Companies
                    </span>

                    <strong>
                      {totalHiringCompanies}
                    </strong>

                  </div>


                  <div className="hiring-summary-stat">

                    <span>
                      Latest Month
                    </span>

                    <strong>
                      {latestMonth
                        ? latestMonth.count
                        : 0}
                    </strong>

                    <small>
                      {latestMonth
                        ? latestMonth.month
                        : "No data"}
                    </small>

                  </div>


                  <div className="hiring-summary-stat">

                    <span>
                      Top Skill
                    </span>

                    <strong>
                      {topSkill
                        ? topSkill.skill
                        : "N/A"}
                    </strong>

                    {topSkill && (
                      <small>
                        {topSkill.count} job(s)
                      </small>
                    )}

                  </div>


                  <div className="hiring-summary-stat">

                    <span>
                      Top Location
                    </span>

                    <strong>
                      {topLocation
                        ? topLocation.location
                        : "N/A"}
                    </strong>

                    {topLocation && (
                      <small>
                        {topLocation.count} job(s)
                      </small>
                    )}

                  </div>

                </div>


                <button
                  className="hiring-trends-button"
                  onClick={() =>
                    navigate(
                      "/jobseeker/hiring-trends"
                    )
                  }
                >
                  Explore Hiring Trends →
                </button>

              </div>

            </>

          ) : (

            <div className="hiring-summary-empty">

              <div className="hiring-summary-icon">
                📈
              </div>

              <div>

                <h3>
                  Hiring Trends
                </h3>

                <p>
                  Hiring market data is
                  currently unavailable.
                </p>

                <button
                  className="hiring-trends-button"
                  onClick={() =>
                    navigate(
                      "/jobseeker/hiring-trends"
                    )
                  }
                >
                  Open Hiring Trends →
                </button>

              </div>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}


/* =====================================
   PERFORMANCE BAR
===================================== */

function PerformanceBar({
  label,
  value,
}) {
  const safeValue = Math.min(
    Math.max(
      Number(value) || 0,
      0
    ),
    100
  );

  return (
    <div className="performance-bar">

      <div className="performance-header">

        <span>
          {label}
        </span>

        <strong>
          {safeValue.toFixed(2)}%
        </strong>

      </div>


      <div className="progress-background">

        <div
          className="progress-value"
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}

export default Dashboard;