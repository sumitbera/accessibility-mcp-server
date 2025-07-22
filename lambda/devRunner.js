const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');
const { generateCombinedReport } = require('../utils/reportAggregator');
require('dotenv').config();

async function run() {
  const prompt = process.argv.slice(2).join(' ');
  if (!prompt) {
    console.error('❌ Please provide a prompt as an argument');
    console.log('Usage: node devRunner.js "Your test prompt"');
    return;
  }

  try {
    console.log('🧠 Generating flow(s) from LLM...');
    const flowData = await callLLM(prompt);

    // Check if LLM returned multiple flows
    const flows = Array.isArray(flowData.flows) ? flowData.flows : [flowData];
    console.log(`✅ LLM generated ${flows.length} flow(s).`);

    // Execute each flow
    for (const flow of flows) {
      console.log(`🚀 Executing flow: ${flow.name || flow.url}`);
      await callMCP(flow);
    }

    console.log('\n🎯 All tests complete. Generating combined report...');
    generateCombinedReport();

    console.log('📄 Combined report ready. Check reports/combined-accessibility-report.html');

  } catch (error) {
    console.error('❌ Dry run failed:', error.message);
  }
}

run();