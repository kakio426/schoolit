
try {
    const { GoogleAIFileManager } = require("@google/generative-ai/server");
    console.log("GoogleAIFileManager found in @google/generative-ai/server");
} catch (e) {
    console.log("Not found in /server, trying root...");
    try {
        const { GoogleAIFileManager } = require("@google/generative-ai");
        console.log("GoogleAIFileManager found in root package");
    } catch (e2) {
        console.log("GoogleAIFileManager NOT FOUND");
    }
}
