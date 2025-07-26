Accessibility MCP Server – Reporting Architecture
This documentation explains the reporting flow, file structure, and key components of the Accessibility MCP Server.

1. Overview
The MCP Server is an LLM-driven accessibility testing framework built on Playwright and axe-core, generating detailed accessibility reports (JSON + HTML) per page or flow.
It supports multi-step flows, aggregates violations, and outputs summary statistics and reports.

2. Key Components
2.1. devRunner.js
Purpose: Entry point for local test execution.

Responsibilities:

Cleans and prepares the reports/ directory before each run.

Calls the LLM (callLLM) to generate flow steps.

Iterates through single or multi-step flows.

Calls callMCP() for each flow.

Prints total violations per page and an aggregated summary.

Key Feature:
Prints a grand total of violations across all flows, with breakdown per severity type.

2.2. flowResolver.js
Purpose: Manages browser sessions and executes flows using Playwright.

Responsibilities:

Maintains a shared browser context across multiple flows (for multi-step sequences).

Calls genericFlow.js to execute steps (click, fill, etc.) and trigger scan steps.

Collects results from axeRunner.js.

Closes browser only on the last flow.

2.3. genericFlow.js
Purpose: Executes user-defined steps (e.g., goto, fill, click, scan).

Responsibilities:

Handles scan action by calling axeRunner.js.

Returns violations and paths to JSON and HTML reports.

Logs step-level execution with clear debug output.

2.4. axeRunner.js
Purpose: Runs axe-core accessibility scans using Playwright.

Responsibilities:

Injects axe-core and runs analysis with selected profile (quick/full/strict).

Saves:

JSON Report: Detailed violation data (page-scan-<timestamp>.json).

HTML Report: Human-readable report (page-scan-<timestamp>.html).

Uses axe-html-reporter to generate HTML with only violations displayed.

2.5. fsUtils.js
Purpose: File system utilities.

Responsibilities:

ensureDir(path) – Creates a directory if missing.

clearDir(path) – Deletes all files inside the directory before a run.

2.6. reports/
Purpose: Stores all test execution results.

Contents:

JSON Reports – Raw data for each scanned page.

HTML Reports – Visual reports with violation details.

3. Execution Flow
Step-by-Step Execution
devRunner.js is invoked:

bash
Copy
Edit
node devRunner.js "Scan login page, then scan dashboard page"
Cleans reports/.

Calls callLLM() to convert the natural language prompt into structured flow JSON.

Iterates over the generated flows:

Each flow is sent to MCP server via callMCP().

flowResolver.js executes each flow.

genericFlow.js runs actions & scans.

axeRunner.js produces JSON + HTML reports.

After all flows:

Grand total of violations across all pages is displayed.

4. Sample Report Paths
JSON:
reports/page-scan-2025-07-26T08-30-15.json

HTML:
reports/page-scan-2025-07-26T08-30-15.html

5. Sample Output
Example CLI output after running:

yaml
Copy
Edit
🚀 Executing flow: Login Page Scan
   ➡️  Total Violations: 1
   📄  JSON Report: reports/page-scan-2025-07-26T08-30-15.json
   📄  HTML Report: reports/page-scan-2025-07-26T08-30-15.html

🚀 Executing flow: Dashboard Scan
   ➡️  Total Violations: 5
   📄  JSON Report: reports/page-scan-2025-07-26T08-31-10.json
   📄  HTML Report: reports/page-scan-2025-07-26T08-31-10.html

🚨 Grand Total Violations across all pages: 6