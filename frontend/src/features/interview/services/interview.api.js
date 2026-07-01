import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 * 
 * @description Generate an interview report based on the provided resume, self-description, and job description
 */
export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {
    
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }
    
   const response = await api.post("/api/interview/", formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
   });
   return response.data;
}

/**
 * @description Fetch a specific interview report by its ID for the authenticated user.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/${interviewId}`);

    return response.data;
}

/**
 * @description Fetch all interview reports for the authenticated user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");

    return response.data;
}

/**
 * 
 * @description Generate a PDF resume for a saved interview report.
 */
export const generateResumePdf = async (interviewId, htmlContent) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewId}`, { html: htmlContent }, {
        responseType: 'blob', // Important for handling binary data
    });

    return response.data; // This will be the PDF blob
}