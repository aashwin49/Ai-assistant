import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../style/interview.scss";
import { useInterview } from "../hooks/useinterview";

const Interview = () => {
  
  const { interviewId } = useParams();
  const [activeSection, setActiveSection] = useState("technical");
  const [openIndex, setOpenIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const {loading, report, generateResumePdf} = useInterview()

  const invalidInterviewId = !interviewId || interviewId === "undefined" || interviewId === "null";

  const normalizedReport = useMemo(() => {
    if (!report) return null;

    const matchScore = Number(
      report.matchScore ??
        report.match_score ??
        report.score ??
        report.matchPercentage ??
        0
    );

    return {
      matchScore: Number.isNaN(matchScore) ? 0 : matchScore,

      technicalQuestions:
        report.technicalQuestions ||
        report.technical_questions ||
        report.technical ||
        report.questions?.technical ||
        [],

      behavioralQuestions:
        report.behavioralQuestions ||
        report.behavioral_questions ||
        report.behavioral ||
        report.questions?.behavioral ||
        [],

      skillGaps:
        report.skillGaps ||
        report.skill_gaps ||
        report.gaps ||
        report.skillsGap ||
        [],

      prepPlan:
        report.prepPlan ||
        report.preparationPlan ||
        report.preparation_plan ||
        report.prep_plan ||
        report.roadMap ||
        report.roadmap ||
        report.road_map ||
        report.roadMapPlan ||
        report.roadmapPlan ||
        report.plan ||
        report.days ||
        [],
    };
  }, [report]);

  const sections = [
    {
      id: "technical",
      label: "Technical Questions",
      icon: "<>",
    },
    {
      id: "behavioral",
      label: "Behavioral Questions",
      icon: "▱",
    },
    {
      id: "roadmap",
      label: "Road Map",
      icon: "➤",
    },
  ];

  const currentData = useMemo(() => {
    if (!normalizedReport) return [];

    if (activeSection === "technical") {
      return normalizedReport.technicalQuestions;
    }

    if (activeSection === "behavioral") {
      return normalizedReport.behavioralQuestions;
    }

    return normalizedReport.prepPlan;
  }, [activeSection, normalizedReport]);

  const currentTitle = sections.find((item) => item.id === activeSection)?.label;

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setOpenIndex(0);
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Strong match for this role";
    if (score >= 60) return "Good match, fix key gaps";
    return "Needs focused preparation";
  };

  const getSectionCountLabel = () => {
    return activeSection === "roadmap" ? "days" : "questions";
  };

  const handleDownloadResume = async () => {
    if (!interviewId || isDownloading) return;

    setIsDownloading(true);
    try {
      await generateResumePdf(interviewId);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="interview">
        <section className="interview-empty">
          <h1>Loading report...</h1>
          <p>Please wait while we prepare your interview strategy.</p>
        </section>
      </main>
    );
  }

  if (!normalizedReport) {
    return (
      <main className="interview">
        <section className="interview-empty">
          <h1>No report found</h1>
          <p>
            {invalidInterviewId
              ? "Invalid interview id in the URL."
              : "Generate an interview report first."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="interview">
      <section className="interview-layout">
        <aside className="interview-sidebar">
          <h2 className="sidebar-title">Sections</h2>

          <nav className="sidebar-nav">
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={
                  activeSection === section.id
                    ? "sidebar-nav__item sidebar-nav__item--active"
                    : "sidebar-nav__item"
                }
                onClick={() => handleSectionChange(section.id)}
              >
                <span>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="button primary-button resume-download-btn"
            onClick={handleDownloadResume}
            disabled={isDownloading}
          >
            <svg
              height="0.8rem"
              style={{ marginRight: "0.8rem" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z" />
            </svg>
            {isDownloading ? "Generating..." : "Download Resume"}
          </button>
        </aside>

        <section className="interview-main">
          <div className="main-header">
            <h1>{currentTitle}</h1>
            <span>
              {currentData.length} {getSectionCountLabel()}
            </span>
          </div>

          {currentData.length === 0 ? (
            <div className="empty-content">
              <h2>No data available</h2>
              <p>This section is empty in the fetched interview report.</p>
            </div>
          ) : activeSection === "roadmap" ? (
            <div className="roadmap-list">
              {currentData.map((plan, index) => (
                <article
                  className={
                    openIndex === index
                      ? "roadmap-item roadmap-item--open"
                      : "roadmap-item"
                  }
                  key={plan.day || index}
                >
                  <button
                    type="button"
                    className="roadmap-item__head"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <span className="question-badge">
                      D{plan.day || index + 1}
                    </span>
                    <strong>{plan.focus || plan.title || "Preparation Day"}</strong>
                    <span className="chevron">
                      {openIndex === index ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {openIndex === index && (
                    <div className="roadmap-item__body">
                      <span className="block-label block-label--green">
                        Tasks
                      </span>

                      <ul>
                        {(plan.tasks || []).map((task, taskIndex) => (
                          <li key={`${index}-${taskIndex}`}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="question-list">
              {currentData.map((item, index) => (
                <article
                  className={
                    openIndex === index
                      ? "question-item question-item--open"
                      : "question-item"
                  }
                  key={`${activeSection}-${index}`}
                >
                  <button
                    type="button"
                    className="question-item__head"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <span className="question-badge">Q{index + 1}</span>
                    <strong>{item.question}</strong>
                    <span className="chevron">
                      {openIndex === index ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {openIndex === index && (
                    <div className="question-item__body">
                      <div className="answer-section">
                        <span className="block-label">Intention</span>
                        <p>{item.intention}</p>
                      </div>

                      <div className="answer-section">
                        <span className="block-label block-label--green">
                          Model Answer
                        </span>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="interview-right">
          <div className="score-section">
            <h2 className="right-title">Match Score</h2>

            <div
              className="score-ring"
              style={{
                "--score-angle": `${Math.min(
                  Math.max(normalizedReport.matchScore, 0),
                  100
                ) * 3.6}deg`,
              }}
            >
              <div>
                <strong>{normalizedReport.matchScore}</strong>
                <span>%</span>
              </div>
            </div>

            <p className="score-label">
              {getScoreLabel(normalizedReport.matchScore)}
            </p>

          </div>

          <div className="skill-section">
            <h2 className="right-title">Skill Gaps</h2>

            <div className="skill-list">
              {normalizedReport.skillGaps.length === 0 ? (
                <p className="empty-small">No skill gaps found.</p>
              ) : (
                normalizedReport.skillGaps.map((gap, index) => (
                  <div
                    key={`${gap.skill || gap}-${index}`}
                    className={`skill-pill skill-pill--${
                      gap.severity || "medium"
                    }`}
                  >
                    {gap.skill || gap}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Interview;
