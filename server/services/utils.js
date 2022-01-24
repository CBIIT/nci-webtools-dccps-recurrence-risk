import fsp from "fs/promises";
import template from "lodash/template.js";

/**
 * Renders a template file using the provided parameters
 * @param {string} filepath
 * @param {object} params
 * @returns
 */
export async function renderTemplate(filepath, params) {
  const templateString = await fsp.readFile(filepath, "utf8");
  return template(templateString)(params);
}

/**
 * Generates rfc4180-compliant csv files from arrays of arrays/objects
 * If an array of objects is provided, the config.headers property
 * allows the user to specify headers as an array of strings
 *
 * @param data
 * @param config
 * @returns
 */
export function stringifyCsv(data, config) {
  const defaultConfig = {
    delimiter: ",",
    newline: "\r\n",
  };

  let { delimiter, newline, headers } = {
    ...defaultConfig,
    ...config,
  };

  const escape = (value) => (typeof value !== "number" ? `"${String(value).replace(/"/g, '""')}"` : value);

  const rows = [];

  for (let row of data) {
    if (!Array.isArray(row)) {
      if (!headers) {
        headers = Object.keys(row);
      }
      if (rows.length === 0) {
        rows.push(headers.map(escape).join(delimiter));
      }
      row = headers.map((header) => row[header]);
    }

    rows.push(row.map(escape).join(delimiter));
  }

  return rows.join(newline);
}
