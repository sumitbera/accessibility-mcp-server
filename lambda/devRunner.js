const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');
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

      // Ensure flow name is present
      if (!flow.name) {
        flow.name = `Flow ${i + 1} - ${flow.url || 'Unnamed URL'}`;
      }

      console.log(`\n🚀 Executing flow: ${flow.name}`);
      const result = await callMCP(flow, isLastFlow);

      console.log(`   ➡️  Total Violations: ${result.totalViolations}`);
      console.log(`   📄  JSON Report: ${result.jsonReportPath}`);
      console.log(`   📄  HTML Report: ${result.htmlReportPath}`);
    }

    console.log('\n🎯 All flows executed successfully.');
    console.log(`📊 Reports are available at: ${reportsDir}`);
  } catch (error) {
    console.error('❌ Execution failed:', error.stack || error.message);
  }
}

run();