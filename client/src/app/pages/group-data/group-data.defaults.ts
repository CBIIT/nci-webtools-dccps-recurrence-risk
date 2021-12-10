import { GroupDataParameters, GroupDataWorkspace } from "./group-data.types";

export const DEFAULT_GROUP_DATA_PARAMETERS: GroupDataParameters = {
  seerStatData: [],
  seerStatDataFileNames: [],
  canSurvData: [],
  canSurvDataFileName: "",
  seerStatDictionary: [],
  stageVariable: "",
  distantStageValue: 0,
  adjustmentFactorR: 1,
  followUpYears: 25,
};

export const DEFAULT_GROUP_DATA_WORKSPACE: GroupDataWorkspace = {
  parameters: DEFAULT_GROUP_DATA_PARAMETERS,
  results: [],
};
