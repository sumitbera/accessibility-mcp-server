const fs = require('fs');
const path = require('path');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Load system prompt
const promptTemplate = fs.readFileSync(path.join(__dirname, 'prompts/extract-intent.txt'), 'utf-8');
const modelId = process.env.BEDROCK_MODEL_ID;

async function callLLM(userPrompt) {
    try {
        const messages = [
            { role: "user", content: promptTemplate + "\n" + userPrompt }
        ];

        const body = JSON.stringify({
            messages,
            max_tokens: 1024,
            temperature: 0.7,
            anthropic_version: "bedrock-2023-05-31" // required for Claude 3.5
        });

        const command = new InvokeModelCommand({
            modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body
        });

        const response = await bedrock.send(command);

        // No need to stream, just parse the response body
        const responseBody = await response.body.transformToString();
        const result = JSON.parse(responseBody);

        if (!result.content?.[0]?.text) {
            throw new Error('No response text from Claude');
        }

        return JSON.parse(result.content[0].text);

    } catch (error) {
        console.error('[Bedrock] LLM error:', error);
        throw new Error('Failed to get response from Bedrock');
    }
}

module.exports = { callLLM };