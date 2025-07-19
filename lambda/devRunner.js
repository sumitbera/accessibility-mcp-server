const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');
require('dotenv').config();

function simplifyFlow(flow, userPrompt) {
    const lowerPrompt = userPrompt.toLowerCase();
    const isSimpleScan = !(lowerPrompt.includes('login') || lowerPrompt.includes('sign up') || lowerPrompt.includes('register') || lowerPrompt.includes('checkout'));

    if (isSimpleScan) {
        flow.steps = [
            { action: 'goto', value: flow.url }
        ];
    }

    return flow;
}

async function run() {
    const prompt = process.argv.slice(2).join(' ');
    if (!prompt) {
        console.error('❌ Please provide a prompt as an argument');
        console.log('Usage: node devRunner.js "Your test prompt"');
        return;
    }

    try {
        console.log('Generating flow from LLM...');
        let flow = await callLLM(prompt);

        // Simplify for single page scans
        flow = simplifyFlow(flow, prompt);

        console.log('✅ Flow generated successfully:', JSON.stringify(flow, null, 2));

        console.log('🚀 Sending flow to MCP server...');
        const result = await callMCP(flow);

        console.log('\n🎯 Test Complete');
        console.log('Violations:', result.summary?.length || 0);
        console.log('HTML Report:', result.htmlReport);
    } catch (error) {
        console.error('❌ Dry run failed:', error.message);
    }
}

run();
