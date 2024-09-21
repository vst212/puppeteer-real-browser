const test = require('node:test');
const assert = require('node:assert');
const { connect } = require('../../lib/cjs/index.js');

const url = "https://stake.com";

const realBrowserOption = {
    args: ["--start-maximized"],
    turnstile: true,
    headless: false,
    // disableXvfb: true,
    customConfig: {},
    connectOption: {
        defaultViewport: null
    },
    plugins: []
}

test('Cloudflare Turnstile', async () => {
    const { page, browser } = await connect(realBrowserOption)
    await page.goto(url);
    await page.waitForSelector('[data-action="demo_action"]')
    let token = null
    let verify = null
    let startDate = Date.now()
    while (!verify && (Date.now() - startDate) < 30000) {
        verify = await page.evaluate(() => { return document.querySelector('.link_row') ? true : null }).catch(() => null)
        await new Promise(r => setTimeout(r, 1000));
    }
    while (!token && (Date.now() - startDate) < 30000) {
        token = await page.evaluate(() => {
            try {
                let item = document.querySelector('[name="cf-turnstile-response"]').value
                return item && item.length > 20 ? item : null
            } catch (e) {
                return null
            }
        })
        await new Promise(r => setTimeout(r, 1000));
    }
    await browser.close()
    // if (token !== null) console.log('Cloudflare Turnstile Token: ' + token);
    assert.strictEqual(token !== null, true, "Cloudflare turnstile test failed!")
})
