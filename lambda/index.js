const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const userprompt = body.prompt;
        if (!userPrompt) {
            return { statusCode: 400, body: 'Missing "prompt" in request body' };
        }
        //Step 1: Ask bedrock to generate a test flow
        const flow = await callLLM(userPrompt);

        //Step 2: Forward the flow to MCP server for execution
        const testResult = await callMCP(flow);

        return {
            statusCode: 200,
            body: JSON.stringify({
                flow,
                result: testResult.summary,
                htmlReport: testResult.htmlReport
            })
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        }
    }
};