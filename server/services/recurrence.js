const path = require("path");
const r = require("r-wrapper").async;
const sourcePathV1 = path.resolve(__dirname, "recurrenceV1.R");
const sourcePathV2 = path.resolve(__dirname, "recurrenceV2.R");

module.exports = {
  ping: () => r(sourcePathV2, "ping"),
  v1: {
    getRiskFromGroupData: (params) => r(sourcePathV1, "getRiskFromGroupData", params),
    getRiskFromIndividualData: (params) => r(sourcePathV1, "getRiskFromIndividualData", params),
  },
  v2: {
    getRiskFromGroupData: (params) => r(sourcePathV2, "getRiskFromGroupData", params),
    getRiskFromIndividualData: (params) => r(sourcePathV2, "getRiskFromIndividualData", params),
  },
};
