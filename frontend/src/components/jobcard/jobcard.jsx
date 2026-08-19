import "./JobCard.css";

function JobCard({
  job,
  onLike,
  onDislike,
  onApply,
  applied,
}) {

  return (
    <div className="job-card">

      <div className="company-header">

        <div className="company-logo">
          {job.company.name.charAt(0)}
        </div>

        <div>
          <h2>{job.title}</h2>
          <h3>{job.company.name}</h3>
        </div>

      </div>

      <div className="job-details">

        <p>📍 {job.location}</p>

        <p>💰 {job.salary}</p>

        <p>💼 {job.job_type}</p>

        <p>🧑‍💻 {job.experience}</p>

      </div>

      <div className="skills">
        <span>{job.skills}</span>
      </div>

      <p className="description">
        {job.description}
      </p>

      <div className="button-group">

        <button
          className="like-btn"
          onClick={onLike}
        >
          ❤️ Like
        </button>

        <button
          className="dislike-btn"
          onClick={onDislike}
        >
          ❌ Dislike
        </button>

        <button
          className="apply-btn"
          onClick={onApply}
          disabled={applied}
        >
          {applied ? "✅ Applied" : "📩 Apply Now"}
        </button>

      </div>

    </div>
  );
}

export default JobCard;