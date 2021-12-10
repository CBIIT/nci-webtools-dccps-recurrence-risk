import { Row } from "src/app/components/table/table.component";
import { GroupDataParameters } from "./group-data-form/group-data-form.component";

export class GroupDataWorkspace {
  parameters: GroupDataParameters;
  results: Row[] = [];

  constructor(parameters?: GroupDataParameters, results?: Row[]) {
    this.parameters = parameters ?? {
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
    this.results = results ?? [];
  }

  exportToString() {
    return JSON.stringify({
      parameters: this.parameters,
      results: this.results,
    });
  }

  importFromString(workspaceContents: string) {
    const data: {
      parameters: GroupDataParameters;
      results: Row[];
    } = JSON.parse(workspaceContents);

    return new GroupDataWorkspace(data.parameters, data.results);
  }
}
