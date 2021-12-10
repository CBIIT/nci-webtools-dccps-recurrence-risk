import { DataFrameHeader } from "src/app/services/file/file.service";
import { Row } from "src/app/components/table/table.component";

export type GroupDataParameters = {
  seerStatData: Row[];
  seerStatDataFileNames: string[];
  canSurvData: Row[];
  canSurvDataFileName: string;
  seerStatDictionary: DataFrameHeader[];
  stageVariable: string;
  distantStageValue: number;
  adjustmentFactorR: number;
  followUpYears: number;
};

export type GroupDataWorkspace = {
  parameters: GroupDataParameters;
  results: Row[];
};
