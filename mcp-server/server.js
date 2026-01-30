const express = require('express');
const bodyParser = require('body-parser');
const Docker = require('dockerode');

const app = express();
const port = 4000;
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.use(bodyParser.json());

// --- Tool Execution Logic ---

// This function pulls an image if it doesn't exist, runs a command in a new container,
// captures the output, and removes the container.
async function runDockerCommand(imageName, cmd) {
    return new Promise(async (resolve, reject) => {
        let output = '';
        const stdout = new require('stream').Writable({
            write(chunk, encoding, callback) {
                output += chunk.toString();
                callback();
            }
        });

        console.log(`[MCP] Checking for image: ${imageName}`);
        try {
            await docker.getImage(imageName).inspect();
            console.log(`[MCP] Image found locally.`);
        } catch (e) {
            console.log(`[MCP] Image not found. Pulling ${imageName}...`);
            await new Promise((resolvePull, rejectPull) => {
                docker.pull(imageName, (err, stream) => {
                    if (err) return rejectPull(err);
                    docker.modem.followProgress(stream, (err, res) => err ? rejectPull(err) : resolvePull(res));
                });
            });
            console.log(`[MCP] Image pull complete.`);
        }
        
        console.log(`[MCP] Running command in Docker: image=${imageName}, cmd=${cmd.join(' ')}`);

        docker.run(imageName, cmd, stdout, { Tty: false }, (err, data, container) => {
            container.remove(); // Clean up the container
            if (err) {
                return reject(err);
            }
            if (data.StatusCode !== 0) {
                 return reject(new Error(`Container for ${imageName} exited with status code ${data.StatusCode}. Output: ${output}`));
            }
            resolve(output);
        });
    });
}

// Map tool IDs to functions that prepare and run their Docker commands.
const TOOL_RUNNERS = {
    'sherlock-maigret': async (args) => {
        const { username } = args;
        if (!username || typeof username !== 'string') {
            throw new Error('Username (string) is required for Sherlock tool.');
        }
        // Basic sanitization
        const sanitizedUsername = username.replace(/[^a-zA-Z0-9_-]/g, '');
        const imageName = 'sherlockproject/sherlock';
        const cmd = [sanitizedUsername, '--no-color'];
        return await runDockerCommand(imageName, cmd);
    },
    'spiderfoot': async (args) => {
        const { target } = args;
        if (!target || typeof target !== 'string') {
            throw new Error('Target (string) is required for Spiderfoot tool.');
        }
        const imageName = 'smicallef/spiderfoot';
        // Note: Spiderfoot CLI is complex. This is a very basic footprint scan.
        const cmd = ['-s', target];
        return await runDockerCommand(imageName, cmd);
    },
    // Add other CLI-based tools here, e.g., 'exiftool'
};

// --- API Endpoints ---

app.post('/execute', async (req, res) => {
    const { toolId, args } = req.body;
    console.log(`[MCP] Received request to execute tool: ${toolId} with args:`, args);

    const runner = TOOL_RUNNERS[toolId];
    if (!runner) {
        return res.status(404).json({ error: `Tool '${toolId}' is not an executable tool via MCP.` });
    }

    try {
        const result = await runner(args);
        console.log(`[MCP] Execution of '${toolId}' successful.`);
        // Truncate long results to avoid overwhelming the AI context
        const truncatedResult = result.length > 5000 ? result.substring(0, 5000) + "\n... (output truncated)" : result;
        res.json({ success: true, output: truncatedResult });
    } catch (error) {
        console.error(`[MCP] Error executing tool '${toolId}':`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('MCP Server is running.');
});

app.listen(port, () => {
    console.log(`✅ MCP Server listening at http://localhost:${port}`);
});
