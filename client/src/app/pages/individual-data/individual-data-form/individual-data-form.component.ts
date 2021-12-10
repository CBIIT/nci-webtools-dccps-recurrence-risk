import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DataFrameHeader, FileService } from "src/app/services/file/file.service";
import { SelectOption } from "src/app/components/multiselect/multiselect.component";
import { IndividualDataParameters, IndividualDataWorkspace } from "../individual-data.types";
import { DEFAULT_INDIVIDUAL_DATA_PARAMETERS as defaults } from "../individual-data.defaults";
import { Row } from "src/app/components/table/table.component";

@Component({
  selector: "app-individual-data-form",
  templateUrl: "./individual-data-form.component.html",
  styleUrls: ["./individual-data-form.component.scss"],
})
export class IndividualDataFormComponent implements OnInit {
  @Output() loadWorkspace = new EventEmitter<IndividualDataWorkspace>();
  @Output() submit = new EventEmitter<IndividualDataParameters>();
  @Output() reset = new EventEmitter<void>();
  form = new FormGroup({
    inputFileType: new FormControl("individualDataFile", [Validators.required]),
    workspaceDataFile: new FormControl(null),
    individualDataFile: new FormControl(null, [Validators.required]),
    individualData: new FormControl(defaults.individualData, [Validators.required]),
    individualDataFileName: new FormControl(defaults.individualDataFileName, [Validators.required]),
    individualDataHeaders: new FormControl(defaults.individualDataHeaders, [Validators.required]),
    strata: new FormControl(defaults.strata),
    covariates: new FormControl(defaults.covariates),
    timeVariable: new FormControl(defaults.timeVariable, [Validators.required]),
    eventVariable: new FormControl(defaults.eventVariable, [Validators.required]),
    distribution: new FormControl(defaults.distribution, [Validators.required]),
    stageVariable: new FormControl(defaults.stageVariable, [Validators.required]),
    distantStageValue: new FormControl(defaults.distantStageValue, [Validators.required]),
    adjustmentFactorR: new FormControl(defaults.adjustmentFactorR, [
      Validators.required,
      Validators.min(0.5),
      Validators.max(2),
    ]),
    followUpYears: new FormControl(defaults.followUpYears, [Validators.required, Validators.min(1)]),
    queue: new FormControl(defaults.queue, []),
    email: new FormControl(defaults.email, []),
  });
  headerControls: { [key: string]: string } = {};
  loading: boolean = false;

  constructor(private fileService: FileService) {
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormValueChange = this.handleFormValueChange.bind(this);
    this.handleIndividualDataFileChange = this.handleIndividualDataFileChange.bind(this);
    this.handleWorkspaceDataFileChange = this.handleWorkspaceDataFileChange.bind(this);
    this.handleTimeVariableChange = this.handleTimeVariableChange.bind(this);
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(this.handleFormValueChange);
    this.form.controls.individualDataFile.valueChanges.subscribe(this.handleIndividualDataFileChange);
    this.form.controls.workspaceDataFile.valueChanges.subscribe(this.handleWorkspaceDataFileChange);
    this.form.controls.timeVariable.valueChanges.subscribe(this.handleTimeVariableChange);
  }

  handleReset(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.form.reset({
      inputFileType: "individualDataFile",
      individualDataFile: null,
      workspaceDataFile: null,
      ...defaults,
    });

    this.reset.emit();
    return false;
  }

  handleSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.form.markAllAsTouched();

    if (this.form.errors) {
      return false;
    }

    this.submit.emit({
      individualData: this.form.value.individualData,
      individualDataFileName: this.form.value.individualDataFileName,
      individualDataHeaders: this.form.value.individualDataHeaders,
      strata: this.form.value.strata,
      covariates: this.form.value.covariates,
      timeVariable: this.form.value.timeVariable,
      eventVariable: this.form.value.eventVariable,
      distribution: this.form.value.distribution,
      stageVariable: this.form.value.stageVariable,
      distantStageValue: this.form.value.distantStageValue,
      adjustmentFactorR: this.form.value.adjustmentFactorR,
      followUpYears: this.form.value.followUpYears,
      queue: this.form.value.queue,
      email: this.form.value.email,
    });

