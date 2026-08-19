import { useEffect, useState } from "react";
import "./savedjobs.css";
import API from "../../services/api";

function SavedJobs() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    console.log("JWT Token:", localStorage.getItem("access"));

    API.get("saved-jobs/")
      .then((response) => {

        console.log("Saved Jobs API:", response.data);

        setJobs(response.data);
        setLoading(false);

      })
      .catch((error) => {

        console.log("ERROR:", error.response?.status);
        console.log("DATA:", error.response?.data);

        setLoading(false);

      });

  }, []);

  if (loading) {
    return <h2>Loading Saved Jobs...</h2>;
  }

  return (
    <div className="saved-jobs">

      <h1>❤️ Saved Jobs</h1>

      {jobs.length === 0 ? (
        <h2>No Saved Jobs</h2>
      ) : (
        jobs.map((job) => (
          <div className="saved-card" key={job.id}>

            <h2>{job.title}</h2>

            <h3>{job.company.name}</h3>

            <p>📍 {job.location}</p>

            <p>💰 {job.salary}</p>

            <p>💼 {job.job_type}</p>

            <p>{job.skills}</p>

          </div>
        ))
      )}

    </div>
  );
}

export default SavedJobs;