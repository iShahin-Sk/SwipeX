import { useState, useEffect } from "react";
import API from "../../services/api";
import "./postjob.css";

function RecruiterPostJob() {

    const [companies, setCompanies] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        experience: "",
        skills: "",
        job_type: "Full-Time",
        company_id: "",
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await API.get("companies/");
            setCompanies(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await API.post(
                "recruiter/jobs/create/",
                formData
            );

            alert("Job Posted Successfully!");

            setFormData({
                title: "",
                description: "",
                location: "",
                salary: "",
                experience: "",
                skills: "",
                job_type: "Full-Time",
                company_id: "",
            });

        } catch (err) {
            console.log(err.response?.data);
            alert("Unable to post job");
        }
    };

    return (

        <div className="post-job-container">

            <form
                className="post-job-form"
                onSubmit={handleSubmit}
            >

                <h1>Post New Job</h1>

                <div className="form-grid">

                    <div className="form-group full-width">
                        <label>Job Title</label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Software Engineer"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Job Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the role..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>

                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Hyderabad"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Salary</label>

                        <input
                            type="text"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            placeholder="10 LPA"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Experience</label>

                        <input
                            type="text"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="2 Years"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Job Type</label>

                        <select
                            name="job_type"
                            value={formData.job_type}
                            onChange={handleChange}
                        >
                            <option>Full-Time</option>
                            <option>Part-Time</option>
                            <option>Internship</option>
                            <option>Remote</option>
                        </select>

                    </div>

                    <div className="form-group">
                        <label>Company</label>

                        <select
                            name="company_id"
                            value={formData.company_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Company</option>

                            {companies.map((company) => (

                                <option
                                    key={company.id}
                                    value={company.id}
                                >
                                    {company.name}
                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="form-group">
                        <label>Skills</label>

                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="React, Django, Python"
                            required
                        />
                    </div>

                </div>

                <button
                    className="post-btn"
                    type="submit"
                >
                    Post Job
                </button>

            </form>

        </div>

    );
}

export default RecruiterPostJob;