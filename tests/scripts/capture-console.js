const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log('[Capture Script] Launching browser...');
    browser = await puppeteer.launch({
      headless: true, // Run without opening a visible window
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for CI/headless environments
    });
    const page = await browser.newPage();

    let circularErrorFound = null;
    let fullErrorObject = null; // To capture more details if possible

    // Listen for console messages
    page.on('console', async (msg) => {
      const msgType = msg.type();
      const text = msg.text();
      // Attempt to get detailed args for errors
      if (msgType === 'error') {
        console.error(`[Browser Console Error]: ${text}`);
        if (text.includes('Converting circular structure to JSON')) {
          circularErrorFound = text;
          console.error('[Capture Script] Found Circular JSON Error hint in console message.');
          // Sometimes the full error object is logged as an argument
          try {
            const args = await Promise.all(msg.args().map(arg => arg.jsonValue()));
            const errorArg = args.find(arg => arg instanceof Error || (typeof arg === 'object' && arg !== null && arg.message && arg.stack));
            if (errorArg) {
                fullErrorObject = {
                    message: errorArg.message,
                    stack: errorArg.stack,
                    name: errorArg.name,
                    ...errorArg // Include other properties if any
                };
                 console.error('[Capture Script] Captured potential error object details from console args.');
            }
          } catch(e) {
            console.warn('[Capture Script] Could not fully parse console error args:', e);
          }
        }
      }
    });

    // Listen for uncaught exceptions on the page
    page.on('pageerror', error => {
      console.error('[Capture Script] Uncaught page error:', error.message);
      if (error.message.includes('Converting circular structure to JSON') && !fullErrorObject) {
         circularErrorFound = error.message;
         fullErrorObject = {
            message: error.message,
            stack: error.stack,
            name: error.name
         };
         console.error('[Capture Script] Found Circular JSON Error via pageerror.');
      }
    });

    console.log(`[Capture Script] Navigating to http://localhost:${process.env.PORT || 3900}...`);
    try {
        await page.goto(`http://localhost:${process.env.PORT || 3900}`, { waitUntil: 'domcontentloaded', timeout: 20000 }); // Use domcontentloaded, maybe networkidle is too long/fails
        console.log('[Capture Script] Navigation potentially complete (domcontentloaded). Waiting for errors...');
        // Wait a few seconds to ensure async errors are caught or page settles
        await new Promise(resolve => setTimeout(resolve, 7000)); // Increased wait time
        console.log('[Capture Script] Finished waiting.');
    } catch (navError) {
        console.error(`[Capture Script] Navigation failed: ${navError.message}`);
        // If navigation fails, we probably won't get the error, but log this failure.
    }


    if (fullErrorObject) {
       console.log("-------------------------------------------");
       console.log("[Capture Script] DETAILED CIRCULAR ERROR (from pageerror or console args):");
       console.log("Message:", fullErrorObject.message);
       console.log("Stack Trace:", fullErrorObject.stack);
       console.log("Name:", fullErrorObject.name);
       // Log other properties if captured
       Object.keys(fullErrorObject).forEach(key => {
           if (!['message', 'stack', 'name'].includes(key)) {
               console.log(`${key}:`, fullErrorObject[key]);
           }
       });
       console.log("-------------------------------------------");
    } else if (circularErrorFound) {
        console.log("-------------------------------------------");
        console.log("[Capture Script] CIRCULAR ERROR HINT (details might be incomplete):");
        console.log(circularErrorFound);
        console.log("-------------------------------------------");
    } else {
       console.log("[Capture Script] No 'Circular structure to JSON' error detected in console during execution.");
    }

  } catch (error) {
    console.error('[Capture Script] Error during script execution:', error);
  } finally {
    if (browser) {
      console.log('[Capture Script] Closing browser...');
      await browser.close();
    }
  }
})(); 
