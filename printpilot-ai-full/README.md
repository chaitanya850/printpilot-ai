# PrintPilot AI

AI-assisted order management and cost estimation for small custom-printing and apparel businesses. Built as a portfolio project for demonstrating React, Node/Express, MongoDB, API validation, testing, and optional local LLM integration.

## Features
- Dashboard metrics and recent orders
- Create, view, search, edit-status, and delete orders
- Cost / selling-price / estimated-profit calculator (deterministic formulas)
- Natural-language order extraction using **Ollama locally** (no paid API key required), with a transparent rule-based fallback when Ollama is unavailable
- AI-generated production summary grounded in orders returned by the database
- Server-side validation and helpful error responses
- MongoDB persistence when `MONGODB_URI` is configured; otherwise an in-memory demo store for local evaluation

> The fallback parser is rule-based, not a large language model. For genuine LLM-powered extraction without a paid API key, install Ollama and pull a compatible model. Do not describe the app as using a live LLM unless Ollama is running and connected.

## Requirements
- Node.js 20+ and npm
- Optional: MongoDB local/Atlas connection
- Optional AI: [Ollama](https://ollama.com/download) and a model such as `qwen2.5:3b`

## Run locally
1. Copy `server/.env.example` to `server/.env` and adjust values if needed.
2. Install dependencies from the root:
   ```bash
   npm install
   npm run install:all
   ```
3. Start the API and frontend:
   ```bash
   npm run dev
   ```
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). API health check: `http://localhost:5000/api/health`.

If `MONGODB_URI` is blank, the server uses an in-memory store and sample orders. Data resets when the server restarts. Set a MongoDB URI for persistent data.

## Enable local AI (no API key)
1. Install and run Ollama.
2. In a terminal run `ollama pull qwen2.5:3b`.
3. Set `OLLAMA_MODEL=qwen2.5:3b` and `OLLAMA_BASE_URL=http://127.0.0.1:11434` in `server/.env`.
4. Restart the server. Check `GET /api/health` for AI status. If Ollama is unavailable, the app clearly reports fallback mode.

## Cost estimator assumptions
The demo uses editable, illustrative unit-cost assumptions in Malaysian ringgit (MYR). These are not market quotes. Replace them with the shop's real material, labour, setup and overhead costs before business use. Profit = selling price − estimated cost; margin = profit / selling price.

## API routes
- `GET /api/health`
- `GET /api/orders?search=&status=`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id`
- `POST /api/ai/extract-order`
- `POST /api/ai/production-summary`
- `POST /api/estimates`

## Tests
```bash
npm test --prefix server
```

## Before publishing
- Add your own screenshots from the running app.
- Never commit `.env` or credentials.
- Deploy the server and frontend separately and configure `VITE_API_URL` in the client build environment.
- If you use the app in a job application, accurately describe the AI provider mode and what you personally implemented.
