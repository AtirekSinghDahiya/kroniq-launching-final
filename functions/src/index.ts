import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";
import fetch from "node-fetch";

admin.initializeApp();
const corsHandler = cors({ origin: true });

export const proxyOpenRouter = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        // 1. Get the secret key from environment variables
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

        if (!apiKey) {
            res.status(500).json({ error: "Server Configuration Error: OPENROUTER_API_KEY is missing." });
            return;
        }

        // 2. Extract data from request
        const { messages, model } = req.body;

        if (!messages || !model) {
            res.status(400).json({ error: "Missing 'messages' or 'model' in request body." });
            return;
        }

        try {
            // 3. Call the actual API securely (server-to-server)
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://kroniq.ai",
                    "X-Title": "KroniQ AI Platform",
                },
                body: JSON.stringify({
                    model,
                    messages,
                }),
            });

            // 4. Return the response to the client
            const data = await response.json();

            // Pass through the status code
            res.status(response.status).json(data);
        } catch (error: any) {
            console.error("Error proxying to OpenRouter:", error);
            res.status(500).json({
                error: "Internal Server Error",
                details: error.message
            });
        }
    });
});
