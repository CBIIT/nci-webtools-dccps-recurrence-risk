import { IndividualDataParameters, IndividualDataWorkspace } from "./individual-data.types";

export const DEFAULT_INDIVIDUAL_DATA_PARAMETERS: IndividualDataParameters = {
  inputFileType: "individualDataFile",
  workspaceDataFileName: "",
  individualData: [],
  individualDataFileName: "",
  individualDataHeaders: [],
  strata: [],
  covariates: [],
  timeVariable: "",
  eventVariable: "",
  distribution: "",
  stageVariable: "",
  distantStageValue: 0,
  adjustmentFactorR: 1,
  followUpYears: 25,
  queue: false,
  email: "",
};

export const DEFAULT_INDIVIDUAL_DATA_WORKSPACE: IndividualDataWorkspace = {
  parameters: DEFAULT_INDIVIDUAL_DATA_PARAMETERS,
  results: [],
};
