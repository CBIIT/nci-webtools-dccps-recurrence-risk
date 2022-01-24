import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GroupDataParameters } from "src/app/pages/group-data/group-data.types";
import { Row } from "src/app/components/table/table.component";
import { IndividualDataWorkspace } from "src/app/pages/individual-data/individual-data.types";

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

  getRiskFromIndividualDataResults(id: string) {
    return this.http.get<IndividualDataWorkspace>(`api/risk/individual-data/${id}`);
  }
}
