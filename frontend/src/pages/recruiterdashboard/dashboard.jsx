import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  return (
    <>
      <h1>Welcome, Recruiter 👋</h1>

      <p>Manage your job postings and applicants.</p>

      <div className="dashboard-home">

        <div
          className="card"
          onClick={() => navigate("/recruiter/post-job")}
          style={{ cursor: "pointer" }}
        >
          <h3>➕ Post Job</h3>
          <p>Create a new job opening</p>
        </div>

        <div
          className="card"
          onClick={() => navigate("/recruiter/my-jobs")}
          style={{ cursor: "pointer" }}
        >
          <h3>💼 My Jobs</h3>
          <p>View all posted jobs</p>
        </div>

        <div
          className="card"
          onClick={() => navigate("/recruiter/applicants")}
          style={{ cursor: "pointer" }}
        >
          <h3>👥 Applicants</h3>
          <p>Review candidate applications</p>
        </div>

      </div>
    </>
  );
}

export default Dashboard;