const { chromium } = require('playwright');

const BUTTON_LABELS = [
  '?명뀛 ?뺣낫',
  '媛앹떎 ?뺣낫 (?듯빀)',
  '?쒖꽕 ?뺣낫',
  '?⑦궎吏 (?듯빀)',
  '異붽??붽툑 (?듯빀)',
  '痍⑥냼洹쒖젙',
  '?덉빟?덈궡',
  '怨듭??ы빆',
  '?쒗뵆由?紐⑸줉'
];

(async () => {
  console.log('?? 踰꾪듉 ?대┃ 諛?紐⑤떖 ?リ린 ?뚯뒪???쒖옉...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const allLogs = [];
  let errorFound = false;

  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
    };
    allLogs.push(log);
    if (log.type === 'error') {
        console.error(`?슚 ?ㅼ떆媛??먮윭 諛쒓껄: ${log.text}`);
        errorFound = true;
    }
  });

  try {
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺.');
    await page.waitForTimeout(2000);

    for (const label of BUTTON_LABELS) {
      const buttonSelector = `div:has-text("${label}")`;
      console.log(`\n--- ?뼮截? '${label}' 踰꾪듉 ?대┃ ---`);
      
      try {
        const button = page.locator(buttonSelector).first();
        if (await button.count() > 0) {
            await button.click({ timeout: 5000 });
            console.log(`??'${label}' 踰꾪듉 ?대┃ ?깃났. 紐⑤떖???대┰?덈떎.`);
            await page.waitForTimeout(1500);

            // 紐⑤떖 ?リ린 ?쒕룄
            const closeButton = page.locator('button:has-text("?リ린"), button:has-text("痍⑥냼"), button.btn-close, [aria-label="Close"]').first();
            if (await closeButton.count() > 0) {
              await closeButton.click({ timeout: 5000 });
              console.log('??紐⑤떖 ?リ린 踰꾪듉 ?대┃ ?깃났.');
            } else {
              console.warn('?좑툘 紐⑤떖 ?リ린 踰꾪듉??李얠쓣 ???놁쓬. ESC ?ㅻ? ?꾨쫭?덈떎.');
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(1000);

        } else {
            console.warn(`?좑툘 '${label}' 踰꾪듉??李얠쓣 ???놁쓬.`);
        }
      } catch (e) {
        console.error(`??'${label}' 踰꾪듉 ?뚯뒪??以??ㅻ쪟 諛쒖깮: ${e.message}`);
        errorFound = true; // ?대┃ ?먯껜???ㅻ쪟???먮윭濡?媛꾩＜
      }
    }

  } catch (e) {
    console.error(`???섏씠吏 ?먯깋 以??ㅻ쪟 諛쒖깮: ${e.message}`);
    errorFound = true;
  } finally {
    console.log('\n\n--- ?뱤 理쒖쥌 肄섏넄 濡쒓렇 ?붿빟 ---');
    if (allLogs.length === 0) {
      console.log('罹≪쿂??肄섏넄 濡쒓렇媛 ?놁뒿?덈떎.');
    } else {
      const errorLogs = allLogs.filter(log => log.type === 'error');
      if (errorLogs.length > 0) {
        console.log(`珥?${allLogs.length}媛쒖쓽 濡쒓렇 以?${errorLogs.length}媛쒖쓽 ?먮윭 諛쒓껄:`);
        errorLogs.forEach((log, i) => {
          console.log(`${i + 1}. [${log.type.toUpperCase()}] ${log.text}`);
        });
      } else {
        console.log(`???먮윭 ?놁쓬. 珥?${allLogs.length}媛쒖쓽 濡쒓렇媛 罹≪쿂?섏뿀?듬땲??`);
      }
    }
    console.log('---------------------------------');

    if (errorFound) {
        console.log('\n?뵶 ?뚯뒪??以??먮윭媛 諛쒓껄?섏뿀?듬땲??');
    } else {
        console.log('\n?윟 ?뚯뒪?멸? ?먮윭 ?놁씠 ?꾨즺?섏뿀?듬땲??');
    }

    await browser.close();
    console.log('?? ?뚯뒪??醫낅즺.');
  }
})(); 
