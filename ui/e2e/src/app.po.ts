import { browser, by, element } from 'protractor';
import * as remote from 'selenium-webdriver/remote';

export class AppPage {

  navigateTo() {
    //browser.driver.manage().window().setSize(1024, 768);
    browser.setFileDetector(new remote.FileDetector());
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('rrt-root h1')).getText();
  }

  getCurrentlySelectedButton() {
    return element(by.css('rrt-root mat-toolbar mat-button-toggle.mat-button-toggle-checked'));
  }

  getMenuDataButton(value) {
    return element(by.css(`mat-button-toggle[value=\'${value}\'] button`));
  }

  getToggleButtonLabelText(elementButton) {
    return elementButton.element(by.css('.mat-button-toggle-label-content')).getText();
  }

  getGroupDictionaryFileInput() {
    let fileElement = element(by.css('input[aria-label=\'dic file\']'));
    browser.executeScript(this.makeVisible, fileElement.getWebElement());
    this.waitForSpecificElementToBePresent(fileElement);
    return fileElement;
  }

  getDataFileInput() {
    let fileElement = element(by.css('input[aria-label=\'data file\']'));
    browser.executeScript(this.makeVisible, fileElement.getWebElement());
    this.waitForSpecificElementToBePresent(fileElement);
    return fileElement;
  }

  getGroupCanSurvFileInput() {
    let fileElement = element(by.css('input[aria-label=\'csv file\']'));
    browser.executeScript(this.makeVisible, fileElement.getWebElement());
    this.waitForSpecificElementToBePresent(fileElement);
    return fileElement;
  }

  getAdjustmentFactorInput() {
    return element(by.css('input[formcontrolname=\'adjustmentFactor\']'));
  }

  moveSlider(ticks) {
    let EC = protractor.ExpectedConditions;
    let sliderElement = element(by.css('.mat-slider'));
    this.waitForSpecificElementToBePresent(sliderElement);
    let key = ticks < 0 ? protractor.Key.ARROW_LEFT: protractor.Key.ARROW_RIGHT;

    for(let i=0; i<Math.abs(ticks); i++) {
      sliderElement.sendKeys(key);
    }

    return this;
  }

  getSubmitButton() {
    return element(by.css('button[type=submit]'));
  }

  getDropdownByNameAndValue(name,optionValue) {
    let EC = protractor.ExpectedConditions;
    let selectEl = element(by.css(`mat-select[formcontrolname='${name}']`));
    browser.executeScript('arguments[0].scrollIntoView()',selectEl.getWebElement());
    browser.wait(EC.presenceOf(selectEl),60*1000);
    selectEl.click();
    let optionEl = element.all(by.cssContainingText('.mat-option', optionValue)).last();
    browser.executeScript('arguments[0].scrollIntoView()',optionEl.getWebElement());
    browser.wait(EC.presenceOf(optionEl));
    return optionEl;
  }

  getTablePaginatorText() {
    return element(by.css('.mat-paginator-range-label')).getText();
  }

  waitForDialogLoading(timeout) {
    let _timeout = (timeout || 60) * 1000;
    let EC = protractor.ExpectedConditions;
    let el = element(by.tagName('loading-dialog'));
    return browser.wait(EC.not(EC.presenceOf(el)),_timeout);
  }

  waitForSpecificElementToBePresent(el,timeout) {
    let _timeout = (timeout || 60) * 1000;
    let EC = protractor.ExpectedConditions;
    return browser.wait((EC.elementToBeClickable(el)),_timeout);
  }

  makeVisible(args) {
    let elm = args;
    elm.removeAttribute('class');
    elm.style.visibility = 'visible';
    elm.style.display = '';
    elm.style.height = '1px';
    elm.style.width = '1px';
    elm.style.opacity = 1;
  }

}
