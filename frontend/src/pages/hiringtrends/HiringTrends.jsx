import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import API from "../../services/api";
import "./HiringTrends.css";

function HiringTrends() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHiringTrends();
  }, []);

  const fetchHiringTrends = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("hiring-trends/");

      setTrends(response.data);
    } catch (error) {
      console.error(
        "Error loading hiring trends:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Unable to load hiring trends."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // LOADING
  // ==========================

  if (loading) {
    return (
      <div className="hiring-loading">
        <div className="loading-spinner"></div>

        <h3>
          Loading Hiring Trends...
        </h3>

        <p>
          Analyzing current job-market data.
        </p>
      </div>
    );
  }

  // ==========================
  // ERROR
  // ==========================

  if (error) {
    return (
      <div className="hiring-error">
        <div className="error-icon">
          ⚠️
        </div>

        <h2>
          Unable to Load Hiring Trends
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={fetchHiringTrends}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================
  // DATA
  // ==========================

  const totalJobs =
    trends?.total_jobs || 0;

  const totalCompanies =
    trends?.total_companies || 0;

  const monthlyJobPostings =
    trends?.monthly_job_postings || [];

  const topSkills =
    trends?.top_skills || [];

  const jobTypeDistribution =
    trends?.job_type_distribution || [];

  const topLocations =
    trends?.top_locations || [];

  // ==========================
  // MOST COMMON JOB TYPE
  // ==========================

  const mostCommonJobType =
    jobTypeDistribution.length > 0
      ? [...jobTypeDistribution].sort(
          (a, b) => b.count - a.count
        )[0]
      : null;

  // ==========================
  // TOP SKILL
  // ==========================

  const topSkill =
    topSkills.length > 0
      ? [...topSkills].sort(
          (a, b) => b.count - a.count
        )[0]
      : null;

  // ==========================
  // PIE COLORS
  // ==========================

  const pieColors = [
    "#2563eb",
    "#16a34a",
    "#7c3aed",
    "#f59e0b",
    "#dc2626",
  ];

  return (
    <div className="hiring-trends-page">

      {/* ==========================
          HEADER
      ========================== */}

      <div className="hiring-header">

        <div>

          <h1>
            📊 Hiring Trends
          </h1>

          <p>
            Explore current job-market
            activity, in-demand skills,
            and hiring patterns.
          </p>

        </div>

      </div>


      {/* ==========================
          SUMMARY CARDS
      ========================== */}

      <div className="hiring-stats-grid">

        <div className="hiring-stat-card">

          <div className="hiring-stat-icon blue">
            💼
          </div>

          <div>
            <span>
              Total Jobs
            </span>

            <strong>
              {totalJobs}
            </strong>
          </div>

        </div>


        <div className="hiring-stat-card">

          <div className="hiring-stat-icon green">
            🏢
          </div>

          <div>
            <span>
              Companies Hiring
            </span>

            <strong>
              {totalCompanies}
            </strong>
          </div>

        </div>


        <div className="hiring-stat-card">

          <div className="hiring-stat-icon purple">
            📋
          </div>

          <div>
            <span>
              Most Common Job Type
            </span>

            <strong className="stat-text">
              {mostCommonJobType?.type ||
                "N/A"}
            </strong>
          </div>

        </div>


        <div className="hiring-stat-card">

          <div className="hiring-stat-icon orange">
            🔥
          </div>

          <div>
            <span>
              Top Skill
            </span>

            <strong className="stat-text">
              {topSkill?.skill ||
                "N/A"}
            </strong>
          </div>

        </div>

      </div>


      {/* ==========================
          CHARTS ROW
      ========================== */}

      <div className="hiring-chart-grid">

        {/* MONTHLY POSTINGS */}

        <div className="hiring-card">

          <div className="hiring-card-header">

            <div>
              <h2>
                📈 Job Posting Activity
              </h2>

              <p>
                Monthly job postings
              </p>
            </div>

          </div>

          {monthlyJobPostings.length === 0 ? (

            <div className="empty-trend">
              No monthly posting data available.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={monthlyJobPostings}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

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

                <Bar
                  dataKey="count"
                  name="Job Postings"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>


        {/* JOB TYPES */}

        <div className="hiring-card">

          <div className="hiring-card-header">

            <div>
              <h2>
                💼 Job Types
              </h2>

              <p>
                Distribution of available
                opportunities
              </p>
            </div>

          </div>

          {jobTypeDistribution.length === 0 ? (

            <div className="empty-trend">
              No job type data available.
            </div>

          ) : (

            <div className="job-type-chart">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={jobTypeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >

                    {jobTypeDistribution.map(
                      (item, index) => (
                        <Cell
                          key={item.type}
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

            </div>

          )}

          <div className="job-type-list">

            {jobTypeDistribution.map(
              (item, index) => (

                <div
                  className="job-type-item"
                  key={item.type}
                >

                  <span>

                    <span
                      className="type-dot"
                      style={{
                        background:
                          pieColors[
                            index %
                            pieColors.length
                          ],
                      }}
                    />

                    {item.type}

                  </span>

                  <strong>
                    {item.count}
                  </strong>

                </div>

              )
            )}

          </div>

        </div>

      </div>


      {/* ==========================
          SKILLS + LOCATIONS
      ========================== */}

      <div className="hiring-analysis-grid">

        {/* TOP SKILLS */}

        <div className="hiring-card">

          <div className="hiring-card-header">

            <div>
              <h2>
                🔥 In-Demand Skills
              </h2>

              <p>
                Skills appearing most frequently
                in current job postings.
              </p>
            </div>

          </div>

          {topSkills.length === 0 ? (

            <div className="empty-trend">
              No skill data available.
            </div>

          ) : (

            <div className="skills-list">

              {topSkills.map(
                (item, index) => {

                  const maxCount =
                    topSkills[0]?.count || 1;

                  const percentage =
                    (item.count /
                      maxCount) *
                    100;

                  return (
                    <div
                      className="skill-trend-item"
                      key={`${item.skill}-${index}`}
                    >

                      <div className="skill-trend-header">

                        <span>
                          <span className="skill-rank">
                            #{index + 1}
                          </span>

                          {item.skill}
                        </span>

                        <strong>
                          {item.count}
                        </strong>

                      </div>

                      <div className="skill-progress">

                        <div
                          className="skill-progress-value"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* LOCATIONS */}

        <div className="hiring-card">

          <div className="hiring-card-header">

            <div>
              <h2>
                📍 Top Hiring Locations
              </h2>

              <p>
                Locations with the highest
                number of job postings.
              </p>
            </div>

          </div>

          {topLocations.length === 0 ? (

            <div className="empty-trend">
              No location data available.
            </div>

          ) : (

            <div className="locations-list">

              {topLocations.map(
                (item, index) => (

                  <div
                    className="location-item"
                    key={`${item.location}-${index}`}
                  >

                    <div className="location-left">

                      <div className="location-rank">
                        {index + 1}
                      </div>

                      <div>
                        <strong>
                          {item.location}
                        </strong>

                        <span>
                          Job postings
                        </span>
                      </div>

                    </div>

                    <div className="location-count">
                      {item.count}
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* ==========================
          MARKET INSIGHT
      ========================== */}

      <div className="market-insight">

        <div className="market-insight-icon">
          💡
        </div>

        <div>

          <h2>
            Market Insight
          </h2>

          <p>

            {topSkill
              ? `${topSkill.skill} is currently one of the most frequently requested skills in the available job postings. `
              : "Explore the skill trends to identify valuable technologies. "}

            {mostCommonJobType
              ? `${mostCommonJobType.type} positions currently make up the largest job-type category.`
              : "Job-type information will appear as more jobs are added."}

          </p>

        </div>

      </div>

    </div>
  );
}

export default HiringTrends;