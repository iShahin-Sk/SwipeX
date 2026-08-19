import { useEffect, useState } from "react";
import axios from "axios";
import "./analytics.css";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("access");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/recruiter/analytics/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <h1>Recruiter Analytics</h1>
        <p className="analytics-loading">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <h1>Recruiter Analytics</h1>
        <p className="analytics-error">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const total =
    analytics.applied +
    analytics.shortlisted +
    analytics.interview +
    analytics.selected +
    analytics.rejected;

  const getPercentage = (value) => {
    if (total === 0) return 0;

    return Math.round((value / total) * 100);
  };

  return (
    <div className="analytics-page">

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Recruiter Analytics</h1>
          <p>
            Monitor your application activity and hiring trends.
          </p>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="analytics-cards">

        <div className="analytics-card total-card">
          <div className="card-icon">📋</div>
          <div>
            <h3>Total Applications</h3>
            <strong>{analytics.total_applications}</strong>
          </div>
        </div>


        <div className="analytics-card applied-card">
          <div className="card-icon">📝</div>
          <div>
            <h3>Applied</h3>
            <strong>{analytics.applied}</strong>
          </div>
        </div>


        <div className="analytics-card shortlisted-card">
          <div className="card-icon">⭐</div>
          <div>
            <h3>Shortlisted</h3>
            <strong>{analytics.shortlisted}</strong>
          </div>
        </div>


        <div className="analytics-card interview-card">
          <div className="card-icon">🎯</div>
          <div>
            <h3>Interview</h3>
            <strong>{analytics.interview}</strong>
          </div>
        </div>


        <div className="analytics-card selected-card">
          <div className="card-icon">✅</div>
          <div>
            <h3>Selected</h3>
            <strong>{analytics.selected}</strong>
          </div>
        </div>


        <div className="analytics-card rejected-card">
          <div className="card-icon">❌</div>
          <div>
            <h3>Rejected</h3>
            <strong>{analytics.rejected}</strong>
          </div>
        </div>

      </div>


      {/* Main Analytics Section */}
      <div className="analytics-grid">

        {/* Application Status */}
        <div className="analytics-section">

          <div className="section-header">
            <h2>Application Status</h2>
            <span>{analytics.total_applications} total</span>
          </div>


          <div className="status-list">

            <div className="status-row">
              <div className="status-info">
                <span>Applied</span>
                <strong>{analytics.applied}</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-bar applied-progress"
                  style={{
                    width: `${getPercentage(analytics.applied)}%`,
                  }}
                ></div>
              </div>

              <span className="percentage">
                {getPercentage(analytics.applied)}%
              </span>
            </div>


            <div className="status-row">
              <div className="status-info">
                <span>Shortlisted</span>
                <strong>{analytics.shortlisted}</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-bar shortlisted-progress"
                  style={{
                    width: `${getPercentage(
                      analytics.shortlisted
                    )}%`,
                  }}
                ></div>
              </div>

              <span className="percentage">
                {getPercentage(analytics.shortlisted)}%
              </span>
            </div>


            <div className="status-row">
              <div className="status-info">
                <span>Interview</span>
                <strong>{analytics.interview}</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-bar interview-progress"
                  style={{
                    width: `${getPercentage(
                      analytics.interview
                    )}%`,
                  }}
                ></div>
              </div>

              <span className="percentage">
                {getPercentage(analytics.interview)}%
              </span>
            </div>


            <div className="status-row">
              <div className="status-info">
                <span>Selected</span>
                <strong>{analytics.selected}</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-bar selected-progress"
                  style={{
                    width: `${getPercentage(
                      analytics.selected
                    )}%`,
                  }}
                ></div>
              </div>

              <span className="percentage">
                {getPercentage(analytics.selected)}%
              </span>
            </div>


            <div className="status-row">
              <div className="status-info">
                <span>Rejected</span>
                <strong>{analytics.rejected}</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-bar rejected-progress"
                  style={{
                    width: `${getPercentage(
                      analytics.rejected
                    )}%`,
                  }}
                ></div>
              </div>

              <span className="percentage">
                {getPercentage(analytics.rejected)}%
              </span>
            </div>

          </div>

        </div>


        {/* Monthly Trends */}
        <div className="analytics-section">

          <div className="section-header">
            <h2>Application Trends</h2>
            <span>Monthly</span>
          </div>


          {analytics.monthly_trends &&
          analytics.monthly_trends.length > 0 ? (

            <div className="trend-chart">

              {analytics.monthly_trends.map(
                (item, index) => {

                  const maxCount = Math.max(
                    ...analytics.monthly_trends.map(
                      (trend) => trend.count
                    )
                  );

                  const height =
                    maxCount === 0
                      ? 0
                      : Math.max(
                          (item.count / maxCount) * 100,
                          10
                        );

                  return (
                    <div
                      className="trend-item"
                      key={index}
                    >

                      <div className="trend-value">
                        {item.count}
                      </div>

                      <div className="trend-bar-container">

                        <div
                          className="trend-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        ></div>

                      </div>

                      <div className="trend-month">
                        {item.month}
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="no-trends">
              No application trend data available yet.
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Analytics;