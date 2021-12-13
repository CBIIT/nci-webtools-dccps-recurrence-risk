import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DataFrameHeader, FileService, IniConfig } from "src/app/services/file/file.service";
import { Row } from "src/app/components/table/table.component";
import { seerStatDataFilesValidator } from "./validators";
import { GroupDataParameters, GroupDataWorkspace } from "../group-data.types";
import { DEFAULT_GROUP_DATA_PARAMETERS as defaults } from "../group-data.defaults";

@Component({
  selector: "app-group-data-form",
  templateUrl: "./group-data-form.component.html",
  styleUrls: ["./group-data-form.component.scss"],
})
export class GroupDataFormComponent implements OnInit {
  @Output() loadWorkspace = new EventEmitter<GroupDataWorkspace>();
  @Output() submit = new EventEmitter<GroupDataParameters>();
  @Output() reset = new EventEmitter<void>();
  form = new FormGroup({
    inputFileType: new FormControl("seerStatAndCanSurvFiles", [Validators.required]),
    workspaceDataFile: new FormControl(null),
    seerStatDataFiles: new FormControl(null, [seerStatDataFilesValidator]),
    canSurvDataFile: new FormControl(null, [Validators.required]),
    workspaceDataFileName: new FormControl(""),
    seerStatDataFileNames: new FormControl(defaults.seerStatDataFileNames),
    canSurvDataFileName: new FormControl(defaults.canSurvDataFileName),
    seerStatDictionary: new FormControl(defaults.seerStatDictionary, [Validators.required]),
    seerStatData: new FormControl(defaults.seerStatData, [Validators.required]),
    canSurvData: new FormControl(defaults.canSurvData, [Validators.required]),
    stageVariable: new FormControl(defaults.stageVariable, [Validators.required]),
    distantStageValue: new FormControl(defaults.distantStageValue, [Validators.required]),
    adjustmentFactorR: new FormControl(defaults.adjustmentFactorR, [
      Validators.required,
      Validators.min(0.5),
      Validators.max(2),
    ]),
    followUpYears: new FormControl(defaults.followUpYears, [Validators.required, Validators.min(1)]),
  });

  constructor(private fileService: FileService) {
    // bind event handlers to the current context
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputFileTypeChange = this.handleInputFileTypeChange.bind(this);
    this.handleWorkspaceDataFileChange = this.handleWorkspaceDataFileChange.bind(this);
    this.handleSeerStatDataFilesChange = this.handleSeerStatDataFilesChange.bind(this);
    this.handleCanSurvDataFileChange = this.handleCanSurvDataFileChange.bind(this);
    this.handleStageVariableChange = this.handleStageVariableChange.bind(this);
  }

  ngOnInit(): void {
    // register event handlers for form value change events
    this.form.controls.inputFileType.valueChanges.subscribe(this.handleInputFileTypeChange);
    this.form.controls.workspaceDataFile.valueChanges.subscribe(this.handleWorkspaceDataFileChange);
    this.form.controls.seerStatDataFiles.valueChanges.subscribe(this.handleSeerStatDataFilesChange);
    this.form.controls.canSurvDataFile.valueChanges.subscribe(this.handleCanSurvDataFileChange);
    this.form.controls.stageVariable.valueChanges.subscribe(this.handleStageVariableChange);
  }

  handleReset(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.form.reset({
      inputFileType: "seerStatAndCanSurvFiles",
      workspaceFile: null,
      seerStatDataFiles: null,
      canSurvDataFile: null,
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
      seerStatData: this.form.value.seerStatData,
      seerStatDataFileNames: this.form.value.seerStatDataFileNames,
      canSurvData: this.form.value.canSurvData,
      canSurvDataFileName: this.form.value.canSurvDataFileName,
      seerStatDictionary: this.form.value.seerStatDictionary,
      stageVariable: this.form.value.stageVariable,
      distantStageValue: this.form.value.distantStageValue,
      adjustmentFactorR: this.form.value.adjustmentFactorR,
      followUpYears: this.form.value.followUpYears,
    });

    return false;
  }

