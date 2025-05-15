import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createMCPClient() {
  const client = new Client({
    name: "Demo",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: "tsx",
    args: ["src/server.ts"],
  });

  try {
    await client.connect(transport);
    console.log("MCP Client connection successfully");
  } catch (err) {
    console.error("MCP Client connection failed:", err);
    throw err;
  }

  return client;
}
