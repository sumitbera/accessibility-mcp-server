const { callLLM } = require('./bedrockClient');
const { callMCP } = require('./mcpClient');
const { clearDir, ensureDir } = require('../utils/fsUtils');
const path = require('path');
const Table = require('cli-table3'); // For clean ASCII table output
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

    // Handle single or multi-step flows
    const flows = Array.isArray(flowData.flows) ? flowData.flows : [flowData];
    console.log(`✅ LLM generated ${flows.length} flow(s).`);

    // Grand totals
    let grandTotal = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    let totalAcrossAll = 0;

    for (let i = 0; i < flows.length; i++) {
      const flow = flows[i];
      const isLastFlow = i === flows.length - 1;

      console.log(`\n🚀 Executing flow: ${flow.name || flow.url}`);
      const result = await callMCP(flow, isLastFlow);

      // Calculate per-flow totals
      const flowTotals = { critical: 0, serious: 0, moderate: 0, minor: 0 };
      (result.summary || []).forEach(v => {
        const nodeCount = Array.isArray(v.nodes) ? v.nodes.length : 1;
        if (v.impact && flowTotals[v.impact] !== undefined) {
          flowTotals[v.impact] += nodeCount;
          grandTotal[v.impact] += nodeCount;
          totalAcrossAll += nodeCount;
        }
      });

      // Display per-flow details
      console.log(`   ➡️  Total Violations: ${result.totalViolations}`);
      console.log('   Breakdown:', flowTotals);
    }

    // Display grand total summary
    console.log('\n🚨 Grand Total Violations across all pages:');
    const table = new Table({
      head: ['Impact', 'Count'],
      colWidths: [15, 10]
    });
    Object.keys(grandTotal).forEach(impact => {
      table.push([impact, grandTotal[impact]]);
    });
    table.push(['Total', totalAcrossAll]);
    console.log(table.toString());

    console.log('\n🎯 All flows executed successfully.');
  } catch (error) {
    console.error('❌ Execution failed:', error.message);
  }
}

run();