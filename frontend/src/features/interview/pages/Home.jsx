import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/home.scss";
import { useInterview } from "../hooks/useinterview";

const formatReportDate = (dateValue) => {
  if (!dateValue) return "Recently created";

  const reportDate = new Date(dateValue);
  if (Number.isNaN(reportDate.getTime())) return "Recently created";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(reportDate);
};

const getScoreClassName = (score) => {
  if (score >= 80) return "report-card__score report-card__score--strong";
  if (score >= 60) return "report-card__score report-card__score--good";
  return "report-card__score report-card__score--focus";
};

const Home = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeInputRef = useRef(null);
  const navigate = useNavigate();
  const { reports, generateReport } = useInterview();

  const recentReports = useMemo(() => {
    return Array.isArray(reports) ? reports.slice(0, 6) : [];
  }, [reports]);

  const handleResumeChange = () => {
    const resumeFile = resumeInputRef.current?.files?.[0];
    setResumeFileName(resumeFile?.name || "");
  };

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];
    setIsGenerating(true);

    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      if (data?._id) {
        navigate(`/interview/${data._id}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenReport = (reportId) => {
    if (reportId) {
      navigate(`/interview/${reportId}`);
    }
  };

  return (
    <main className="home">
      <section className="home__header">
        <h1>
          Create Your Custom{" "}
          <span>Interview Plan</span>
        </h1>

        <p>
          Let our AI analyze the job requirements and your unique profile to
          build a winning strategy.
        </p>
      </section>

      <section className="strategy-card">
        <div className="strategy-card__body">
          {/* LEFT PANEL */}
          <div className="strategy-card__panel strategy-card__panel--left">
            <div className="panel-heading">
              <div className="panel-heading__title">
                <span className="panel-heading__icon">▣</span>
                <h2>Target Job Description</h2>
              </div>

              <span className="tag tag--required">Required</span>
            </div>

            <div className="textarea-wrap textarea-wrap--job">
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                maxLength={5000}
                placeholder={
                  "Paste the full job description here...\n\ne.g. 'Senior Frontend Engineer at Google requires\nproficiency in React, TypeScript, and large-scale system\ndesign...'"
                }
              />

              <span className="char-count">{jobDescription.length} / 5000 chars</span>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="strategy-card__panel strategy-card__panel--right">
            <div className="panel-heading panel-heading--profile">
              <div className="panel-heading__title">
                <span className="panel-heading__icon">♙</span>
                <h2>Your Profile</h2>
              </div>
            </div>

            <div className="field-block">
              <div className="field-block__header">
                <label className="field-label" htmlFor="resume">
                  Upload Resume
                </label>

                <span className="tag tag--best">Best Results</span>
              </div>

              <label className="upload-box" htmlFor="resume">
                <span className="upload-box__icon">↟</span>

                <span className="upload-box__title">
                  {resumeFileName || "Click to upload or drag & drop"}
                </span>

                <span className="upload-box__sub">
                  PDF or DOCX (Max 5MB)
                </span>
              </label>

              <input
                ref={resumeInputRef}
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.docx"
                hidden
                onChange={handleResumeChange}
              />
            </div>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <div className="field-block">
              <label className="field-label" htmlFor="selfDescription">
                Quick Self-Description
              </label>

              <div className="textarea-wrap textarea-wrap--self">
                <textarea
                  id="selfDescription"
                  name="selfDescription"
                  value={selfDescription}
                  onChange={(event) => setSelfDescription(event.target.value)}
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                />
              </div>
            </div>

            <div className="notice-box">
              <span className="notice-box__icon">i</span>

              <p>
                Either a <strong>Resume</strong> or a{" "}
                <strong>Self Description</strong> is required to generate a
                personalized plan.
              </p>
            </div>
          </div>
        </div>

        <div className="strategy-card__footer">
          <p>
            AI-Powered Strategy Generation <span>·</span> Approx 30s
          </p>

          <button
            type="button"
            className="generate-btn"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            <span>★</span>
            {isGenerating ? "Generating..." : "Generate My Interview Strategy"}
          </button>
        </div>
      </section>

      <section className="recent-reports" aria-labelledby="recent-reports-title">
        <div className="recent-reports__header">
          <div>
            <span className="recent-reports__eyebrow">Recent plans</span>
            <h2 id="recent-reports-title">Your Interview Plans</h2>
          </div>

          {recentReports.length > 0 && (
            <span className="recent-reports__count">
              {recentReports.length} saved
            </span>
          )}
        </div>

        {recentReports.length > 0 ? (
          <div className="reports-list">
            {recentReports.map((report) => {
              const score = Number(report.matchScore ?? 0);

              return (
                <button
                  type="button"
                  className="report-card"
                  key={report._id}
                  onClick={() => handleOpenReport(report._id)}
                >
                  <span className={getScoreClassName(score)}>
                    {Number.isNaN(score) ? 0 : score}%
                  </span>

                  <span className="report-card__content">
                    <strong>{report.title || "Interview Plan"}</strong>
                    <span>{formatReportDate(report.createdAt)}</span>
                  </span>

                  <span className="report-card__arrow">›</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="recent-reports__empty">
            <strong>No interview plans yet</strong>
            <span>Generated reports will appear here for quick access.</span>
          </div>
        )}
      </section>

      <footer className="home__links">
        <a href="/">Privacy Policy</a>
        <a href="/">Terms of Service</a>
        <a href="/">Help Center</a>
      </footer>
    </main>
  );
};

export default Home;
