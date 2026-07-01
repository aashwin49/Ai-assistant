const mongoose = require('mongoose');

/**
 * Job description schema : String
 * Resume text : String
 * Self description : String
 * 
 * Format:
 * 
 * matchScore : Number
 * 
 * Tech. questions stored in array
 *       [{
 *       question: "",
 *       intention: "",
 *       answer: "",
 *       }] 
 * Behavioral questions 
 *      [{
 *       question: "",
 *       intention: "",
 *       answer: "",
 *       }] 
 * Skill gaps [{
 *       Skil: "",
 *       Severity: "",
 *       type: String,
 *       enum: ["low", "medium", "high"]
 *       }]
 * Prep. plan  array with objects like day1...dayn
 *      [{
 *      day: Number,
 *      focus: String,
 *      tasks: [String] array of string
 *      }] 
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, "Question is required"] },
    intention: { type: String, required: [true, "Intention is required"] },
    answer: { type: String, required: [true, "Answer is required"] },
}, { _id: false });

const behavioralQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, "Question is required"] },
    intention: { type: String, required: [true, "Intention is required"] },
    answer: { type: String, required: [true, "Answer is required"] },
}, { _id: false });

const skillGapSchema = new mongoose.Schema({
    skill: { type: String, required: [true, "Skill is required"] },
    severity: { type: String, required: [true, "Severity is required"], enum: ["low", "medium", "high"] },
}, { _id: false });

const prepPlanSchema = new mongoose.Schema({
    day: { type: Number, required: [true, "Day is required"] },
    focus: { type: String, required: [true, "Focus is required"] },
    tasks: [{ type: String, required: [true, "Tasks are required"] }],
}, { _id: false });


const interviewReportSchema = new mongoose.Schema({
    jobDescription: { type: String, required: [true, "Job description is required"] },
    resumeText: { type: String },
    selfDescription: { type: String },
    matchScore: { type: Number, min: 0, max: 100 },

    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    prepPlan: [prepPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    }
}, { timestamps: true });


const InterviewReportModel = mongoose.model('InterviewReport', interviewReportSchema);

module.exports = InterviewReportModel;