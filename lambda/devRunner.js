const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');
const { generateCombinedReport } = require('../utils/reportAggregator');
const { clearDir, ensureDir } = require('../utils/fsUtils');
const path = require('path');
require('dotenv').config();

const reportsDir = path.join(__dirname, '../reports');

async function run() {
  const prompt = process.argv.slice(2).join(' ');
  if (!prompt) {
    console.error('❌ Please provide a prompt as an argument');
    console.log('Usage: node devRunner.js "Your test prompt"');
    return;
  }

  try {
    // Clean and prepare the reports directory
    ensureDir(reportsDir);
    clearDir(reportsDir);
    console.log(`[MCP] Reports directory cleaned: ${reportsDir}`);

    console.log('🧠 Generating flow(s) from LLM...');
    const flowData = await callLLM(prompt);

    // Handle single or multi-step flows
    const flows = Array.isArray(flowData.flows) ? flowData.flows : [flowData];
    console.log(`✅ LLM generated ${flows.length} flow(s).`);

    for (let i = 0; i < flows.length; i++) {
      const flow = flows[i];
      const isLastFlow = i === flows.length - 1;

      console.log(`\n🚀 Executing flow: ${flow.name || flow.url}`);
      await callMCP(flow, isLastFlow);
    }

    // Generate final combined report
    console.log('\n🎯 All tests complete. Generating combined report...');
    generateCombinedReport();

    console.log(`📄 Combined report ready: ${path.join(reportsDir, 'combined-accessibility-report.html')}`);
  } catch (error) {
    console.error('❌ Dry run failed:', error.message);
  }
}

run();