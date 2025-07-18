const {callLLM} = require('./bedrockClient');
const {callMCP} = require('./mcpClient');
require('dotenv').config();

async function run() {
    const prompt = process.argv.slice(2).join(' ');
    if(!prompt) {
        console.error('❌ Please provide a prompt as an argument');
        console.log('Usage: node devRunner.js "Your test prompt"');
        return;
    }
    try {
        console.log('Generating flow from LLM...');
        const flow = await callLLM(prompt);
        console.log('✅ Flow generated successfully:', JSON.stringify(flow, null, 2));

        console.log('🚀 Sending flow to MCP server...');
        const result = await callMCP(flow);

        console.log('\n🎯 Test Complete');
        console.log('Violations:', result.summary?.length || 0);
        console.log('HTML Report:', result.htmlReportPath);
    }catch (error) {
        console.error('❌ Dry run failed:', error.message);
    }
}
run();