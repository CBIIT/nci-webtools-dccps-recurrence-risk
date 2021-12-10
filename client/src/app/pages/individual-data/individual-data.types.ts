import { Row } from "src/app/components/table/table.component";
import { DataFrameHeader } from "src/app/services/file/file.service";

export type IndividualDataParameters = {
  individualData: Row[];
  individualDataFileName: string;
  individualDataHeaders: DataFrameHeader[];
  strata: number[];
  covariates: number[];
  timeVariable: string;
  eventVariable: string;
  distribution: string;
  stageVariable: string;
  distantStageValue: number;
  adjustmentFactorR: number;
  followUpYears: number;
  queue: boolean;
  email: string;
};

export type IndividualDataWorkspace = {
  parameters: IndividualDataParameters;
  results: Row[];
};
