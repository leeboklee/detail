// @ts-check
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const LOG_DIR = path.join(__dirname, '..', 'logs'); // Log directory relative to this script's parent
const RESULTS_DIR_BASE = path.join(__dirname, '..', 'test-results'); // Base results directory
const SERVER_PORT = 4200;
const SERVER_START_TIMEOUT_MS = 15000; // Increased timeout for server start
const LOG_RETENTION_MINUTES = 30; // How long to keep recent logs for the summary

// --- Helper Functions ---

/**
 * Logs a message to the console and appends to the main log file.
 * @param {string} message - The message to log.
 * @param {string} logFilePath - Path to the main log file.
 */
const log = (message, logFilePath) => {
  const logMessage = `[${new Date().toISOString()}] ${message}`;
  console.log(logMessage);
  try {
    fs.appendFileSync(logFilePath, logMessage + '\\n');
  } catch (error) {
    console.error(`Failed to write to log file ${logFilePath}: ${error.message}`);
  }
};

/**
 * Executes a shell command synchronously and logs its output.
 * Throws an error if the command fails.
 * @param {string} command - The command to execute.
 * @param {string} description - Description of the action for logging.
 * @param {Function} logger - The logging function.
 */
const execSyncAndLog = (command, description, logger) => {
  logger(`Executing: ${description} (${command})`);
  try {
    execSync(command, { stdio: 'inherit' }); // Show command output directly
    logger(`Successfully executed: ${description}`);
    return true;
  } catch (error) {
    logger(`ERROR executing ${description}: ${error.message}`);
    // console.error(error); // Optionally log the full error object
    return false;
  }
};

/**
 * Checks if the server is running on the specified port.
 * @param {number} port - The port number to check.
 * @param {Function} logger - The logging function.
 * @returns {boolean} True if the server is running, false otherwise.
 */
