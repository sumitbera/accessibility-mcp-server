const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const userPrompt = body.prompt;

        if (!userPrompt || userPrompt.trim().length < 5) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid or missing "prompt"' })
            };
        }

        //Step 1: Ask LLM to generate test flow
        const flow = await callLLM(userPrompt);

        if (!flow?.url || !flow?.steps?.length) {
            return {
                statusCode: 422,
                body: JSON.stringify({ error: 'LLM returned an invalid test flow' })
            };
        }

        //Step 2: Forward the flow to MCP server for execution
        const result = await callMCP(flow);

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'success',
                flow,
                result: result?.summary || {},
                htmlReport: result.htmlReport
            })
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unexpected error occurred', details: error.message })
        };
    }
};