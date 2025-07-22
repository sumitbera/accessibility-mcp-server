const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');
const { generateCombinedReport } = require('../utils/reportAggregator');
const { clearDir, ensureDir } = require('../utils/fsUtils');
const path = require('path');
require('dotenv').config();

// Define the reports directory
const reportsDir = path.join(__dirname, '../reports');

async function run() {
  const prompt = process.argv.slice(2).join(' ');
  if (!prompt) {
    console.error('❌ Please provide a prompt as an argument');
    console.log('Usage: node devRunner.js "Your test prompt"');
    return;
  }

  try {
    // Prepare reports directory
    ensureDir(reportsDir);
    clearDir(reportsDir);
    console.log(`[MCP] Reports directory cleaned: ${reportsDir}`);

    console.log('🧠 Generating flow(s) from LLM...');
    const flowData = await callLLM(prompt);

    // Handle single or multi-stage flows
    const flows = Array.isArray(flowData.flows) ? flowData.flows : [flowData];
    console.log(`✅ LLM generated ${flows.length} flow(s).`);

    // Execute each flow
    for (const flow of flows) {
      console.log(`🚀 Executing flow: ${flow.name || flow.url}`);
      await callMCP(flow);
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