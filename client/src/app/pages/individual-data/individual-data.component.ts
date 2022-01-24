import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { lastValueFrom } from "rxjs";
import { RecurrenceService } from "src/app/services/recurrence/recurrence.service";
import { DEFAULT_INDIVIDUAL_DATA_WORKSPACE } from "./individual-data.defaults";
import { IndividualDataParameters, IndividualDataWorkspace } from "./individual-data.types";

@Component({
  selector: "app-individual-data",
  templateUrl: "./individual-data.component.html",
  styleUrls: ["./individual-data.component.scss"],
})
export class IndividualDataComponent implements OnInit {
  activeNavId: string = "results";
  workspace: IndividualDataWorkspace = DEFAULT_INDIVIDUAL_DATA_WORKSPACE;
  error: any = null;
  loading: boolean = false;
  alerts: any[] = [];

  constructor(private recurrenceRiskService: RecurrenceService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.handleReset();
    this.route.params.subscribe((params) => {
      if (params?.id) {
        this.loadResults(params.id);
      }
    });
  }

  handleReset() {
    this.activeNavId = "results";
    this.workspace = DEFAULT_INDIVIDUAL_DATA_WORKSPACE;
    this.error = null;
    this.loading = false;
    this.alerts = [];
  }

  async loadResults(id: string) {
    try {
      const response$ = this.recurrenceRiskService.getRiskFromIndividualDataResults(id);
      this.workspace = await lastValueFrom(response$);
    } catch (e) {
      console.log(e);
      this.alerts.push({
        type: "danger",
        message: "Your results could not be loaded. Please contact the website administrator if this problem persists.",
      });
    }
  }

  async handleSubmit(parameters: IndividualDataParameters) {
    try {
      this.handleReset();
      this.loading = true;
      const response$ = this.recurrenceRiskService.getRiskFromIndividualData(parameters);
      const results = await lastValueFrom(response$);

      if (parameters.queue) {
        this.alerts.push({
          type: "primary",
          message: "Your request has been enqueued. Results will be sent to the specified email once available.",
        });
        this.workspace = { parameters, results: [] };
      } else {
        this.workspace = { parameters, results };
      }
    } catch (e) {
      console.error(e);
      this.error = e;
      this.alerts.push({
        type: "danger",
        message:
          "Your request could not be processed due to an internal error. Please contact the website administrator if this problem persists.",
      });
    } finally {
      this.loading = false;
    }
  }

  handleLoadWorkspace(workspace: IndividualDataWorkspace) {
    this.workspace = workspace;
  }

  closeAlert(index: number) {
    this.alerts.splice(index, 1);
  }
}
