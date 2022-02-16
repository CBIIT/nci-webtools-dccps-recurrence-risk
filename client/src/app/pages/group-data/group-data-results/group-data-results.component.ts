import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Header } from "src/app/components/table/table.component";
import { FileService } from "src/app/services/file/file.service";
import { DEFAULT_GROUP_DATA_WORKSPACE } from "../group-data.defaults";
import { GroupDataWorkspace } from "../group-data.types";

@Component({
  selector: "app-group-data-results",
  templateUrl: "./group-data-results.component.html",
  styleUrls: ["./group-data-results.component.scss"],
})
export class GroupDataResultsComponent implements OnChanges {
  readonly defaultHeaders: Header[] = [
    { key: "followup", title: "followup" },
    { key: "link", title: "link" },
    { key: "r", title: "r" },
    { key: "cure", title: "cure" },
    { key: "lambda", title: "lambda" },
    { key: "k", title: "k" },
    { key: "theta", title: "theta" },
    { key: "surv_curemodel", title: "surv_curemodel" },
    { key: "surv_notcure", title: "surv_notcure" },
    { key: "median_surv_notcured", title: "median_surv_notcured" },
    { key: "s1_numerical", title: "s1_numerical" },
    { key: "G_numerical", title: "G_numerical" },
    { key: "CI_numerical", title: "CI_numerical" },
    { key: "s1_analytical", title: "s1_analytical" },
    { key: "G_analytical", title: "G_analytical" },
    { key: "CI_analytical", title: "CI_analytical" },
    { key: "se_CI_analytical", title: "se_CI_analytical" },
    { key: "obs_surv", title: "obs_surv" },
    { key: "obs_dist_surv", title: "obs_dist_surv" },
  ];

  @Input() workspace: GroupDataWorkspace = DEFAULT_GROUP_DATA_WORKSPACE;
  headers: Header[] = this.defaultHeaders;

  constructor(private fileService: FileService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workspace) {
      this.headers = this.getResultsHeaders(changes.workspace.currentValue);
    }
  }

  getResultsHeaders(workspace: GroupDataWorkspace) {
    if (workspace.results.length === 0) {
      return this.defaultHeaders;
    } else {
      return Object.keys(workspace.results[0]).map((name) => ({
        key: name,
        title: name,
      }));
    }
  }

  downloadResults() {
    const { parameters, results } = this.workspace;

    if (parameters.seerStatDataFileNames.length && results.length) {
      const fileNamePrefix = parameters.seerStatDataFileNames[0].replace(/\.[^\.]+$/, "");
      const timestamp = this.getTimestamp();
      const fileName = `recurrisk_${fileNamePrefix}_group_data_results_${timestamp}.xlsx`;
      const parameterRows = [
        {
          Parameter: "SEER*Stat Dictionary File",
          Value: parameters.seerStatDataFileNames.find((f) => /\.dic$/i.test(f)) || "",
        },
        {
          Parameter: "SEER*Stat Data File",
          Value: parameters.seerStatDataFileNames.find((f) => /\.txt$/i.test(f)) || "",
        },
        { Parameter: "CanSurv Data File", Value: parameters.canSurvDataFileName },
        { Parameter: "Stage Variable", Value: parameters.stageVariable },
        { Parameter: "Distant Stage Value", Value: +parameters.distantStageValue },
        { Parameter: "Adjustment Factor r", Value: +parameters.adjustmentFactorR },
        { Parameter: "Years of Follow-up ", Value: +parameters.followUpYears },
      ];
      const sheets = [
        { name: "Parameters", data: parameterRows },
        { name: "Results", data: results },
      ];
      this.fileService.downloadExcel(sheets, fileName);
    }
  }

  downloadWorkspace() {
    const { parameters, results } = this.workspace;

    if (parameters.seerStatDataFileNames.length && results.length) {
      const fileNamePrefix = parameters.seerStatDataFileNames[0].replace(/\.[^\.]+$/, "");
      const timestamp = this.getTimestamp();
      const fileName = `recurrisk_${fileNamePrefix}_${timestamp}.group_data_workspace`;
      const fileContents = JSON.stringify(this.workspace);
      this.fileService.downloadText(fileContents, fileName);
    }
  }

  getTimestamp() {
    const d = new Date();
    return [
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((value) => String(value).padStart(2, "0")).join(""),
      [d.getHours(), d.getMinutes(), d.getSeconds()].map((value) => String(value).padStart(2, "0")).join(""),
    ].join("_");
  }
}
