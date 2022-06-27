import { browser, by, element, protractor } from "protractor";
import { text } from "stream/consumers";

describe ('Protractor baby steps',function(){
   
    beforeEach(function(){
        browser.get("http://www.protractortest.org/testapp/ng1/#/form");

    })

 // //BINDINGS--------------------------------------------------------
 it('Bindings',async function(){
     let d=element(by.css(' div:nth-child(2)'))
    element.all(by.className('ng-binding')).first().getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('Hiya')
     })
     element(by.css("span[data-ng-bind='username']")).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('Anon')
     })
     element(by.css("span[data-ng-bind-template='(ANNIE)']")).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('(ANNIE)')
     })

 })

//     // // TEXT---------------------------------------------------------------------------------
    it('Text',async function(){
        
      let a= await element(by.model("username")).isPresent();
      console.log("ELEMENT PRESENT",a);
        expect(a).toBe(true)
        let b=await element(by.model("username")).isDisplayed();
        console.log("DISPLAYED",b);
        expect(b).toBe(true)    

              element(by.model("username")).getAttribute('value').then((text)=>{
               console.log("TEXT",text);
               expect(text).toBe("Anon")
           })
           element(by.model("nickname")).getAttribute('value').then((text)=>{
            console.log("TEXT",text);
            expect(text).toBe("annie")
        })
      browser.sleep(1000);
    })

// // // TEXTAREA-------------------------------------------------------------------------
    it('Textarea',async function(){
        let a= await element(by.model("username")).isPresent();
        console.log("ELEMENT PRESENT",a);
         expect(a).toBe(true)
        let b=await element(by.model("username")).isDisplayed();
        console.log("DISPLAYED",b);
        expect(b).toBe(true)    
       
        element(by.model('aboutbox')).getAttribute('value').then((text)=>{
            console.log("TEXTAREA",text);
            
        })
    })

// // // MULTIPLE RADIO BTN -------------------------------------------------------------------
 it('Multiple radio btn',async function(){
    let c= element(by.css("div:nth-child(5)"))

        let a= await c.isPresent();
        console.log("ELEMENT PRESENT",a);
         expect(a).toBe(true)
        let b=await c.isDisplayed();
        console.log("DISPLAYED",b);
        expect(b).toBe(true)    
        //red      
      c.element(by.css("input[value='red']")).click()
   
 c.element(by.css("input[value='red']")).getAttribute('value').then((t)=>{
    console.log("TEXT",t);
    c.element(by.tagName("div")).getAttribute('style').then((color)=>{
        console.log("COLOR",color);
        expect(color).toBe('color: red;')
            })
 })
//blue
 c.element(by.css("input[value='blue']")).click()
 c.element(by.css("input[value='blue']")).getAttribute('value').then((t)=>{
    console.log("TEXT",t);
    c.element(by.tagName("div")).getAttribute('style').then((color)=>{
        console.log("COLOR",color);
        expect(color).toBe('color: blue;')
            })
 })
//green
c.element(by.css("input[value='green']")).click()
c.element(by.css("input[value='green']")).getAttribute('value').then((t)=>{
   console.log("TEXT",t);
   c.element(by.tagName("div")).getAttribute('style').then((color)=>{
       console.log("COLOR",color);
       expect(color).toBe('color: green;')
           })
})

})

// // //SELECT-----------------------------------------------------------------------
it('Multiple radio btn', function(){
    let fr=element(by.css('div:nth-child(6)'))
    let a= element(by.model('fruit'))
    a.click()
    a.element(by.css('option:nth-child(1)')).click()
    fr.element(by.tagName('span')).getAttribute('textContent').then((t)=>{
    console.log("FRUIT",t);
    expect(t).toBe('Fruit: ')
    })
    a.element(by.css('option:nth-child(2)')).click()
        fr.element(by.tagName('span')).getAttribute('textContent').then((t)=>{
        console.log("FRUIT",t);
        expect(t).toBe('Fruit: pear')
    })
    a.element(by.css('option:nth-child(3)')).click()
    fr.element(by.tagName('span')).getAttribute('textContent').then((t)=>{
    console.log("FRUIT",t);
    expect(t).toBe('Fruit: peach')
    })
    a.element(by.css('option:nth-child(4)')).click()
    fr.element(by.tagName('span')).getAttribute('textContent').then((t)=>{
    console.log("FRUIT",t);
    expect(t).toBe('Fruit: banana')
browser.sleep(3000);
    })
})

// // // ALERT---------------------------------------------------
    it('Alert',async function(){
        let a= await element(by.id("alertbutton")).isPresent();
      console.log("ELEMENT PRESENT",a);
        expect(a).toBe(true)
        let b=await element(by.id("alertbutton")).isDisplayed();
        console.log("DISPLAYED",b);
        expect(b).toBe(true)  
        
        element(by.id('alertbutton')).click()
       let text=await browser.switchTo().alert().getText()
       console.log("ALERT TEXT",text);
      expect(text).toBe('Hello')
      browser.switchTo().alert().accept()
        browser.sleep(2000);
    })

