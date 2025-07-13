const fs = require('fs');
const path = require('path');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Load system prompt from pormpts folder
const promptTemplate = fs.readFileSync(path.join(__dirname, 'prompts/extract-intent.txt'), 'utf-8');

// Model ID loaded from environment variable
const modelId = process.env.BEDROCK_MODEL_ID || 'deepseek.r1-v1:0'


async function callLLM(userPrompt) {
    try {
        const input = [
            { role: "system", content: promptTemplate },
            { role: "user", content: userPrompt }
        ];

        const command = new InvokeModelCommand({
            modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({ messages: input })
        });

        const response = await bedrock.send(command);
        const body = await streamToString(response.body);
        const result = JSON.parse(body);

        if (!result.content?.[0]?.text) {
            throw new Error('No response content from LLM')
        }

        return JSON.parse(result.content[0].text);
    } catch (error) {
        console.error('[Bedrock] LLM error:', error);
        throw new Error('Failed to get response from Bedrock');
    }
}

//Helper function to convert stream to string
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
}

module.exports = { callLLM };