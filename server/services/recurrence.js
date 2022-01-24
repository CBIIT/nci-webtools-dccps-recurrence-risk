import { fileURLToPath } from "url";
import r from "r-wrapper";

const sourcePathV1 = fileURLToPath(new URL("recurrenceV1.R", import.meta.url));
const sourcePathV2 = fileURLToPath(new URL("recurrenceV1.R", import.meta.url));

export const recurrence = {
  ping: () => r.async(sourcePathV2, "ping"),
  shouldQueue: ({ covariates, strata }) => covariates.length > 0 || strata.length > 2,
  v1: {
    getRiskFromGroupData: (params) => r.async(sourcePathV1, "getRiskFromGroupData", params),
    getRiskFromIndividualData: (params) => r.async(sourcePathV1, "getRiskFromIndividualData", params),
  },
  v2: {
    getRiskFromGroupData: (params) => r.async(sourcePathV2, "getRiskFromGroupData", params),
    getRiskFromIndividualData: (params) => r.async(sourcePathV2, "getRiskFromIndividualData", params),
  },
};
