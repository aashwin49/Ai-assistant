const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description Generate an interview report based on the provided resume, self-description, and job description. The resume should be sent as a file with the key 'resume'.
 * @access Private
 */
interviewRouter.post("/", authUser, upload.single("resume"), interviewController.generateInterViewReportController);

/**
 * @route GET /api/interview/reports/:interviewId
 * @description Get a specific interview report by its ID for the authenticated user.
 * @access Private
 */
interviewRouter.get("/reports/:interviewId", authUser, interviewController.getInterviewReportController);

/**
 * @route POST /api/interview/resume/pdf/:interviewId
 * @description Generate a PDF resume for a saved interview report.
 * @access Private
 */
interviewRouter.post("/resume/pdf/:interviewId", authUser, interviewController.generateResumePdfController);

/**
 * @route GET /api/interview/:interviewId
 * @description Get a specific interview report by its ID for the authenticated user.
 * @access Private
 */
interviewRouter.get("/:interviewId", authUser, interviewController.getInterviewReportController);

/**
 * @route GET /api/interview/
 * @description get all interview reports for the authenticated user
 * @access Private
 */
interviewRouter.get("/",authUser, interviewController.getAllInterviewReportsController);

module.exports = interviewRouter;
