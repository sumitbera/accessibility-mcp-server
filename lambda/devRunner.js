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
    // Prepare the reports directory
    ensureDir(reportsDir);
    clearDir(reportsDir);
    console.log(`[MCP] Reports directory cleaned: ${reportsDir}`);

    console.log('🧠 Generating flow(s) from LLM...');
    const flowData = await callLLM(prompt);

    if (!flowData || (!Array.isArray(flowData.flows) && !flowData.url)) {
      throw new Error('Invalid flow data returned from LLM.');
    }

    const flows = Array.isArray(flowData.flows) ? flowData.flows : [flowData];
    console.log(`✅ LLM generated ${flows.length} flow(s).`);

    for (let i = 0; i < flows.length; i++) {
      const flow = flows[i];
      const isLastFlow = i === flows.length - 1;

      console.log(`\n🚀 [${i + 1}/${flows.length}] Executing flow: ${flow.name || flow.url}`);
      const result = await callMCP(flow, isLastFlow);

      if (result) {
        console.log(`   ➡️  Total Violations: ${result.totalViolations}`);
        console.log(`   📄  JSON Report: ${result.jsonReportPath}`);
        console.log(`   📄  HTML Report: ${result.htmlReportPath}`);
      } else {
        console.warn('⚠️ No result returned for this flow.');
      }
    }

    console.log('\n🎯 All flows executed successfully.');
  } catch (error) {
    console.error('❌ Execution failed:', error.message);
  }
}

run();