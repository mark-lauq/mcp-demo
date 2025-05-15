# A simple MCP Demo

> 通过 MCP TypeScript SDK 实现的 AI 聊天应用：包括 MCP 服务器提供上下文，客户端拿上下文再去调 LLM(DeepSeek) 接口

## MCP server

- Resources: 当前时间
- Tool: 本地“知识库”搜索

## Quickstart

- Rename `.env.example` to `.env` and update API_KEY with yours
- Start MCP server with `pnpm start:server`
- Start MCP client with `pnpm start`
