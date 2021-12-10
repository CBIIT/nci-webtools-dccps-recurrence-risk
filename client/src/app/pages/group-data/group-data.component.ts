import { Component, OnInit } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { RecurrenceService } from "src/app/services/recurrence/recurrence.service";
import { GroupDataParameters } from "./group-data-form/group-data-form.component";
import { GroupDataWorkspace } from "./group-data-workspace";

@Component({
  selector: "app-group-data",
  templateUrl: "./group-data.component.html",
  styleUrls: ["./group-data.component.scss"],
})
export class GroupDataComponent {
  error: any = null;
  loading: boolean = false;
  workspace: GroupDataWorkspace = new GroupDataWorkspace();

  constructor(private recurrenceRiskService: RecurrenceService) {}

  handleReset() {
    this.workspace = new GroupDataWorkspace();
    this.error = null;
    this.loading = false;
  }

  async handleSubmit(parameters: GroupDataParameters) {
    try {
      this.handleReset();
      this.loading = true;
      const response$ = this.recurrenceRiskService.getRiskFromGroupData(parameters);
      const results = await lastValueFrom(response$);
      this.workspace = new GroupDataWorkspace(parameters, results);
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
