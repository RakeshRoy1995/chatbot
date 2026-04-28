import axios from "axios";

export const analyzeWithAI = async (text) => {
  
  const prompt = `
  You are a strict JSON generator.

  RULES:
  - Output ONLY valid JSON
  - No explanations
  - No markdown
  - No extra text
  - JSON must be complete and parseable
  - If unsure, use empty string, empty array, or null
  - Always close all brackets

  Return this exact structure:

  {
    "candidateSummary": "",
    "skills": [],
    "experienceLevel": 0,
    "jobRolesSuitableFor": [],
    "weakPoints": [],
    "candidateName": "",
    "candidateEmail": "",
    "candidatePhone": "",
    "candidateAddress": "",
    "candidateProfessionalList": [],
    "improvementSuggestions": [],
    "experience_years": 0,
    "roles": [],
    "projects": [],
    "system_design": false,
    "leadership": false,
    "cloud_experience": false
  }

  CV:
  ${text}
  `;

  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt,
    stream: false,
  });

  return res.data.response;
};



export const analyzeWithAIJobMatcher = async (text ) => {
  const prompt = `
  You are a professional Software Company HR AI.

  Analyze this CV and return:

  CV:
  ${text}

  Our Requirements :
  {
    "title": "Senior Software Engineer",
    "required_skills": ["Node.js", "AWS", "System Design"],
    "experience_required": 5,
    "must_have": ["Microservices", "Scalability"],
    "nice_to_have": ["Kubernetes"],
    "responsibilities": ["Lead team", "Design architecture"]
  }

  Return in clean html format only.
`;

  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt,
    stream: false,
  });

  return res.data.response;
};