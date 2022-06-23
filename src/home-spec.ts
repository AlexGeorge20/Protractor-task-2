import { browser, by, element } from "protractor";

describe ('Protractor baby steps',function(){
   
    beforeEach(function(){
        browser.get("http://juliemr.github.io/protractor-demo/");

    })
    it('Addition',function(){
        
        // browser.get("http://juliemr.github.io/protractor-demo/");

           element(by.css(".input-small:nth-child(1)")).sendKeys("4");
           element(by.tagName('option:nth-child(1)')).click();
           element(by.css(".input-small:nth-child(3)")).sendKeys("6")
            element(by.css('#gobutton')).click()
        element(by.tagName('h2')).getText().then((text)=>{
            console.log("Result",text);
            expect(text).toBe('10')
        })
            browser.sleep(1000);
        
    })
    it('Subtraction',function(){
        // browser.get("http://juliemr.github.io/protractor-demo/");
        element(by.css(".input-small:nth-child(1)")).sendKeys("4");
        element(by.tagName('option:nth-child(5)')).click();
        element(by.css(".input-small:nth-child(3)")).sendKeys("6")
         element(by.css('#gobutton')).click()
     element(by.tagName('h2')).getText().then((text)=>{
         console.log("Result",text);
         expect(text).toBe('-2')
     })
         browser.sleep(2000);
    })
})