    return false;
  }

  handleFormValueChange(formValue: any) {
    const { queue, email } = this.form.controls;

    if (this.shouldQueue(formValue)) {
      queue.setValue(true, { emitEvent: false });
      email.setValidators([Validators.required, Validators.email]);
    } else {
      email.clearValidators();
    }
  }

  /**
   * Sets validators for input files based on selected file type
   * @param inputFileType
   */
  handleInputFileTypeChange(inputFileType: string) {
    const { workspaceDataFile, individualDataFile } = this.form.controls;

    this.form.patchValue({
      workspaceDataFile: null,
      individualDataFile: null,
    });

    if (inputFileType === "individualDataFile") {
      workspaceDataFile.clearValidators();
      individualDataFile.setValidators([Validators.required]);
    } else if (inputFileType === "workspaceFile") {
      workspaceDataFile.setValidators([Validators.required]);
      individualDataFile.clearValidators();
    }

    workspaceDataFile.updateValueAndValidity();
    individualDataFile.updateValueAndValidity();
  }

  async handleIndividualDataFileChange(fileList: FileList) {
    if (fileList?.length) {
      try {
        const individualDataFile = fileList[0];
        const dataFrame = await this.fileService.parseCsvFile(individualDataFile);

        this.form.patchValue({
          ...defaults,
          individualData: dataFrame.data,
          individualDataHeaders: dataFrame.headers,
          individualDataFileName: individualDataFile.name,
        });
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    } else {
      this.form.patchValue(defaults);
    }
  }

  /**
   * Recreates workspace from input file and populates form with data
   * @param fileList
   */
  async handleWorkspaceDataFileChange(fileList: FileList) {
    if (fileList?.length) {
      try {
        const workspaceDataFile = fileList[0];
        const workspaceData = await this.fileService.parseJsonFile(workspaceDataFile);
        const parameters = workspaceData.parameters as IndividualDataParameters;
        const results = workspaceData.results as Row[];
        const workspace = { parameters, results };
        console.log({ workspace });

        this.form.patchValue(parameters);
        this.loadWorkspace.emit(workspace);
      } catch (error) {
        console.error(error);
      }
    }
  }

  handleTimeVariableChange(timeVariable: string) {
    const timeVariableHeader: DataFrameHeader = this.getHeaderByName(timeVariable);
    const maxFollowUpYears = this.getMaxFactorValue(timeVariableHeader) || defaults.followUpYears;
    const followUpYears = Math.min(maxFollowUpYears, defaults.followUpYears);
    this.form.patchValue({ followUpYears });
  }

  isDisabled(headerName: string, formControlName: string) {
    const controls = ["strata", "covariates", "timeVariable", "eventVariable"];
    const headers = this.form.value.individualDataHeaders?.map((header: DataFrameHeader) => header.name);
    const headerControls =
      headers?.reduce((headerControls: any, header: string) => {
        for (const controlName of controls) {
          if (this.form.value[controlName].includes(header)) {
            headerControls[header] = controlName;
          }
        }
        return headerControls;
      }, {}) || {};

    return Boolean(headerControls[headerName] && headerControls[headerName] !== formControlName);
  }

  shouldQueue(formValue: any) {
    return formValue?.strata?.length > 2 || formValue?.covariates.length > 0;
  }

  getOptions(headers: DataFrameHeader[], formControlName: string): SelectOption[] {
    return headers.map((header) => ({
      value: header.name,
      label: header.name,
      disabled: this.isDisabled(header.name, formControlName),
    }));
  }

  getHeaderByName(name: string): DataFrameHeader {
    return this.form.controls.individualDataHeaders.value?.find((header: DataFrameHeader) => header.name === name);
  }

  getFactors(headers: DataFrameHeader[], name: string) {
    return headers?.find((header) => header.name === name)?.factors || [];
  }

  getMaxFactorValue(header?: DataFrameHeader) {
    return header?.factors?.map((factor) => Number(factor.value)).reduce((max, value) => Math.max(max, value));
  }
}
