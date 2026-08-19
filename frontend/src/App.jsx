import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/landing/landing.jsx";
import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";

import layout from "./components/layout/layout.jsx";

// ======================
// Job Seeker Pages
// ======================

import JobSeekerDashboard from "./pages/jobseekerdashboard/dashboard.jsx";
import DiscoverJobs from "./pages/discoverjobs/discoverjobs.jsx";
import RecommendedJobs from "./pages/recommendedjobs/recommendedjobs.jsx";
import SuitableJobs from "./pages/suitablejobs/suitablejobs.jsx";
import HiringTrends from "./pages/hiringtrends/Hiringtrends.jsx";
import Companies from "./pages/companies/companies.jsx";
import SavedJobs from "./pages/savedjobs/savedjobs.jsx";
import MyApplications from "./pages/myapplications/myapplications.jsx";
import Profile from "./pages/profile/profile.jsx";

// ======================
// Recruiter Pages
// ======================

import RecruiterDashboard from "./pages/recruiterdashboard/dashboard.jsx";
import RecruiterPostJob from "./pages/recruiterpostjob/postjob.jsx";
import RecruiterMyJobs from "./pages/recruitermyjobs/myjobs.jsx";
import RecruiterEditJob from "./pages/recruitereditjob/editjob.jsx";
import RecruiterApplicants from "./pages/recruiterapplicants/applicants.jsx";
import RecruiterAnalytics from "./pages/recruiteranalytics/analytics.jsx";

import "./app.css"; // ✅ CSS import corrected

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================
            PUBLIC ROUTES
        ====================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ======================
            JOB SEEKER ROUTES
        ====================== */}
        <Route path="/jobseeker" element={<Layout />}>
          <Route path="dashboard" element={<JobSeekerDashboard />} />
          <Route path="jobs" element={<DiscoverJobs />} />
          <Route path="recommended-jobs" element={<RecommendedJobs />} />
          <Route path="suitable-jobs" element={<SuitableJobs />} />
          <Route path="hiring-trends" element={<HiringTrends />} />
          <Route path="companies" element={<Companies />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="my-applications" element={<MyApplications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ======================
            RECRUITER ROUTES
        ====================== */}
        <Route path="/recruiter" element={<Layout />}>
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="post-job" element={<RecruiterPostJob />} />
          <Route path="my-jobs" element={<RecruiterMyJobs />} />
          <Route path="edit-job/:id" element={<RecruiterEditJob />} />
          <Route path="applicants" element={<RecruiterApplicants />} />
          <Route path="analytics" element={<RecruiterAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
