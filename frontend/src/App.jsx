import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/landing/landing";
import Login from "./pages/login/login";
import Register from "./pages/register/register";

import Layout from "./components/Layout/Layout";

// ======================
// Job Seeker Pages
// ======================

import JobSeekerDashboard from "./pages/jobseekerdashboard/dashboard";
import DiscoverJobs from "./pages/discoverjobs/discoverjobs";
import RecommendedJobs from "./pages/recommendedjobs/recommendedjobs";
import SuitableJobs from "./pages/suitablejobs/suitablejobs";
import HiringTrends from "./pages/hiringtrends/hiringtrends";
import Companies from "./pages/companies/companies";
import SavedJobs from "./pages/savedjobs/savedjobs";
import MyApplications from "./pages/myapplications/myapplications";
import Profile from "./pages/profile/profile";

// ======================
// Recruiter Pages
// ======================

import RecruiterDashboard from "./pages/recruiterdashboard/dashboard";
import RecruiterPostJob from "./pages/recruiterpostjob/postjob";
import RecruiterMyJobs from "./pages/recruitermyjobs/myjobs";
import RecruiterEditJob from "./pages/recruitereditjob/editjob";
import RecruiterApplicants from "./pages/recruiterapplicants/applicants";
import RecruiterAnalytics from "./pages/recruiteranalytics/analytics";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ======================
            PUBLIC ROUTES
        ====================== */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ======================
            JOB SEEKER ROUTES
        ====================== */}

        <Route
          path="/jobseeker"
          element={<Layout />}
        >

          <Route
            path="dashboard"
            element={<JobSeekerDashboard />}
          />

          <Route
            path="jobs"
            element={<DiscoverJobs />}
          />

          <Route
            path="recommended-jobs"
            element={<RecommendedJobs />}
          />

          <Route
            path="suitable-jobs"
            element={<SuitableJobs />}
          />

          {/* ======================
              HIRING TRENDS
          ====================== */}

          <Route
            path="hiring-trends"
            element={<HiringTrends />}
          />

          <Route
            path="companies"
            element={<Companies />}
          />

          <Route
            path="saved-jobs"
            element={<SavedJobs />}
          />

          <Route
            path="my-applications"
            element={<MyApplications />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

        </Route>


        {/* ======================
            RECRUITER ROUTES
        ====================== */}

        <Route
          path="/recruiter"
          element={<Layout />}
        >

          <Route
            path="dashboard"
            element={<RecruiterDashboard />}
          />

          <Route
            path="post-job"
            element={<RecruiterPostJob />}
          />

          <Route
            path="my-jobs"
            element={<RecruiterMyJobs />}
          />

          <Route
            path="edit-job/:id"
            element={<RecruiterEditJob />}
          />

          <Route
            path="applicants"
            element={<RecruiterApplicants />}
          />

          <Route
            path="analytics"
            element={<RecruiterAnalytics />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;