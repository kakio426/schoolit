
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const dotenvPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

console.log("Loading .env from:", dotenvPath);

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    // Custom fetch to list models since SDK might hide it or require newer version
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("=== Available Gemini Models ===");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`Model: ${m.name}`);
                    console.log(`- Supported methods: ${m.supportedGenerationMethods.join(", ")}`);
                }
            });
        } else {
            console.log("Error fetching models:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
