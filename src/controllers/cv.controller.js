import fs from "fs/promises";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { analyzeWithAI, analyzeWithAIJobMatcher } from "../services/ai.service.js";

export const analyzeCVPage = (req, res) => {
  res.render("index");
};

export const uploadCV = async (req, res) => {
  try {
    const text = await extractTextFromPDF(req.file.path);
    const result = await analyzeWithAI(text);
    const jobMatcher = await analyzeWithAIJobMatcher(result);
    console.log("🚀 ~ uploadCV ~ jobMatcher:", jobMatcher)
    await fs.unlink(req.file.path);
    
    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    res.render("result", {
    data: parsed,
    jobMatcher: jobMatcher
    });
    
  } catch (err) {
    res.send(err.message);
  }
};