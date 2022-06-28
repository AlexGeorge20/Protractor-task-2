import { browser, element,by, protractor } from "protractor";

describe ('Amazon',function(){
    it('Bindings',async function(){
        browser.waitForAngularEnabled(false)
        await browser.get("https://www.amazon.in");
        await element(by.id('glow-ingress-line2')).click()
        var EC = protractor.ExpectedConditions;

        // browser.sleep(3000)
        browser.wait(EC.visibilityOf(element(by.id('GLUXZipUpdateInput'))),10000)

             let a=await element(by.id('GLUXZipUpdateInput')).isPresent()
             let b=await element(by.id('GLUXZipUpdateInput')).isDisplayed()
            // console.log("DISPLAYED",b);
            expect(b).toBe(true)
             await element(by.id('GLUXZipUpdateInput')).sendKeys("695004")
             await element(by.css("input[aria-labelledby='GLUXZipUpdate-announce']")).click()

         
             browser.sleep(3000)
            await element(by.id('nav-link-accountList')).click()
            browser.wait(EC.visibilityOf( element(by.id('ap_email'))),10000)
            // let c=await element(by.id('ap_email')).isPresent()
            // let d=await element(by.id('ap_email')).isDisplayed()
            // expect(d).toBe(true)
             element(by.id('ap_email')).sendKeys('8848582203')
//             //  browser.sleep(3000)
             element(by.id('continue')).click()
            //   browser.sleep(5000)
            browser.wait(EC.visibilityOf( element(by.id('ap_password'))),10000)
            let e=await element(by.id('ap_password')).isPresent()
            let f=await element(by.id('ap_password')).isDisplayed()
            expect(f).toBe(true)
             element(by.id('ap_password')).sendKeys("qwerty")
// //             browser.sleep(3000)
             element(by.id('signInSubmit')).click()
                browser.sleep(5000)

                browser.wait(EC.visibilityOf( element(by.id('twotabsearchtextbox'))),10000)

            element(by.id('twotabsearchtextbox')).sendKeys("dell")
            element(by.id('nav-search-submit-button')).click()
            browser.sleep(3000)

element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator')).click()
// //browser.sleep(2000)
 browser.wait(EC.visibilityOf(element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator'))),10000)
element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator')).click()
// // browser.sleep(2000)
browser.wait(EC.visibilityOf(element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator'))),10000)

element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator')).click()
// // browser.sleep(3000)
browser.wait(EC.visibilityOf(element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator'))),10000)

element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator')).click()
// browser.sleep(5000)
browser.wait(EC.visibilityOf(element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator'))),10000)

element(by.className('s-pagination-item s-pagination-next s-pagination-button s-pagination-separator')).click()

browser.wait(EC.visibilityOf( element(by.css("div[cel_widget_id='MAIN-SEARCH_RESULTS-2']"))),10000)

    element(by.css("div[cel_widget_id='MAIN-SEARCH_RESULTS-2']")).click()

browser.sleep(3000)

    })




})