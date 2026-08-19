import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./profile.css";

function Profile() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    full_name: "",
    headline: "",
    location: "",
    experience_years: 0,
    skills: [],
    resume: null,
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    try {

      const response = await API.get("profile/");

      setProfile(response.data);

      setSkillsInput(
        response.data.skills?.join(", ") || ""
      );

    }

    catch (error) {

      console.log(error);

    }

    setLoading(false);

  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleResumeChange = (e) => {

    if (e.target.files.length > 0) {

      setResumeFile(
        e.target.files[0]
      );

    }

  };

  const handleSave = async (e) => {

    e.preventDefault();

    setSaving(true);

    setMessage("");

    try {

      const formData = new FormData();

      formData.append(
        "full_name",
        profile.full_name
      );

      formData.append(
        "headline",
        profile.headline
      );

      formData.append(
        "location",
        profile.location
      );

      formData.append(
        "experience_years",
        profile.experience_years
      );

      formData.append(
        "skills",
        JSON.stringify(
          skillsInput
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== "")
        )
      );

      if (resumeFile) {

        formData.append(
          "resume",
          resumeFile
        );

      }

      const response = await API.put(
        "profile/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setProfile(response.data);

      setResumeFile(null);

      setSkillsInput(
        response.data.skills?.join(", ") || ""
      );

      setMessage(
        "Profile updated successfully! ✅"
      );

    }

    catch (error) {

      console.log(error);

      setMessage(
        "Failed to update profile ❌"
      );

    }

    finally {

      setSaving(false);

    }

  };

  const handleDeleteResume = async () => {

    try {

      const formData = new FormData();

      formData.append(
        "delete_resume",
        "true"
      );

      const response = await API.put(
        "profile/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setProfile(response.data);

      setResumeFile(null);

      setMessage(
        "Resume deleted successfully! ✅"
      );

    }

    catch (error) {

      console.log(error);

      setMessage(
        "Failed to delete resume ❌"
      );

    }

  };

  const handleLogout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");

  };

  if (loading) {

    return (
      <div className="profile-page">
        <h2>Loading Profile...</h2>
      </div>
    );

  }

  return (

    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-header">

          <div className="profile-avatar">

            {profile.username
              ? profile.username.charAt(0).toUpperCase()
              : "U"}

          </div>

          <div>

            <h1>
              {profile.full_name || profile.username}
            </h1>

            <p>@{profile.username}</p>

          </div>

        </div>

        <form
          className="profile-form"
          onSubmit={handleSave}
        >

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={profile.username}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Professional Headline</label>
            <input
              type="text"
              name="headline"
              value={profile.headline}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={profile.experience_years}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">

            <label>Skills</label>

            <input
              type="text"
              value={skillsInput}
              onChange={(e) =>
                setSkillsInput(e.target.value)
              }
              placeholder="Python, Django, React"
            />

            <small>
              Separate skills using commas
            </small>

          </div>

          <div className="form-group">

            <label>Resume (PDF)</label>

            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeChange}
            />

            {profile.resume && (

              <>

                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="resume-link"
                >
                  📄 View Uploaded Resume
                </a>

                <button
                  type="button"
                  className="delete-resume-btn"
                  onClick={handleDeleteResume}
                >
                  🗑 Delete Resume
                </button>

              </>

            )}

          </div>

          {message && (

            <p className="profile-message">
              {message}
            </p>

          )}

          <button
            type="submit"
            className="save-btn"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </form>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>

  );

}

export default Profile;