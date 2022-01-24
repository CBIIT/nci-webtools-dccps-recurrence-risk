import { Component } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { RecurrenceService } from "src/app/services/recurrence/recurrence.service";
import { GroupDataParameters, GroupDataWorkspace } from "./group-data.types";
import { DEFAULT_GROUP_DATA_WORKSPACE } from "./group-data.defaults";

@Component({
  selector: "app-group-data",
  templateUrl: "./group-data.component.html",
  styleUrls: ["./group-data.component.scss"],
})
export class GroupDataComponent {
  activeNavId: string = "results";
  error: any = null;
  loading: boolean = false;
  workspace: GroupDataWorkspace = DEFAULT_GROUP_DATA_WORKSPACE;
  alerts: any[] = [];

  constructor(private recurrenceRiskService: RecurrenceService) {}

  handleReset() {
    this.activeNavId = "results";
    this.workspace = DEFAULT_GROUP_DATA_WORKSPACE;
    this.error = null;
    this.loading = false;
    this.alerts = [];
  }

  async handleSubmit(parameters: GroupDataParameters) {
    try {
      this.handleReset();
      this.loading = true;
      const response$ = this.recurrenceRiskService.getRiskFromGroupData(parameters);
      const results = await lastValueFrom(response$);
      this.workspace = { parameters, results };
    } catch (e) {
      this.error = e;
      this.alerts.push({
        type: "danger",
        message:
          "Your request could not be processed due to an internal error. Please contact the website administrator if this problem persists.",
      });
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  handleLoadWorkspace(workspace: GroupDataWorkspace) {
    this.workspace = workspace;
  }
}
