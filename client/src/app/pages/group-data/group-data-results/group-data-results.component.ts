import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Header, Row } from "src/app/components/table/table.component";
import { FileService } from "src/app/services/file/file.service";

@Component({
  selector: "app-group-data-results",
  templateUrl: "./group-data-results.component.html",
  styleUrls: ["./group-data-results.component.scss"],
})
export class GroupDataResultsComponent implements OnInit, OnChanges {
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

  @Input() results: Row[] = [];
  @Input() parameters: any = {};

  headers: Header[] = this.defaultHeaders;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.results && this.results.length > 0) {
      this.headers = Object.keys(this.results[0]).map((name) => ({
        key: name,
        title: name,
      }));
    } else {
      this.headers = this.defaultHeaders;
    }
  }

  downloadResults() {
    if (this.parameters && this.results?.length) {
      const fileNamePrefix = this.parameters.seerStatFileName || "seer_stat";
      const timestamp = this.getTimestamp();
      const fileName = `${fileNamePrefix}_results_${timestamp}.csv`;
      this.fileService.downloadCsv(this.results, fileName);
    }
  }

  downloadWorkspace() {
    if (this.parameters && this.parameters.seerStatFileName) {
      const fileNamePrefix = this.parameters.seerStatFileName || "seer_stat";
      const timestamp = this.getTimestamp();
      const fileName = `${fileNamePrefix}_workspace_${timestamp}.json`;
      const fileContents = JSON.stringify({
        parameters: this.parameters,
        results: this.results,
      });
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
