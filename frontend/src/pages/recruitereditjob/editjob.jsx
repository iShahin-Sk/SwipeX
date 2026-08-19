import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./editjob.css";

function RecruiterEditJob() {

    const navigate = useNavigate();
    const { id } = useParams();

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
        fetchJob();
    }, []);

    const fetchCompanies = async () => {

        try {

            const res = await API.get("companies/");

            setCompanies(res.data);

        } catch (err) {

            console.log(err);

        }

    };

    const fetchJob = async () => {

        try {

            const res = await API.get(
                `recruiter/jobs/${id}/`
            );

            setFormData({
                title: res.data.title,
                description: res.data.description,
                location: res.data.location,
                salary: res.data.salary,
                experience: res.data.experience,
                skills: res.data.skills,
                job_type: res.data.job_type,
                company_id: res.data.company.id,
            });

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

            await API.patch(
                `recruiter/jobs/${id}/update/`,
                formData
            );

            alert("Job Updated Successfully!");

            navigate("/recruiter/my-jobs");

        } catch (err) {

            console.log(err.response?.data);

            alert("Unable to update job.");

        }

    };

    return (

        <div className="post-job-container">

            <h1>Edit Job</h1>

            <form
                className="post-job-form"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    name="title"
                    placeholder="Job Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Job Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="salary"
                    placeholder="Salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="experience"
                    placeholder="Experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="skills"
                    placeholder="Skills (Comma Separated)"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                />

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

                <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    required
                >

                    <option value="">
                        Select Company
                    </option>

                    {companies.map((company) => (

                        <option
                            key={company.id}
                            value={company.id}
                        >
                            {company.name}
                        </option>

                    ))}

                </select>

                <button type="submit">
                    Update Job
                </button>

            </form>

        </div>

    );

}

export default RecruiterEditJob;