const isServerRunning = (port, logger) => {
  logger(`Checking server status on port ${port}...`);
  try {
    // Use platform-specific command for better reliability
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr ":${port}" | findstr "LISTENING"`
      : `lsof -i :${port} | grep LISTEN`;
    execSync(command);
    logger(`Server is running on port ${port}.`);
    return true;
  } catch (e) {
    logger(`Server is not running on port ${port}.`);
    return false;
  }
};

/**
 * Attempts to start the development server in the background.
 * @param {Function} logger - The logging function.
 * @returns {Promise<boolean>} True if the server process was spawned, false otherwise.
 */
const startServerInBackground = async (logger) => {
  logger('Attempting to start the server in the background...');
  try {
    const serverProcess = spawn('npm', ['run', 's'], { // Assuming 'npm run s' starts the server
      detached: true,
      stdio: 'ignore', // Suppress server output in this script's console
      shell: true,
    });
    serverProcess.unref(); // Allow this script to exit even if the server is running
    logger(`Server process spawned. Waiting ${SERVER_START_TIMEOUT_MS}ms for initialization...`);
    await new Promise(resolve => setTimeout(resolve, SERVER_START_TIMEOUT_MS));
    // We assume the server started successfully if spawn didn't throw.
    // A more robust check would involve polling http://localhost:SERVER_PORT
    logger('Server likely started (or is starting). Proceeding with tests.');
    return true;
  } catch (error) {
    logger(`ERROR starting server process: ${error.message}`);
    return false;
  }
};

/**
 * Generates a summary report from the collected log files.
 * @param {string} resultsDir - Directory to save the report.
 * @param {Function} logger - The logging function.
 */
const generateSummaryReport = (resultsDir, logger) => {
  logger('Generating summary report...');
  let report = `# Test Execution Summary\\n\\nExecution Time: ${new Date().toISOString()}\\n\\n`;
  const recentLogFiles = {};

  try {
    const allLogFiles = fs.readdirSync(LOG_DIR);
    const cutOffTime = Date.now() - LOG_RETENTION_MINUTES * 60 * 1000;

    allLogFiles.forEach(file => {
      const filePath = path.join(LOG_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() >= cutOffTime) {
          const typeMatch = file.match(/^(test|console|network|failure)-/);
          const type = typeMatch ? typeMatch[1] : 'other';
          if (!recentLogFiles[type]) recentLogFiles[type] = [];
          recentLogFiles[type].push(file);
        }
      } catch (statError) {
        logger(`Warning: Could not stat file ${filePath}: ${statError.message}`);
      }
    });

    // Add Failure Summary
    if (recentLogFiles['failure'] && recentLogFiles['failure'].length > 0) {
      report += '## Failures Detected\\n\\n';
      recentLogFiles['failure'].sort().forEach(file => { // Sort for consistency
        const failureFilePath = path.join(LOG_DIR, file);
        try {
          const failureContent = fs.readFileSync(failureFilePath, 'utf8');
          const failureData = JSON.parse(failureContent); // Assuming failure details are JSON
          report += `- **${failureData.title || file}**\\n`;
          report += `  - Status: ${failureData.status}\\n`;
          if (failureData.error?.message) {
            report += '  - Error: ' + failureData.error.message.split('\\n')[0] + '\\n';
          }
          report += `  - Details: ${file}\\n`;
        } catch (parseError) {
          report += `- ${file} (Could not parse details: ${parseError.message})\\n`;
        }
      });
       report += '\\n';
    } else {
         report += '## No test failures recorded in recent logs.\\n\\n';
    }
     
    // Add Error Log Summary (Console/Page Errors)
    const errorFiles = (recentLogFiles['console'] || [])
        .concat(recentLogFiles['test'] || []) // Include general test logs too
        .filter(file => file.includes('error'));
        
    if (errorFiles.length > 0) {
        report += '## Errors Logged (Console/Page)\\n\\n';
        const latestErrorFile = errorFiles
            .map(file => ({ file, mtime: fs.statSync(path.join(LOG_DIR, file)).mtime }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0]?.file;

        if (latestErrorFile) {
            const errorFilePath = path.join(LOG_DIR, latestErrorFile);
            try {
                const errorContent = fs.readFileSync(errorFilePath, 'utf8');
                let errors = [];
                try {
                    errors = JSON.parse(errorContent); // Expecting JSON array [{ type, text, timestamp }, ...]
                    const errorSummary = errors
                        .filter(e => e.type === 'error' || e.type === 'pageerror')
                        .slice(0, 5) // Limit summary
                        .map((e, i) => `${i + 1}. [${e.type}] ${e.text.split('\\n')[0]}`)
                        .join('\\n');
                    report += `Summary from ${latestErrorFile}:\\n${errorSummary}\\n`;
                    if (errors.length > 5) report += `...and ${errors.length - 5} more errors.\\n`;

                } catch (e) {
                    report += `Could not parse error file ${latestErrorFile} as JSON. Content preview:\\n`;
                    report += errorContent.substring(0, 500) + (errorContent.length > 500 ? '\\n...' : '');
                }
            } catch (readError) {
                report += `Error reading error file ${latestErrorFile}: ${readError.message}\\n`;
            }
        } else {
            report += 'No specific error log files found recently.\\n';
        }
        report += '\\n';
    }


    // List all recent log files found
    report += '## Recent Log Files\\n\\n';
    Object.keys(recentLogFiles).sort().forEach(type => {
      if (recentLogFiles[type].length > 0) {
        report += `### ${type} (${recentLogFiles[type].length})\\n`;
        recentLogFiles[type].sort().forEach(file => {
          report += `- ${file}\\n`;
        });
         report += '\\n';
      }
    });

  } catch (reportError) {
    logger(`ERROR generating summary report: ${reportError.message}`);
    report += `\\n\\n**ERROR generating report:** ${reportError.message}`;
  }

  const reportFile = path.join(resultsDir, 'summary-report.md');
  try {
    fs.writeFileSync(reportFile, report);
    logger(`Summary report saved: ${reportFile}`);
    console.log('\\n===== Test Execution Summary =====\\n');
    console.log(report); // Also print summary to console
  } catch (writeError) {
    logger(`ERROR saving summary report: ${writeError.message}`);
  }
};


// --- Main Execution ---
async function runAllTests() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const currentResultsDir = path.join(RESULTS_DIR_BASE, `run-${timestamp}`);
  const mainLogFile = path.join(LOG_DIR, `test-run-all-${timestamp}.log`);
  const logger = (msg) => log(msg, mainLogFile);

  logger('Starting automated test execution script...');

  // Ensure required directories exist
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    if (!fs.existsSync(RESULTS_DIR_BASE)) fs.mkdirSync(RESULTS_DIR_BASE, { recursive: true });
    if (!fs.existsSync(currentResultsDir)) fs.mkdirSync(currentResultsDir, { recursive: true });
    logger(`Using results directory: ${currentResultsDir}`);
  } catch (dirError) {
    console.error(`FATAL: Could not create log/results directories: ${dirError.message}`);
    process.exit(1);
  }

  let playwrightSuccess = false;
  // let vitestSuccess = false; // Uncomment when Vitest is fixed

  // 1. Check Server and Start if Necessary
  if (!isServerRunning(SERVER_PORT, logger)) {
    const serverStarted = await startServerInBackground(logger);
    if (!serverStarted) {
      logger('FATAL: Failed to start the server. Aborting tests.');
      process.exit(1);
    }
  } else {
       logger('Server already running. Proceeding with tests.');
  }

  // 2. Run Vitest Tests (Commented out until fixed)
  /*
  logger('--- Starting Vitest Tests ---');
  // TODO: Resolve Vitest issues before enabling this
  // vitestSuccess = execSyncAndLog('npm run test:unit', 'Run Vitest unit tests', logger); // Or 'npx vitest run' if preferred
  logger('--- Vitest Tests (Skipped) ---');
  vitestSuccess = true; // Assume success for now to allow Playwright to run
  */

  // 3. Run Playwright Tests
  // if (vitestSuccess) { // Only run Playwright if Vitest (or skipped Vitest) passed
    logger('--- Starting Playwright E2E Tests ---');
    // Ensure the JSON reporter is configured in playwright.config.ts
    playwrightSuccess = execSyncAndLog('npm run test:playwright', 'Run Playwright E2E tests', logger);
    logger(`--- Playwright E2E Tests Finished (Success: ${playwrightSuccess}) ---`);
  // } else {
  //   logger('Skipping Playwright tests because Vitest failed.');
  // }

  // 4. Generate Summary Report
  generateSummaryReport(currentResultsDir, logger);

  // 5. Final Exit
  logger('Test execution script finished.');
  // Exit with non-zero code if any test suite failed
  // process.exit(vitestSuccess && playwrightSuccess ? 0 : 1);
  process.exit(playwrightSuccess ? 0 : 1); // Exit based on Playwright result for now


}

runAllTests().catch(error => {
  console.error(`Unhandled error during test execution: ${error.message}`);
  console.error(error);
  process.exit(1);
});
