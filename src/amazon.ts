import { browser, element, by, protractor } from "protractor";

describe("Amazon", function () {
  it("Add to cart", async () => {
    await browser.waitForAngularEnabled(false);

    await browser.get("https://www.amazon.in");
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    await element(by.id("glow-ingress-line2")).click();

    var EC = protractor.ExpectedConditions;

    // browser.sleep(3000)
    await browser.wait(
      EC.visibilityOf(element(by.id("GLUXZipUpdateInput"))),
      10000
    );

    let a = await element(by.id("GLUXZipUpdateInput")).isPresent();
    let b = await element(by.id("GLUXZipUpdateInput")).isDisplayed();
    // console.log("DISPLAYED",b);
    expect(b).toBe(true);
    await element(by.id("GLUXZipUpdateInput")).sendKeys("695004");
    await element(by.id("GLUXZipUpdate"))
      .element(by.css("input[aria-labelledby='GLUXZipUpdate-announce']"))
      .click();

    await browser.wait(
      EC.visibilityOf(
        element(by.id("glow-ingress-block")).element(
          by.id("glow-ingress-line2")
        )
      ),
      10000
    );
    await browser.sleep(2000)
    let code = await element(by.id("glow-ingress-block"))
      .element(by.id("glow-ingress-line2"))
      .getText();

    console.log("CODE", code);
    browser.sleep(3000);

    expect(code).toMatch("Thiruvana... 695004");

    await element(by.id("nav-link-accountList")).click();
    await browser.wait(EC.visibilityOf(element(by.id("ap_email"))), 10000);
    let c = await element(by.id("ap_email")).isPresent();
    let d = await element(by.id("ap_email")).isDisplayed();
    expect(d).toBe(true);
    await element(by.id("ap_email")).sendKeys("8848582203");
    // //             //  browser.sleep(3000)
    await element(by.css("input[id='continue']")).click();
    // //   browser.sleep(5000)
    await browser.wait(EC.visibilityOf(element(by.id("ap_password"))), 10000);
    let e = await element(by.id("ap_password")).isPresent();
    let f = await element(by.id("ap_password")).isDisplayed();
    await expect(f).toBe(true);
    await element(by.id("ap_password")).sendKeys("qwerty");

    await element(by.id("signInSubmit")).click();
    await browser.sleep(5000);

    await browser.wait(
      EC.visibilityOf(element(by.id("twotabsearchtextbox"))),
      10000
    );

    await element(by.id("twotabsearchtextbox")).sendKeys("apple ipad");
    await element(by.id("nav-search-submit-button")).click();
    browser.sleep(3000);
    let count = await element(by.css("[class='s-pagination-strip']")).element(by.css('a:nth-child(6)')).getText();
    console.log("COUNT", count[0]);
    let counter: number = +count;
    console.log("TotalCOUNTER", counter,typeof counter);

      let  totalPageCount = counter;
       let  pageToGo = 4
      let j = (totalPageCount > pageToGo) ? pageToGo : totalPageCount

      for (let i = 0; i < j; i++) {
        console.log('inside loop');
            await browser.wait(EC.visibilityOf( element(by.className("s-pagination-item s-pagination-next s-pagination-button s-pagination-separator"))),10000);
            await element(by.className("s-pagination-item s-pagination-next s-pagination-button s-pagination-separator")).click();
          }
   

    await browser.wait(EC.visibilityOf(
        element(by.css("div[cel_widget_id='MAIN-SEARCH_RESULTS-2']")).element(by.css("a[class='a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal']"))),10000);

    await  element(by.css("div[cel_widget_id='MAIN-SEARCH_RESULTS-2']")).element(by.css("a[class='a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal']")).click();
browser.sleep(2000)

    var winHandles = browser.getAllWindowHandles();
    winHandles.then(function (handles) {
      var parentWindow = handles[0];
      var popUpWindow = handles[1];
      browser.switchTo().window(popUpWindow);
      // //  browser.switchTo().window(parentWindow);
    });
 
    await browser.wait(
      EC.visibilityOf(element(by.id("add-to-cart-button"))),
      10000
    );
      

  var elm = element(by.id("add-to-cart-button"));
  elm.getLocation()
      .then(function(location) {
          return browser.executeScript('window.scrollTo(' + location.x + ', ' + location.y + ');');
      })

    await element(by.id("add-to-cart-button")).click();

    browser.driver.switchTo().activeElement();

    await browser.wait(
      EC.visibilityOf(element(by.css("div[class='a-section a-spacing-none a-padding-base attach-primary-atc-confirm-box']")).element(by.id("attach-close_sideSheet-link"))),
      10000);
    await element(by.css("div[class='a-section a-spacing-none a-padding-base attach-primary-atc-confirm-box']")).element(by.id("attach-close_sideSheet-link")).click();
    await browser.sleep(3000);

    await browser.wait(
      EC.visibilityOf(
        element(by.id("nav-cart-count-container")).element(
          by.id("nav-cart-count")
        )
      ),
      10000
    );
    let itemno = await element(by.id("nav-cart-count-container"))
      .element(by.id("nav-cart-count"))
      .getText();
    console.log("Items IN CARt", itemno);
    expect(itemno).toBeGreaterThan(0)

  });
});
