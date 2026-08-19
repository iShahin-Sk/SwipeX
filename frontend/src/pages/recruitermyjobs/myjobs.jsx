import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./myjobs.css";

function RecruiterMyJobs() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {

        try {

            const res = await API.get("recruiter/jobs/");

            setJobs(res.data);

        } catch (err) {

            console.log(err);

        }

    };

    const handleDelete = async (jobId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmDelete) return;

        try {

            await API.delete(
                `recruiter/jobs/${jobId}/delete/`
            );

            setJobs(
                jobs.filter((job) => job.id !== jobId)
            );

            alert("Job deleted successfully!");

        } catch (err) {

            console.log(err.response?.data);

            alert("Unable to delete job.");

        }

    };

    return (

        <div className="myjobs-container">

            <h1>My Jobs</h1>

            {jobs.length === 0 ? (

                <p>No Jobs Posted Yet.</p>

            ) : (

                <div className="jobs-grid">

                    {jobs.map((job) => (

                        <div
                            className="job-card"
                            key={job.id}
                        >

                            <h2>{job.title}</h2>

                            <p>
                                <strong>Company:</strong>{" "}
                                {job.company.name}
                            </p>

                            <p>
                                <strong>Location:</strong>{" "}
                                {job.location}
                            </p>

                            <p>
                                <strong>Salary:</strong>{" "}
                                {job.salary}
                            </p>

                            <p>
                                <strong>Experience:</strong>{" "}
                                {job.experience}
                            </p>

                            <p>
                                <strong>Job Type:</strong>{" "}
                                {job.job_type}
                            </p>

                            <div className="job-buttons">

                                <button
                                    className="edit-btn"
                                    onClick={() =>
                                        navigate(
                                            `/recruiter/edit-job/${job.id}`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={() =>
                                        handleDelete(job.id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default RecruiterMyJobs;