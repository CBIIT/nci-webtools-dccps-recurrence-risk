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
  error: any = null;
  loading: boolean = false;
  workspace: GroupDataWorkspace = DEFAULT_GROUP_DATA_WORKSPACE;

  constructor(private recurrenceRiskService: RecurrenceService) {}

  handleReset() {
    this.workspace = DEFAULT_GROUP_DATA_WORKSPACE;
    this.error = null;
    this.loading = false;
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
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  handleLoadWorkspace(workspace: GroupDataWorkspace) {
    this.workspace = workspace;
  }
}
