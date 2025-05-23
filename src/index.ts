import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import axios from "axios";
import readline from "readline";
import { createMCPClient } from "./client.js";

interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

async function askLLM(prompt: string) {
  try {
    console.log("Calling LLM with prompt:", prompt);
    const res = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
        stream: false,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 1000000,
      }
    );
    console.log("LLM response:", res.data);
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("LLM error:", err);
    return "Error calling LLM";
  }
}

async function getContext(client: Client, question: string) {
  let currentTime = "";
  let additionalContext = "";

  try {
    const resources = await client.readResource(
      { uri: "time://current" },
      { timeout: 1500 }
    );
    console.log("Resources response:", resources);
    currentTime =
      (resources.contents[0]?.text as string) || new Date().toLocaleString();
  } catch (err) {
    console.error("Resources read error:", err);
    currentTime = new Date().toLocaleString();
  }

  if (question.toLowerCase().includes("公理")) {
    console.log("Searching for axioms...", question);
    try {
      const result = (await client.getPrompt({
        name: "search_local_database",
        arguments: { query: question },
      })) as unknown as ToolResult;
      console.log("Tool result:", result);
      additionalContext = result?.content?.[0]?.text || "No results found.";
    } catch (err) {
      console.error("Tool call error:", err);
      additionalContext = "Error searching database";
    }
  }

  return { currentTime, additionalContext };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = await createMCPClient();

while (true) {
  const question: string = await new Promise((resolve) => {
    rl.question("You: ", resolve);
  });

  if (question.toLowerCase() === "exit") {
    console.log("Exiting...");
    rl.close();
    process.exit(0);
  }

  const context = await getContext(client, question);
  const prompt = `Time: ${context.currentTime}\nContext: ${context.additionalContext}\nQ: ${question}\nA:`;
  console.log("Prompt:", prompt);
  const answer = await askLLM(prompt);
  console.log("Assistant", answer);
}
