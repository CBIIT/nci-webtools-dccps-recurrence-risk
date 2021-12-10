import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GroupDataParameters } from "src/app/pages/group-data/group-data-form/group-data-form.component";
import { Row } from "src/app/components/table/table.component";

@Injectable({
  providedIn: "root",
})
export class RecurrenceService {
  constructor(private http: HttpClient) {}

  getRiskFromGroupData(parameters: GroupDataParameters) {
    return this.http.post<Row[]>("api/v2/risk/group-data", parameters);
  }

  getRiskFromIndividualData(parameters: any) {
    return this.http.post<Row[]>("api/v2/risk/individual-data", parameters);
  }
}
