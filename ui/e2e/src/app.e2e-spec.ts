import { AppPage } from './app.po';
import * as path from 'path';

describe('workspace-project App', () => {
  let page: AppPage;
  let dictionaryFile = path.resolve(__dirname,'..','fixtures','groupdata_example_seer.dic');
  let textFile = path.resolve(__dirname,'..','fixtures','groupdata_example_seer.txt');
  let csvCansurvFile = path.resolve(__dirname,'..','fixtures','groupdata_example_cansurv.csv');
  let csvIndividualFile = path.resolve(__dirname,'..','fixtures','individualdata_example.csv');

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message and load default page', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Recurrence Risk Tool');
    let element = page.getCurrentlySelectedButton();
    expect(page.getToggleButtonLabelText(element)).toEqual('Group Data');
  });

  it('should submit group data form and get results', () => {
    page.navigateTo();
    page.getGroupDictionaryFileInput().sendKeys(dictionaryFile);
    page.getDataFileInput().sendKeys(textFile);
    page.waitForDialogLoading();

    page.getGroupCanSurvFileInput().sendKeys(csvCansurvFile);
    page.getDropdownByNameAndValue('stageVariable','SEER_historic_stage_LRD').click();
    page.getDropdownByNameAndValue('stageValue','2').click();
    page.getAdjustmentFactorInput().sendKeys('1');
    page.getSliderForAction().slideTo(-100).perform();
    page.getSubmitButton().click();

    page.waitForDialogLoading(40);//wait up to 40 seconds
    //wait for loading dialog to disappear
    expect(page.getTablePaginatorText()).toEqual('1 - 10 of 120');
  });

  it('should submit individual data form and get results', () => {
    page.navigateTo();
    page.getMenuDataButton('individual').click();
    page.getDataFileInput().sendKeys(csvIndividualFile);
    page.waitForDialogLoading();
    page.getDropdownByNameAndValue('timeVariable','time').click();
    page.getDropdownByNameAndValue('eventVariable','status').click();
    page.getDropdownByNameAndValue('distribution','Weibull').click();
    page.getDropdownByNameAndValue('stageVariable','agegroup').click();
    page.getDropdownByNameAndValue('distantStageValue','2').click();
    page.getAdjustmentFactorInput().sendKeys('1');
    page.getSliderForAction().slideTo(-100).perform();
    page.getSubmitButton().click();
    page.waitForDialogLoading(60); //wait up to 40 seconds
    expect(page.getTablePaginatorText()).toEqual('1 - 4 of 4');
  });


});
