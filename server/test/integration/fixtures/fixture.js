let path = require('path');

const dictionaryFile = path.join('test','integration','fixtures','groupdata_example_seer.dic');
const textDataFile = path.join('test','integration','fixtures','groupdata_example_seer.txt');
const canSurvDataFile = path.join('test','integration','fixtures','groupdata_example_cansurv.csv');
const csvDataFile = path.join('test','integration','fixtures','individualdata_example.csv');

const rAsyncFile = path.join('test','integration','fixtures','ex-async.R');
const rSyncFile = path.join('test','integration','fixtures','ex-sync.R');
const rAttitudeFile = path.join('test','integration','fixtures','attitude.json');

const groupMetadataFixture = {
  variables: ['SEER_historic_stage_LRD', 'Year_of_diagnosis_BC','Age_breast' ],
  values: {
    SEER_historic_stage_LRD: [ 0, 1, 2],
    Year_of_diagnosis_BC: [ 0, 1, 2, 3 ],
    Age_breast: [ 0, 1, 2 ]
  },
  maxFollowUp: [ 30 ]
};

const individualMetadataFixture = {
  variables: [ 'Breast_stage_AJCC','Year_of_diagnosis_BC_2per1992','Age_breast3','Age_at_diagnosis',
    'Race_recode_White_Black_Other','Sex','Vital_status_recode_study_cutoff_used','Month_of_diagnosis_recode',
    'Month_of_followup_recode','Year_of_followup_recode','End_Calc_Vital_Status_Adjusted',
    'Begin_Calc_Age_Adjusted','Number_of_Intervals_Calculated','event_allcauses','status','yeargroup','agegroup',
    'stage','time' ],
  values: {
    Breast_stage_AJCC: [ 10, 32, 33, 51, 52, 53, 54, 70 ],
    Year_of_diagnosis_BC_2per1992:[ 1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,
      2007,2008,2009,2010,2011,2012,2013 ],
    Age_breast3: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ],
    Age_at_diagnosis: [ 15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,
      47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84 ],
    Race_recode_White_Black_Other: [ 1, 2, 3, 9 ],
    Sex: [ 2 ],
    Vital_status_recode_study_cutoff_used: [ 1, 4 ],
    Month_of_diagnosis_recode: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    Month_of_followup_recode: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    Year_of_followup_recode: [ 1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,
      2009,2010,2011,2012,2013,2014 ],
    End_Calc_Vital_Status_Adjusted: [ 0, 1, 3 ],
    Begin_Calc_Age_Adjusted: [ 15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,
      44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
      81,82,83,84 ],
    Number_of_Intervals_Calculated: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 ],
    event_allcauses: [ 0, 1, 2 ],
    status: [ 0, 1 ],
    yeargroup: [ 0, 1 ],
    agegroup: [ 0, 1, 2 ],
    stage: [ 0, 1, 2, 3 ],
    time: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 ] }
};

module.exports = {
  GROUP_METADATA : groupMetadataFixture,
  INDIVIDUAL_METADATA: individualMetadataFixture,
  DICTIONARY: dictionaryFile,
  TEXTDATA: textDataFile,
  CANSURVVDATA: canSurvDataFile,
  CSVDATA: csvDataFile,
  RSYNC: rSyncFile,
  RASYNC: rAsyncFile,
  RDATAFILE: rAttitudeFile
}
