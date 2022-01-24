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
    workspaceDataFileName: new FormControl(defaults.workspaceDataFileName),
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
    this.handleIndividualDataFileChange = this.handleIndividualDataFileChange.bind(this);
    this.handleWorkspaceDataFileChange = this.handleWorkspaceDataFileChange.bind(this);
    this.handleTimeVariableChange = this.handleTimeVariableChange.bind(this);
    this.handleShouldQueueChange = this.handleShouldQueueChange.bind(this);
    this.handleQueueChange = this.handleQueueChange.bind(this);
  }

  ngOnInit(): void {
    this.form.controls.individualDataFile.valueChanges.subscribe(this.handleIndividualDataFileChange);
    this.form.controls.workspaceDataFile.valueChanges.subscribe(this.handleWorkspaceDataFileChange);
    this.form.controls.timeVariable.valueChanges.subscribe(this.handleTimeVariableChange);
    this.form.controls.strata.valueChanges.subscribe(this.handleShouldQueueChange);
    this.form.controls.covariates.valueChanges.subscribe(this.handleShouldQueueChange);
    this.form.controls.queue.valueChanges.subscribe(this.handleQueueChange);
  }

  handleReset(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.form.reset({
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
    this.form.updateValueAndValidity();
    console.log(this.form);

    if (this.form.invalid) {
      return false;
    }

    this.submit.emit({
      inputFileType: this.form.value.inputFileType,
      workspaceDataFileName: this.form.value.workspaceDataFileName,
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

  handleShouldQueueChange(formValue: any) {
    const { queue } = this.form.controls;
    if (this.shouldQueue(formValue)) {
      queue.setValue(true);
    }
  }

  handleQueueChange(queue: boolean) {
    const { email } = this.form.controls;
    if (queue) {
      email.setValidators([Validators.required, Validators.email]);
    } else {
      email.clearValidators();
    }
    email.updateValueAndValidity();
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
        this.form.patchValue(parameters);
        this.form.updateValueAndValidity();
        this.loadWorkspace.emit(workspace);
        console.log(this.form);
      } catch (error) {
        console.error(error);
        this.handleReset();
      }
    }
  }

  handleTimeVariableChange(timeVariable: string) {
    const maxFollowUpYears = this.getMaxFollowUpYears(timeVariable) || defaults.followUpYears;
    const followUpYears = Math.min(maxFollowUpYears, defaults.followUpYears);
    this.form.patchValue({ followUpYears });
  }

  /**
   * Determines if a particular header variable is already in use by a different control
   * @param headerName
   * @param formControlName
   * @returns
   */
  isDisabled(headerName: string, formControlName: string) {
    const mutuallyExclusiveControls = ["strata", "covariates", "timeVariable", "eventVariable"];
    const controlName = mutuallyExclusiveControls.find((name) => this.form.value[name].includes(headerName));
    return Boolean(controlName && controlName !== formControlName);
  }

  shouldQueue(formValue: any) {
    return formValue?.strata?.length > 2 || formValue?.covariates?.length > 0;
  }

  getIndividualDataHeaders(): DataFrameHeader[] {
    return this.form.controls.individualDataHeaders?.value || [];
  }

  /**
   * Retrieves available options for a particular header
   * @param headers
   * @param formControlName
   * @returns
   */
  getOptions(formControlName: string): SelectOption[] {
    return this.getIndividualDataHeaders().map((header: DataFrameHeader) => ({
      value: header.name,
      label: header.name,
      disabled: this.isDisabled(header.name, formControlName),
    }));
  }

  /**
   * Retrieves a header by its name
   * @param name
   * @returns
   */
  getHeaderByName(name: string) {
    return this.getIndividualDataHeaders().find((header: DataFrameHeader) => header.name === name);
  }

  /**
   * Retrieves the maximum number of follow-up years based on the time variable
   * @param timeVariable
   * @returns
   */
  getMaxFollowUpYears(timeVariable: string) {
    // determine the maximum number of followup years
    const timeVariableHeader = this.getHeaderByName(timeVariable);
    let maxFollowUpYears = 0;

    if (timeVariableHeader) {
      // reduce is slower than a plain loop
      for (const factor of timeVariableHeader?.factors || []) {
        const factorValue = Number(factor.value) || 0;
        maxFollowUpYears = Math.max(factorValue, maxFollowUpYears);
      }
    }

    return maxFollowUpYears;
  }
}
