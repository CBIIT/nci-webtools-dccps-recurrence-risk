import { browser, by, element } from 'protractor';
import * as remote from 'selenium-webdriver/remote';

export class AppPage {

  navigateTo() {
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
    return element(by.css('input[aria-label=\'dic file\']'));
  }

  getDataFileInput() {
    return element(by.css('input[aria-label=\'data file\']'));
  }

  getGroupCanSurvFileInput() {
    return element(by.css('input[aria-label=\'csv file\']'));
  }

  getAdjustmentFactorInput() {
    return element(by.css('input[formcontrolname=\'adjustmentFactor\']'));
  }

  getSliderForAction() {
    let slider = element(by.tagName('mat-slider'));
    return {
      slideTo: (leftOrRight) => browser.actions().dragAndDrop(slider, { x:leftOrRight , y: 0})
    };
  }

  getSubmitButton() {
    return element(by.css('button[type=submit]'));
  }

  getDropdownByNameAndValue(name,optionValue) {
    let EC = protractor.ExpectedConditions;
    let selectEl = element(by.css(`mat-select[formcontrolname='${name}']`));
    browser.wait(EC.presenceOf(selectEl));
    selectEl.click();
    let optionEl = element.all(by.cssContainingText('.mat-option', optionValue)).last();
    browser.actions().mouseMove(optionEl).click();
    browser.wait(EC.presenceOf(optionEl));
    return optionEl;
  }

  getTablePaginatorText() {
    return element(by.css('.mat-paginator-range-label')).getText();
  }

  waitForDialogLoading(timeout) {
    let _timeout = (timeout || 20) * 1000;
    let EC = protractor.ExpectedConditions;
    let el = element(by.tagName('loading-dialog'));
    return browser.wait(EC.not(EC.presenceOf(el)),_timeout);
  }

}
