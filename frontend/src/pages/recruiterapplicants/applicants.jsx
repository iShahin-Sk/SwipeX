import { useEffect, useState } from "react";
import API from "../../services/api";
import "./applicants.css";

function RecruiterApplicants() {

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {

        try {

            const res = await API.get(
                "recruiter/applicants/"
            );

            setApplications(res.data);

        } catch (err) {

            console.log(err.response?.data);

        }

        setLoading(false);

    };


    const updateStatus = async (id, status) => {

        try {

            await API.patch(
                `recruiter/applications/${id}/status/`,
                {
                    status: status,
                }
            );

            setApplications((prev) =>
                prev.map((application) =>
                    application.id === id
                        ? {
                            ...application,
                            status: status
                        }
                        : application
                )
            );

        } catch (err) {

            console.log(err.response?.data);

            alert("Unable to update status.");

        }

    };


    const viewResume = (resumeUrl) => {

        if (!resumeUrl) {

            alert(
                "This applicant has not uploaded a resume."
            );

            return;

        }

        window.open(
            resumeUrl,
            "_blank",
            "noopener,noreferrer"
        );

    };


    if (loading) {

        return (
            <div className="applicants-container">
                <h2>Loading Applicants...</h2>
            </div>
        );

    }


    return (

        <div className="applicants-container">

            <h1>Applicants</h1>


            {applications.length === 0 ? (

                <div className="empty-card">

                    <h2>No Applications Yet</h2>

                    <p>
                        Applicants will appear here once
                        someone applies.
                    </p>

                </div>

            ) : (

                <div className="applicants-grid">

                    {applications.map((application) => {

                        const profile =
                            application.applicant_profile;


                        return (

                            <div
                                className="applicant-card"
                                key={application.id}
                            >

                                {/* =========================
                                    JOB INFORMATION
                                ========================== */}

                                <h2>
                                    {application.job.title}
                                </h2>

                                <h3>
                                    {
                                        application.job
                                            .company.name
                                    }
                                </h3>


                                {/* =========================
                                    APPLICANT INFORMATION
                                ========================== */}

                                <div className="applicant-info">

                                    <p>
                                        <strong>
                                            Applicant:
                                        </strong>{" "}
                                        {
                                            profile?.full_name ||
                                            application.applicant
                                        }
                                    </p>


                                    {profile?.email && (

                                        <p>
                                            <strong>
                                                Email:
                                            </strong>{" "}
                                            {profile.email}
                                        </p>

                                    )}


                                    {profile?.headline && (

                                        <p>
                                            <strong>
                                                Headline:
                                            </strong>{" "}
                                            {profile.headline}
                                        </p>

                                    )}


                                    {profile?.location && (

                                        <p>
                                            <strong>
                                                Location:
                                            </strong>{" "}
                                            {profile.location}
                                        </p>

                                    )}


                                    {profile?.experience_years !==
                                        undefined && (

                                        <p>
                                            <strong>
                                                Experience:
                                            </strong>{" "}
                                            {
                                                profile
                                                    .experience_years
                                            }{" "}
                                            year(s)
                                        </p>

                                    )}

                                </div>


                                {/* =========================
                                    SKILLS
                                ========================== */}

                                {profile?.skills &&
                                    profile.skills.length > 0 && (

                                    <div className="skills-section">

                                        <strong>
                                            Skills
                                        </strong>

                                        <div className="skills-list">

                                            {profile.skills.map(
                                                (skill, index) => (

                                                    <span
                                                        className="skill-tag"
                                                        key={index}
                                                    >
                                                        {skill}
                                                    </span>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}


                                {/* =========================
                                    RESUME BUTTON
                                ========================== */}

                                <div className="resume-section">

                                    <button
                                        className="resume-button"
                                        onClick={() =>
                                            viewResume(
                                                profile?.resume_url
                                            )
                                        }
                                    >
                                        📄 View Resume
                                    </button>

                                </div>


                                {/* =========================
                                    APPLICATION DETAILS
                                ========================== */}

                                <p>
                                    <strong>
                                        Applied:
                                    </strong>{" "}
                                    {new Date(
                                        application.applied_at
                                    ).toLocaleDateString()}
                                </p>


                                {/* =========================
                                    STATUS
                                ========================== */}

                                <div className="status-box">

                                    <label>
                                        Application Status
                                    </label>

                                    <select
                                        value={
                                            application.status
                                        }
                                        onChange={(e) =>
                                            updateStatus(
                                                application.id,
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="Applied">
                                            Applied
                                        </option>

                                        <option value="Shortlisted">
                                            Shortlisted
                                        </option>

                                        <option value="Interview">
                                            Interview
                                        </option>

                                        <option value="Rejected">
                                            Rejected
                                        </option>

                                        <option value="Selected">
                                            Selected
                                        </option>

                                    </select>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}

export default RecruiterApplicants;