import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./companies.css";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/companies/")
      .then((response) => {
        setCompanies(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="companies-container">
      <h1>Companies</h1>

      <div className="companies-grid">
        {companies.map((company) => (
          <div className="company-card" key={company.id}>

            <div className="company-logo">
              {company.name.charAt(0)}
            </div>

            <h2>{company.name}</h2>

            <p>📍 {company.location}</p>

            <p>{company.description}</p>

            <button
              onClick={() =>
                navigate(`/jobseeker/jobs?company=${company.id}`)
              }
            >
              View Jobs
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Companies;