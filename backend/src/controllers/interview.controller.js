const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
  generatePdfFromHtml,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");
const { getCacheKey, getCachedResult, setCachedResult, getCachedBuffer, setCachedBuffer } = require("../utils/cache");

async function generateInterViewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required. Send it with key 'resume'." });
    }

    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required." });
    }

    const resumeContent = await new pdfParse.PDFParse(Uint8Array.from(req.file.buffer)).getText();
    const resumeText = resumeContent.Text || resumeContent.text || "";

    const start = Date.now();
    const cacheKey = `interview:${getCacheKey(resumeText, selfDescription, jobDescription)}`;

    let interViewReportByAi = await getCachedResult(cacheKey);
    let cacheHit = true;

    if (!interViewReportByAi) {
      cacheHit = false;
      interViewReportByAi = await generateInterviewReport(resumeText, selfDescription, jobDescription);
      await setCachedResult(cacheKey, interViewReportByAi);
    }

    console.log(`[Cache ${cacheHit ? "HIT" : "MISS"}] Interview report response time: ${Date.now() - start}ms`);

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resumeText,
      selfDescription,
      jobDescription,
      title: interViewReportByAi.title || "Interview Report",
      matchScore: interViewReportByAi.matchScore,
      technicalQuestions: interViewReportByAi.technicalQuestions,
      behavioralQuestions: interViewReportByAi.behavioralQuestions,
      skillGaps: interViewReportByAi.skillGaps,
      prepPlan: interViewReportByAi.preparationPlan,
    });

    return res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
      cacheHit,
    });
  } catch (error) {
    console.error("Generate interview report error:", error);
    return res.status(500).json({ message: "Failed to generate interview report." });
  }
}

async function getInterviewReportController(req, res) {
  try {
    const { interviewId } = req.params;
    const userId = req.user?.id || req.user?._id;
    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: userId });
    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }
    return res.status(200).json({ message: "Interview report fetched successfully.", interviewReport });
  } catch (error) {
    console.error("Get interview report error:", error);
    return res.status(500).json({ message: "Failed to fetch interview report." });
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    const interviewReports = await interviewReportModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-resumeText -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -prepPlan");

    return res.status(200).json({ message: "Interview reports fetched successfully.", interviewReports });
  } catch (error) {
    console.error("Get all interview reports error:", error);
    return res.status(500).json({ message: "Failed to fetch interview reports." });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewId } = req.params;
    const userId = req.user?.id || req.user?._id;

    // User-supplied raw HTML — no Gemini call happens here, so nothing to cache.
    if (req.body?.html) {
      const pdfBuffer = await generatePdfFromHtml(req.body.html);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewId}.pdf`,
        "Content-Length": pdfBuffer.length,
      });
      return res.send(pdfBuffer);
    }

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: userId });

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    const start = Date.now();
    const cacheKey = `resume-pdf:${getCacheKey(
      interviewReport.resumeText,
      interviewReport.selfDescription,
      interviewReport.jobDescription
    )}`;

    let pdfBuffer = await getCachedBuffer(cacheKey);
    let cacheHit = true;

    if (!pdfBuffer) {
      cacheHit = false;
      pdfBuffer = await generateResumePdf({
        resume: interviewReport.resumeText,
        selfDescription: interviewReport.selfDescription,
        jobDescription: interviewReport.jobDescription,
      });
      await setCachedBuffer(cacheKey, pdfBuffer);
    }

    console.log(`[Cache ${cacheHit ? "HIT" : "MISS"}] Resume PDF response time: ${Date.now() - start}ms`);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewId}.pdf`,
      "Content-Length": pdfBuffer.length,
      "X-Cache": cacheHit ? "HIT" : "MISS",
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Generate resume PDF error:", error);
    return res.status(500).json({ message: "Failed to generate resume PDF." });
  }
}


module.exports = {
  generateInterViewReportController,
  getInterviewReportController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
