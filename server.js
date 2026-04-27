import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { getHistory, addMessage } from "./memory.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// homepage
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// create session
app.get("/session", (req, res) => {
  res.json({ sessionId: uuidv4() });
});

app.get("/products-data", (req, res) => {
    const products = JSON.parse(
    fs.readFileSync("./products.json", "utf-8")
    );
  res.json(products);
});

// products page
app.get("/products", (req, res) => {
  res.sendFile(process.cwd() + "/public/products.html");
});

// chat endpoint
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const history = getHistory(sessionId);

    let prompt = "";
    history.forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
    prompt += `user: ${message}\nassistant:`;

    const response = await axios({
      method: "post",
      url: "http://localhost:11434/api/generate",
      data: {
        model: "llama3",
        prompt,
        stream: true
      },
      responseType: "stream"
    });

    res.setHeader("Content-Type", "text/plain");

    let fullReply = "";

    response.data.on("data", chunk => {
      const lines = chunk.toString().split("\n");

      lines.forEach(line => {
        if (!line.trim()) return;

        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullReply += json.response;
            res.write(json.response); // send chunk to frontend
          }
        } catch (e) {}
      });
    });

    response.data.on("end", () => {
      addMessage(sessionId, "user", message);
      addMessage(sessionId, "assistant", fullReply);
      res.end();
    });

  } catch (err) {
    res.status(500).end("Error: " + err.message);
  }
});


function extractJSONFallback(text) {
  console.log("🚀 ~ extractJSONFallback ~ text:", text)


  try {

    const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    const jsonString = text.slice(start, end + 1);
    return JSON.parse(jsonString);
  }

    
  } catch (error) {
    throw new Error("No JSON found");
  }
  

  
}

function removeJSONBlock(text) {
  return text.replace(/{[\s\S]*?}/, "");
}

function extractExplanation(text) {
  const match = text.match(/Explanation:\s*([\s\S]*?)(Compare:|$)/i);

  if (match && match[1]) {
    return match[1].trim();
  }

  return "";
}

function explanationToArray(text) {
  return text
    .split(".")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s + ".");
}

app.post("/ai-advance-filter", async (req, res) => {

    const products = JSON.parse(
    fs.readFileSync("./products.json", "utf-8")
    );
  
    try {

        const { message } = req.body;

        const matchedProducts = products

        const prompt = `
          You must ONLY return valid JSON. Do not include any text before or after JSON.

          User question:
          ${message}

          Products:
          ${matchedProducts.map(p =>
          `id:${p.id}, name:${p.name}, price:${p.price}, description:${p.description}, category:${p.category}, rating:${p.rating}, features:${p.features}, stock:${p.stock}`
          ).join('\n')}

          Return ONLY this JSON format:
          {
            "products": [number],
            "recommendation": "string",
            "explaination": "string",
            "Comparison": "string"
          }

          Rules:
          - Output MUST be valid JSON
          - No extra text
          - No explanation outside JSON
          - No markdown
          - No greeting
          - Start with { and end with }
          - Recommendation product will be given in products index

          JSON:
          `;

        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "llama3",
            prompt,
            stream: false,
            options: {
              stop: ["\n\n", "I can help", "Let me know"]
            }
        });


        const raw = response.data.response;
        console.log("🚀 ~ raw:", raw)

        // extract first JSON block
        const jsonMatch = raw.match(/\{[\s\S]*\}/);

        const cleanJson = jsonMatch ? jsonMatch[0] : null;

        const parsed = JSON.parse(cleanJson);
        const data = extractJSONFallback(response.data.response);

        

        const final = {
            product : data,
            explanation : null
        }

        res.json({ reply: final });

        
    } catch (error) {
      console.log("error" , error);
      
        res.status(500).end("Error: " + err.message);
    }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});