//  // // BUTTONS--------------------------------------------------------------

 it('Buttons',async function(){
        let a= await element(by.id("exacttext")).isPresent();
        console.log("ELEMENT PRESENT",a);
        expect(a).toBe(true)
        let b=await element(by.id("exacttext")).isDisplayed();
        console.log("DISPLAYED",b);
        expect(b).toBe(true) 
    
        element(by.id('exacttext')).getText().then((text)=>{
        console.log("BTN Text",text);
        expect(text).toBe('Exact text')
        })
        element(by.id('otherbutton')).getText().then((text)=>{
        console.log("BTN Text",text);
        expect(text).toBe('Partial button text')
        })
        element(by.id('trapbutton')).getText().then((text)=>{
        console.log("BTN Text",text);
        expect(text).toBe('No match')
        })
        element(by.id('inputbutton')).getAttribute('value').then((text)=>{
        console.log("BTN Text",text);
        expect(text).toBe('Hello text')
        })
        element(by.id('submitbutton')).getAttribute('value').then((text)=>{
        console.log("BTN Text",text);
        expect(text).toBe('Exact text')
        })
 let x= await element(by.id("hiddenbutton")).isPresent();
console.log("ELEMENT PRESENT",x);
expect(x).toBe(true)
let y=await element(by.id("hiddenbutton")).isDisplayed();
console.log("DISPLAYED",y);
expect(y).toBe(false) 

 })

// // // INNERTEXT---------------------------------------------------------

it('Innertext',async function(){
    element(by.id('bigdog')).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('big dog')
    })
    element(by.id('smalldog')).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('small dog')
    })
    element(by.id('otherdog')).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('other dog')
    })
    element(by.id('bigcat')).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('big cat')
    })
    element(by.id('smallcat')).getText().then((text)=>{
        console.log("TEXT",text);
        expect(text).toBe('small cat')
    })
})

// // //INPUTS----------------------------------------------------------------
it('Inputs',async function(){
    element.all(by.className('input')).first().getAttribute('value').then((v)=>{
        console.log("value",v);
            })
    element.all(by.className('input')).last().getAttribute('value').then((v)=>{
        console.log("value",v);
            })
})

// //  //TRANSFORMED TEXT---------------------------------------------------
it('Transformed text',async function(){
    element(by.id('textuppercase')).getText().then((text)=>{
    console.log(text);
    expect(text).toBe('UPPERCASE')
        })
    element(by.id('textlowercase')).getText().then((text)=>{
    console.log(text);
    expect(text).toBe('lowercase')
    })
    element(by.id('textcapitalize')).getText().then((text)=>{
    console.log(text);
    expect(text).toBe('Capitalize')
    })
})

// // CLICKME TOGGLE
it('Clickme',async function(){
    browser.get("http://www.protractortest.org/testapp/ng1/#/animation");
       
        let a=await element(by.id('toggledNode')).isPresent()
        let b=await element(by.id('toggledNode')).isDisplayed()
        console.log("PRESENT",a);
        console.log("DISPLAYED",b);
        element(by.id('toggledNode')).getText().then((text)=>{
            console.log("TEXT",text);
            expect(text).toBe('I exist!')
       })
    
       element(by.id('checkbox')).click()
       let c=await element(by.id('toggledNode')).isPresent()
    //    let d=await element(by.id('toggledNode')).isDisplayed()
       console.log("PRESENT",c);
    expect(c).toBe(false)
    
        browser.sleep(2000);
})

// // CHECKBOXES
it('Checkboxes',async function(){
    element(by.model('show')).click()
   let a=await  element(by.id('shower')).isPresent()
   let b=await  element(by.id('shower')).isDisplayed()
   console.log("PRESENT",a);
   console.log("DISPLAYED",b);
   expect(b).toBe(false)

   element(by.model('disabled')).click()
   let c=await element(by.id('disabledButton')).isPresent()
   let d=await element(by.id('disabledButton')).isDisplayed()
   console.log("DUMMY PRESENT",c);
   console.log("DUMMY DISPLAYED",d);
   let e=await element(by.id('disabledButton')).getAttribute('disabled')
   console.log("DISABLED",e);
   expect(e).toBe('true')
   
   element(by.model('check.w')).click()
   element(by.id('letterlist')).getText().then((w)=>{
       console.log("Txt",w);
       expect(w).toBe('w')
       })
    element(by.model('check.x')).click()
    element(by.id('letterlist')).getText().then((x)=>{
        console.log("Txt",x);
        expect(x).toBe('wx')
        })
    element(by.model('check.w')).click()
    element(by.id('letterlist')).getText().then((falsex)=>{
        console.log("Txt",falsex);
        expect(falsex).toBe('falsex')
        })
    element(by.model('check.x')).click()
    element(by.id('letterlist')).getText().then((falsefalse)=>{
        console.log("Txt",falsefalse);
        expect(falsefalse).toBe('falsefalse')
        })

    browser.sleep(2000)


})

})

     
    


