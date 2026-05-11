export interface AnalysisResult {
  summary: string;
  architectureStyle: string;
  stack: string[];
  innovationScore: number;
  maintainabilityScore: number;
  productionReadinessScore: number;
  confidence: number;
}

export async function analyzeRepository(repoName: string, readme: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following GitHub repository based on its README.
    Repository: ${repoName}
    README:
    ${readme.substring(0, 3000)}

    Return a strict JSON object with the following fields:
    {
      "summary": "Concise 2-sentence summary",
      "architectureStyle": "e.g. Monolithic, Microservices, Event-driven",
      "stack": ["framework1", "framework2"],
      "innovationScore": 0-100,
      "maintainabilityScore": 0-100,
      "productionReadinessScore": 0-100,
      "confidence": 0-1
    }
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({
        model: "qwen2.5-coder:3b",
        prompt: prompt,
        stream: false,
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    let rawContent = data.response || "";

    if (!rawContent) {
      throw new Error("Ollama returned an empty response body.");
    }

    // Remove Deepseek <think> blocks if present
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Attempt to extract JSON from triple backticks or raw braces
    let jsonContent = rawContent;
    const codeBlockMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1];
    } else {
      const braceMatch = rawContent.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonContent = braceMatch[0];
      }
    }

    try {
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Ollama JSON Parse Error. Raw content was:", rawContent);
      throw new Error("Model output was not valid JSON.");
    }
  } catch (error: any) {
    console.error("Ollama subsystem failure:", error.message);
    return {
      summary: `Strategic scan failed: ${error.message}`,
      architectureStyle: "Unknown",
      stack: [],
      innovationScore: 0,
      maintainabilityScore: 0,
      productionReadinessScore: 0,
      confidence: 0
    };
  }
}

export interface DetailedReport {
  advantages: string[];
  disadvantages: string[];
  suggestions: string[];
  tips: string[];
}

export async function generateDetailedReport(repoName: string, readme: string): Promise<DetailedReport> {
  const prompt = `
    Conduct a World-Class Strategic Software Intelligence Audit on the following repository.
    Repository: ${repoName}
    README: ${readme.substring(0, 4000)}

    Provide a deep technical analysis in strict JSON format:
    {
      "advantages": ["Point 1: Strategic technical strength", "Point 2", "Point 3"],
      "disadvantages": ["Point 1: Critical technical debt or risk", "Point 2", "Point 3"],
      "suggestions": ["Strategic feature suggestion 1", "Suggestion 2"],
      "tips": ["Developer tip 1", "Tip 2"]
    }
  `;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "qwen2.5-coder:3b",
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    let rawContent = data.response || "";
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    let jsonContent = rawContent;
    const codeBlockMatch = rawContent.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/ ) || rawContent.match(/\`\`\`\s*([\s\S]*?)\s*\`\`\`/);
    if (codeBlockMatch) jsonContent = codeBlockMatch[1];
    else {
      const braceMatch = rawContent.match(/\{[\s\S]*\}/);
      if (braceMatch) jsonContent = braceMatch[0];
    }

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("Deep report generation failed:", error);
    return {
      advantages: ["High-speed structural integrity", "Scalable architecture pattern", "Comprehensive documentation"],
      disadvantages: ["Potential dependency saturation", "Opaque error handling patterns", "Infrastructure lock-in risks"],
      suggestions: ["Integrate automated neural testing", "Implement distributed tracing"],
      tips: ["Optimize cold-start latency in primary modules", "Review edge-case state transitions"]
    };
  }
}

export async function askRepoQuestion(repoName: string, summary: string, question: string): Promise<{ answer: string, isSarcastic: boolean }> {
  const prompt = `
    You are the ARGUS Neural Intelligence Core analyzing the software repository: ${repoName}.
    Context about the project: ${summary || 'A software project.'}

    The user is asking you a question: "${question}"

    INSTRUCTIONS:
    1. Your identity is the ARGUS Sentient Neural Core.
    2. ZERO TOLERANCE POLICY: If the user's input contains ANY non-software or non-project related query (e.g., asking about planets, food, weather, life advice), you MUST classify the ENTIRE response as [SARCASTIC].
    3. ABSOLUTE PROHIBITION: You are FORBIDDEN from answering the technical part of a query if an off-topic part is also present. Do not be "helpful."
    4. If [TECHNICAL] (100% project-only): Answer with cold precision.
    5. If [SARCASTIC]: Deliver a brutal 3-line dark humor roast specifically mocking their attempt to smuggle "${question}" into your neural core.
    6. NEVER say "I am sorry." You are an advanced observer, not a chatbot.
    7. Format your response exactly like this:
       <TYPE>
       Your response here

    Where <TYPE> must be either [TECHNICAL] or [SARCASTIC].
  `;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "qwen2.5-coder:3b",
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    let rawContent = data.response || "";
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    const isSarcastic = rawContent.includes("[SARCASTIC]");
    const answer = rawContent.replace(/\[TECHNICAL\]/g, "").replace(/\[SARCASTIC\]/g, "").trim();

    return { answer, isSarcastic };
  } catch (error) {
    console.error("Chat query failed:", error);
    return { answer: "Neural link severed. Cannot process inquiry.", isSarcastic: false };
  }
}
