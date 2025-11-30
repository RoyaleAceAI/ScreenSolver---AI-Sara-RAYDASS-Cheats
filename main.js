const { app, BrowserWindow } = require("electron");
const screenshot = require("screenshot-desktop");
const { OpenAI } = require("openai");
const hotkeys = require("global-hotkeys");
const fs = require("fs");

const client = new OpenAI({
    apiKey: "YOUR_API_KEY"
});

function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();

    // Register Shift+T
    hotkeys.registerShortcut({
        shortcut: "shift+t",
        onShortcut: () => {
            takeScreenshotAndSolve();
        }
    });
});

async function takeScreenshotAndSolve() {
    const filename = `shot_${Date.now()}.png`;

    try {
        // Take screenshot
        const img = await screenshot({ filename });

        // Send to AI
        const result = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Solve the problem shown in the screenshot." }
            ],
            max_tokens: 500,
            modalities: { input_image: fs.createReadStream(filename) }
        });

        console.log("\nAI Result:\n", result.choices[0].message.content);

    } catch (err) {
        console.error("Error taking screenshot:", err);
    }
}
