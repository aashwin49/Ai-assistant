const { GoogleGenAI } = require("@google/genai");
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = {
  type: "object",
  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
  properties: {
    title: {
      type: "string",
      description: "The title of the job for which the interview report is generated",
    },
    matchScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    technicalQuestions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        required: ["question", "intention", "answer"],
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
    behavioralQuestions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        required: ["question", "intention", "answer"],
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
    skillGaps: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        required: ["skill", "severity"],
        properties: {
          skill: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
    preparationPlan: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        required: ["day", "focus", "tasks"],
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

const resumePdfSchema = {
  type: "object",
  required: ["html"],
  properties: {
    html: {
      type: "string",
      description: "Complete HTML content for a polished, printable resume PDF.",
    },
  },
};

const parseArrayItems = (arr) =>
  (arr || []).map((item) => {
    if (typeof item !== "string") return item;

    const cleaned = item
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .replace(/^`/, "")
      .replace(/`$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return item;
    }
  });

const normalizeObjectItems = (arr) =>
  parseArrayItems(Array.isArray(arr) ? arr : Object.values(arr || {})).filter(
    (item) => item && typeof item === "object" && !Array.isArray(item)
  );

async function generateInterviewReport(resume, selfDescription, jobDescription) {
  const prompt = `Generate an interview report for the candidate based on the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return ONLY these exact fields:
title, matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan.

technicalQuestions: exactly 5 objects with question, intention, answer.
behavioralQuestions: exactly 3 objects with question, intention, answer.
skillGaps: exactly 3 objects with skill and severity. severity must be one of: low, medium, high.
preparationPlan: exactly 7 objects. day must be a number from 1 to 7, focus must be string, tasks must be array of strings.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: interviewReportSchema,
    },
  });

  const parsed = JSON.parse(response.text);

  parsed.matchScore = Number(String(parsed.matchScore).replace("%", ""));
  parsed.technicalQuestions = normalizeObjectItems(parsed.technicalQuestions);
  parsed.behavioralQuestions = normalizeObjectItems(parsed.behavioralQuestions);
  parsed.preparationPlan = normalizeObjectItems(parsed.preparationPlan);
  parsed.skillGaps = normalizeObjectItems(parsed.skillGaps)
    .map((gap) => ({
      ...gap,
      severity: gap.severity?.toLowerCase(),
    }));

  return parsed;
}

async function generatePdfFromHtml(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "16mm",
        bottom: "18mm",
        left: "16mm",
      },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate a resume for the candidate based on the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
The response must be a JSON object with a single field named "html".
The html value must be a complete HTML document with inline CSS, professional resume formatting, and no external assets.
The resume should be tailored to the job description, highlighting relevant skills and experiences. The HTML should be suitable for generating a polished, printable PDF resume.
The content of the reumse should not sound like it is generated by AI. It should be human-like, professional, and personalized to the candidate's profile and the job description.
You can highlight the content using some colors or different font styles, but keep it professional. Avoid using any external CSS or JS files. The HTML should be self-contained and ready for PDF generation.
The content should be ATS friendly, ensuring that it can be easily parsed by Applicant Tracking Systems. Use standard HTML tags and avoid complex structures that may hinder ATS parsing.
The resume should not be lengthy. It should be concise, ideally fitting within 1-2 pages, focusing on the most relevant information for the job application.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: resumePdfSchema,
    },
  });

  const jsonContent = JSON.parse(response.text);

  if (!jsonContent.html) {
    throw new Error("AI response did not include resume HTML.");
  }

  return generatePdfFromHtml(jsonContent.html);
}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml };
