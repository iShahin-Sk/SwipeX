import { useEffect, useState } from "react";
import API from "../../services/api";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import "./myapplications.css";

function MyApplications() {

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await API.get("my-applications/");
            setApplications(res.data);
        } catch (err) {
            console.log(
                "Application fetch error:",
                err.response?.data || err.message
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleApplication = (id) => {
        setExpandedId(
            expandedId === id ? null : id
        );
    };

    const getInitial = (companyName) => {
        if (!companyName) return "?";
        return companyName.charAt(0).toUpperCase();
    };

    const getStatusClass = (status) => {
        return status
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Applied":
                return "🟡";
            case "Shortlisted":
                return "🟢";
            case "Interview":
                return "🔵";
            case "Selected":
                return "🟣";
            case "Rejected":
                return "🔴";
            default:
                return "⚪";
        }
    };

    /* =========================================
       STATUS COUNTS
    ========================================= */

    const getCount = (status) => {
        return applications.filter(
            (app) => app.status === status
        ).length;
    };

    const totalApplications =
        applications.length;

    const appliedCount =
        getCount("Applied");

    const shortlistedCount =
        getCount("Shortlisted");

    const interviewCount =
        getCount("Interview");

    const selectedCount =
        getCount("Selected");

    const rejectedCount =
        getCount("Rejected");


    /* =========================================
       PIE CHART DATA
    ========================================= */

    const statusChartData = [
        {
            name: "Applied",
            value: appliedCount,
        },
        {
            name: "Shortlisted",
            value: shortlistedCount,
        },
        {
            name: "Interview",
            value: interviewCount,
        },
        {
            name: "Selected",
            value: selectedCount,
        },
        {
            name: "Rejected",
            value: rejectedCount,
        },
    ].filter((item) => item.value > 0);


    const PIE_COLORS = [
        "#f59e0b",
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
        "#ef4444",
    ];


    /* =========================================
       APPLICATION ACTIVITY DATA
    ========================================= */

    const buildMonthlyActivity = () => {

        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const currentYear =
            new Date().getFullYear();

        const monthlyCounts =
            months.map((month, index) => {

                const count =
                    applications.filter(
                        (application) => {

                            if (
                                !application.applied_at
                            ) {
                                return false;
                            }

                            const date =
                                new Date(
                                    application.applied_at
                                );

                            return (
                                date.getFullYear() ===
                                    currentYear &&
                                date.getMonth() ===
                                    index
                            );
                        }
                    ).length;

                return {
                    month,
                    applications: count,
                };
            });

        return monthlyCounts;
    };

    const monthlyActivity =
        buildMonthlyActivity();


    /* =========================================
       TRACKER LOGIC
    ========================================= */

    const statusOrder = [
        "Applied",
        "Shortlisted",
        "Interview",
        "Selected",
    ];

    const getStageState = (
        applicationStatus,
        stage
    ) => {

        if (
            applicationStatus ===
            "Rejected"
        ) {
            return "completed";
        }

        const currentIndex =
            statusOrder.indexOf(
                applicationStatus
            );

        const stageIndex =
            statusOrder.indexOf(stage);

        if (
            currentIndex === -1 ||
            stageIndex === -1
        ) {
            return "";
        }

        if (
            stageIndex < currentIndex
        ) {
            return "completed";
        }

        if (
            stageIndex === currentIndex
        ) {
            return "current";
        }

        return "upcoming";
    };


    /* =========================================
       FILTER
    ========================================= */

    const filteredApplications =
        filter === "All"
            ? applications
            : applications.filter(
                  (application) =>
                      application.status ===
                      filter
              );


    if (loading) {
        return (
            <div className="myapplications-container">
                <div className="loading-applications">
                    Loading Applications...
                </div>
            </div>
        );
    }


    return (
        <div className="myapplications-container">

            {/* =================================
                HEADER
            ================================= */}

            <div className="applications-page-header">

                <div>
                    <h1>
                        My Applications
                    </h1>

                    <p>
                        Track and manage your
                        job applications.
                    </p>
                </div>

            </div>


            {/* =================================
                SUMMARY CARDS
            ================================= */}

            <div className="application-summary">

                <div className="summary-card">
                    <span>
                        Total Applications
                    </span>

                    <strong>
                        {totalApplications}
                    </strong>
                </div>

                <div className="summary-card">
                    <span>
                        Applied
                    </span>

                    <strong>
                        {appliedCount}
                    </strong>
                </div>

                <div className="summary-card">
                    <span>
                        Shortlisted
                    </span>

                    <strong>
                        {shortlistedCount}
                    </strong>
                </div>

                <div className="summary-card">
                    <span>
                        Interviews
                    </span>

                    <strong>
                        {interviewCount}
                    </strong>
                </div>

                <div className="summary-card">
                    <span>
                        Selected
                    </span>

                    <strong>
                        {selectedCount}
                    </strong>
                </div>

                <div className="summary-card">
                    <span>
                        Rejected
                    </span>

                    <strong>
                        {rejectedCount}
                    </strong>
                </div>

            </div>


            {/* =================================
                HISTORY DASHBOARD
            ================================= */}

            <div className="application-analytics">


                {/* STATUS PIE CHART */}

                <div className="analytics-card">

                    <div className="analytics-header">

                        <h2>
                            Application Status
                        </h2>

                        <p>
                            Distribution of your
                            applications by status.
                        </p>

                    </div>

                    <div className="pie-chart-container">

                        {statusChartData.length === 0 ? (

                            <div className="no-chart-data">
                                No application data yet.
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            statusChartData
                                        }
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={105}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >

                                        {statusChartData.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        PIE_COLORS[
                                                            index %
                                                                PIE_COLORS.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>


                {/* APPLICATION ACTIVITY */}

                <div className="analytics-card">

                    <div className="analytics-header">

                        <div>
                            <h2>
                                Application Activity
                            </h2>

                            <p>
                                Your application
                                activity throughout{" "}
                                {new Date().getFullYear()}.
                            </p>
                        </div>

                    </div>


                    <div className="activity-chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <AreaChart
                                data={
                                    monthlyActivity
                                }
                            >

                                <defs>

                                    <linearGradient
                                        id="applicationGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >

                                        <stop
                                            offset="5%"
                                            stopColor="#4f46e5"
                                            stopOpacity={
                                                0.35
                                            }
                                        />

                                        <stop
                                            offset="95%"
                                            stopColor="#4f46e5"
                                            stopOpacity={
                                                0.02
                                            }
                                        />

                                    </linearGradient>

                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                />

                                <XAxis
                                    dataKey="month"
                                />

                                <YAxis
                                    allowDecimals={false}
                                />

                                <Tooltip />

                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fill="url(#applicationGradient)"
                                />

                            </AreaChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>


            {/* =================================
                FILTERS
            ================================= */}

            <div className="history-header">

                <div>
                    <h2>
                        Application History
                    </h2>

                    <p>
                        Click an application to
                        view its progress.
                    </p>
                </div>

            </div>

            <div className="application-filters">

                {[
                    "All",
                    "Applied",
                    "Shortlisted",
                    "Interview",
                    "Selected",
                    "Rejected",
                ].map((status) => (

                    <button
                        key={status}
                        className={
                            filter === status
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setFilter(status)
                        }
                    >
                        {status}
                    </button>

                ))}

            </div>


            {/* =================================
                APPLICATION HISTORY
            ================================= */}

            {filteredApplications.length === 0 ? (

                <div className="empty-card">

                    <div className="empty-icon">
                        📄
                    </div>

                    <h2>
                        No Applications Found
                    </h2>

                    <p>
                        {filter === "All"
                            ? "Start applying for jobs to see them here."
                            : `You don't have any ${filter.toLowerCase()} applications.`}
                    </p>

                </div>

            ) : (

                <div className="applications-list">

                    {filteredApplications.map(
                        (application) => {

                            const isExpanded =
                                expandedId ===
                                application.id;

                            const company =
                                application.job
                                    ?.company;

                            const job =
                                application.job;

                            return (

                                <div
                                    className={`application-item ${
                                        isExpanded
                                            ? "expanded"
                                            : ""
                                    }`}
                                    key={
                                        application.id
                                    }
                                >

                                    {/* SINGLE LINE */}

                                    <div
                                        className="application-row"
                                        onClick={() =>
                                            toggleApplication(
                                                application.id
                                            )
                                        }
                                    >

                                        <div className="application-company">

                                            <div className="company-logo">
                                                {getInitial(
                                                    company?.name
                                                )}
                                            </div>

                                            <div className="job-info">

                                                <h2>
                                                    {job?.title ||
                                                        "Job"}
                                                </h2>

                                                <span>
                                                    {company?.name ||
                                                        "Company"}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="application-location">

                                            📍{" "}
                                            {job?.location ||
                                                "N/A"}

                                        </div>


                                        <div className="application-date">

                                            {new Date(
                                                application.applied_at
                                            ).toLocaleDateString()}

                                        </div>


                                        <div
                                            className={`row-status ${getStatusClass(
                                                application.status
                                            )}`}
                                        >

                                            {getStatusIcon(
                                                application.status
                                            )}

                                            {
                                                application.status
                                            }

                                        </div>


                                        <div className="expand-arrow">

                                            {isExpanded
                                                ? "▲"
                                                : "▼"}

                                        </div>

                                    </div>


                                    {/* EXPANDED TRACKER */}

                                    {isExpanded && (

                                        <div className="application-expanded">

                                            <div className="expanded-details">

                                                <div>
                                                    <span>
                                                        Job Type
                                                    </span>

                                                    <strong>
                                                        {job?.job_type ||
                                                            "N/A"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Salary
                                                    </span>

                                                    <strong>
                                                        {job?.salary ||
                                                            "N/A"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Location
                                                    </span>

                                                    <strong>
                                                        {job?.location ||
                                                            "N/A"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Applied On
                                                    </span>

                                                    <strong>
                                                        {new Date(
                                                            application.applied_at
                                                        ).toLocaleDateString()}
                                                    </strong>
                                                </div>

                                            </div>


                                            <div className="tracker-title">
                                                Application Progress
                                            </div>


                                            {application.status ===
                                            "Rejected" ? (

                                                <div className="tracker">

                                                    <div className="tracker-wrapper">

                                                        <div className="tracker-stage completed">

                                                            <div className="stage-circle">
                                                                ✓
                                                            </div>

                                                            <span>
                                                                Applied
                                                            </span>

                                                        </div>

                                                        <div className="tracker-line completed-line"></div>

                                                    </div>


                                                    <div className="tracker-wrapper">

                                                        <div className="tracker-stage completed">

                                                            <div className="stage-circle">
                                                                ✓
                                                            </div>

                                                            <span>
                                                                Shortlisted
                                                            </span>

                                                        </div>

                                                        <div className="tracker-line completed-line"></div>

                                                    </div>


                                                    <div className="tracker-wrapper">

                                                        <div className="tracker-stage completed">

                                                            <div className="stage-circle">
                                                                ✓
                                                            </div>

                                                            <span>
                                                                Interview
                                                            </span>

                                                        </div>

                                                        <div className="tracker-line rejected-line"></div>

                                                    </div>


                                                    <div className="tracker-stage rejected-stage">

                                                        <div className="stage-circle">
                                                            ✕
                                                        </div>

                                                        <span>
                                                            Rejected
                                                        </span>

                                                    </div>

                                                </div>

                                            ) : (

                                                <div className="tracker">

                                                    {statusOrder.map(
                                                        (
                                                            stage,
                                                            index
                                                        ) => {

                                                            const state =
                                                                getStageState(
                                                                    application.status,
                                                                    stage
                                                                );

                                                            return (

                                                                <div
                                                                    className="tracker-wrapper"
                                                                    key={
                                                                        stage
                                                                    }
                                                                >

                                                                    <div
                                                                        className={`tracker-stage ${state}`}
                                                                    >

                                                                        <div className="stage-circle">

                                                                            {state ===
                                                                            "completed"
                                                                                ? "✓"
                                                                                : state ===
                                                                                  "current"
                                                                                ? "●"
                                                                                : ""}

                                                                        </div>

                                                                        <span>
                                                                            {
                                                                                stage
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    {index <
                                                                        statusOrder.length -
                                                                            1 && (

                                                                        <div
                                                                            className={`tracker-line ${
                                                                                state ===
                                                                                "completed"
                                                                                    ? "completed-line"
                                                                                    : ""
                                                                            }`}
                                                                        />

                                                                    )}

                                                                </div>

                                                            );
                                                        }
                                                    )}

                                                </div>

                                            )}


                                            <div
                                                className={`current-status ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >

                                                <span>
                                                    Current Status
                                                </span>

                                                <strong>
                                                    {
                                                        getStatusIcon(
                                                            application.status
                                                        )
                                                    }{" "}
                                                    {
                                                        application.status
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            );
                        }
                    )}

                </div>

            )}

        </div>
    );
}

export default MyApplications;