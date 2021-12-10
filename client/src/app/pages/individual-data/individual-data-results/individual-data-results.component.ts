import { Component, Input, SimpleChanges } from "@angular/core";
import { Header } from "src/app/components/table/table.component";
import { FileService } from "src/app/services/file/file.service";
import { DEFAULT_INDIVIDUAL_DATA_WORKSPACE } from "../individual-data.defaults";
import { IndividualDataWorkspace } from "../individual-data.types";

@Component({
  selector: "app-individual-data-results",
  templateUrl: "./individual-data-results.component.html",
  styleUrls: ["./individual-data-results.component.scss"],
})
export class IndividualDataResultsComponent {
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

  @Input() workspace: IndividualDataWorkspace = DEFAULT_INDIVIDUAL_DATA_WORKSPACE;
  headers: Header[] = this.defaultHeaders;

  constructor(private fileService: FileService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workspace) {
      this.headers = this.getResultsHeaders(changes.workspace.currentValue);
    }
  }

  getResultsHeaders(workspace: IndividualDataWorkspace) {
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

    if (parameters && results?.length) {
      const fileNamePrefix = parameters.individualDataFileName || "individual_data";
      const timestamp = this.getTimestamp();
      const fileName = `${fileNamePrefix}_results_${timestamp}.csv`;
      this.fileService.downloadCsv(results, fileName);
    }
  }

  downloadWorkspace() {
    const { parameters, results } = this.workspace;

    if (parameters && results?.length) {
      const fileNamePrefix = parameters.individualDataFileName || "individual_data";
      const timestamp = this.getTimestamp();
      const fileName = `${fileNamePrefix}_workspace_${timestamp}.recurrisk_individual_data_workspace`;
      const fileContents = JSON.stringify(this.workspace);
      this.fileService.downloadText(fileContents, fileName);
    }
  }

  getTimestamp() {
    // todo: replace with date-fns/format
    const d = new Date();
    return [
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((value) => String(value).padStart(2, "0")).join(""),
      [d.getHours(), d.getMinutes(), d.getSeconds()].map((value) => String(value).padStart(2, "0")).join(""),
    ].join("_");
  }
}
