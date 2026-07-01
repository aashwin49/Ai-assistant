import {getAllInterviewReports, getInterviewReportById, generateInterviewReport, generateResumePdf as generateResumePdfApi} from"../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router-dom";

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const {interviewId} = useParams()

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }
    
    const {loading,setloading,report,setReport,reports,setReports} = context

const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setloading(true)
    let response = null
    try {
        response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
        setReport(response.interviewReport)
    } catch(error) {
        console.error("generateReport failed:", error)  
        setloading(false)
        return null 
    } finally {
        setloading(false)
    }
    return response?.interviewReport  
}

const getReportById = async (interviewId) => {
    setloading(true)
    let response = null
    try {
        response = await getInterviewReportById(interviewId)
        setReport(response.interviewReport)
    } catch(error) {
        console.log(error)
        return null
    } finally {
        setloading(false)
    }
    return response?.interviewReport
}

 const getAllReports = async () => {
    setloading(true)
    let response = null
    try {
        response = await getAllInterviewReports()
        setReports(response.interviewReports)  
    } catch(error) {
        console.log(error)
        return null
    } finally {
        setloading(false)
    }
    return response?.interviewReports          
}

const generateResumePdf = async (interviewId, htmlContent) => {
    setloading(true)
    let response = null
    try {
        response = await generateResumePdfApi(interviewId, htmlContent)
        const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `resume_${interviewId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch(error) {
        console.log(error)
        return null
    } finally {
        setloading(false)
    }
    return response
}

useEffect(() => {
    if(interviewId && interviewId !== "undefined" && interviewId !== "null"){
        getReportById(interviewId)
    }else{
    getAllReports()
    }
}, [interviewId])

    return {loading, report, reports, generateReport, getReportById, getAllReports, generateResumePdf}
}