  /**
   * Sets validators for input files based on selected file type
   * @param inputFileType
   */
  handleInputFileTypeChange(inputFileType: string) {
    const { workspaceDataFile, seerStatDataFiles, canSurvDataFile } = this.form.controls;

    this.form.patchValue({
      workspaceDataFile: null,
      seerStatDataFiles: null,
      canSurvDataFile: null,
    });

    if (inputFileType === "seerStatAndCanSurvFiles") {
      workspaceDataFile.clearValidators();
      seerStatDataFiles.setValidators([Validators.required]);
      canSurvDataFile.setValidators([Validators.required]);
    } else if (inputFileType === "workspaceFile") {
      workspaceDataFile.setValidators([Validators.required]);
      seerStatDataFiles.clearValidators();
      canSurvDataFile.clearValidators();
    }

    workspaceDataFile.updateValueAndValidity();
    seerStatDataFiles.updateValueAndValidity();
    canSurvDataFile.updateValueAndValidity();
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
        const parameters = workspaceData.parameters as GroupDataParameters;
        const results = workspaceData.results as Row[];
        const workspace = { parameters, results };
        this.form.patchValue({ ...parameters, workspaceDataFileName: workspaceDataFile.name });
        this.loadWorkspace.emit(workspace);
      } catch (error) {
        console.error(error);
        this.handleReset();
      }
    }
  }

  /**
   * Parses SEER*STAT data files as a dataframe and stores it in the form.
   * @param fileList - A FileList of SEER*STAT data files.
   */
  async handleSeerStatDataFilesChange(fileList: FileList) {
    if (fileList) {
      const files = Array.from(fileList);
      const dictionaryFile = files.find((file: File) => /.dic$/i.test(file.name));
      const dataFile = files.find((file: File) => /.txt$/i.test(file.name));

      try {
        if (dictionaryFile && dataFile) {
          // parse SEER*Stat files to extract dictionary headers and data
          const { headers, config } = await this.fileService.parseSeerStatDictionary(dictionaryFile);
          const { data } = await this.fileService.parseSeerStatFiles(dictionaryFile, dataFile);

          // by default, use 25 years of follow-up (less if there are fewer years of follow-up in the data)
          const followUpYears = Math.min(25, this.getMaxFollowUpYears(config));

          // set dependent form values
          this.form.patchValue({
            seerStatDataFileNames: [dictionaryFile.name, dataFile.name],
            seerStatDictionary: headers,
            seerStatData: data,
            followUpYears,
          });
        } else {
          throw new Error("Invalid SEER*STAT files selected.");
        }
      } catch (e) {
        // reset dependent form values if a SEER*Stat file is missing
        console.log(e);
        this.form.patchValue({
          seerStatDataFileNames: defaults.seerStatDataFileNames,
          seerStatDictionary: defaults.seerStatDictionary,
          seerStatData: defaults.seerStatData,
          stageVariable: defaults.stageVariable,
          followUpYears: defaults.followUpYears,
        });
      }
    }
  }

  /**
   * Parses the given CanSurv data file and stores it in the form.
   * @param fileList - A FileList of CanSurv data files.
   */
  async handleCanSurvDataFileChange(fileList: FileList) {
    const canSurvDataFile = fileList && fileList[0];

    if (canSurvDataFile) {
      const { data } = await this.fileService.parseCsvFile(canSurvDataFile);
      this.form.patchValue({
        canSurvDataFileName: canSurvDataFile.name,
        canSurvData: data,
      });
    } else {
      this.form.patchValue({
        canSurvDataFileName: defaults.canSurvDataFileName,
        canSurvData: defaults.canSurvData,
      });
    }
  }

  /**
   * Clears distant stage variable whenever the stage variable changes
   */
  handleStageVariableChange() {
    this.form.patchValue({ distantStageValue: defaults.distantStageValue });
  }

  getHeaderByName(name: string): DataFrameHeader {
    return this.form.controls.seerStatDictionary.value?.find((header: DataFrameHeader) => header.name === name);
  }

  /**
   * Retrieves the maximum number of follow-up years from the SEER*Stat dictionary
   * @param seerStatDictionryConfig
   * @returns
   */
  getMaxFollowUpYears(seerStatDictionryConfig: IniConfig) {
    // determine the maximum number of followup years
    const sessionOptions = seerStatDictionryConfig["Session Options"];
    const numberOfIntervals = +sessionOptions?.NumberOfIntervals || 30;
    const monthsPerInterval = +sessionOptions?.MonthsPerInterval || 12;
    const maxFollowUpYears = Math.ceil((monthsPerInterval * numberOfIntervals) / 12);
    return maxFollowUpYears;
  }
}
