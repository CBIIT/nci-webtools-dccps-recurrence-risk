import { Inject, Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator,
  MatTableDataSource,
  MatSort ,
  MatDialog,
  MatDialogRef,
  MatOptionSelectionChange,
  MAT_DIALOG_DATA } from '@angular/material';
import { TdFileService, TdFileInputComponent, IUploadOptions } from '@covalent/core/file';
import { environment } from '../../environments/environment';
import { RecurrenceRiskService } from '../../shared/services/recurrenceRisk.service';
import { LoadingDialogComponent } from '../../shared/dialogs/loading-dialog.component';

import * as FileSaver from 'file-saver';

@Component({
  selector: 'rrt-individual',
  templateUrl: './individual.component.html',
  styleUrls: ['./individual.component.scss']
})
export class IndividualComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([{},{},{}]);
  CORE_COLUMNS: string[] = [
    'followup',
    'link',
    'r',
    'cure',
    'lambda',
    'theta',
    'surv_curemodel',
    'surv_notcured',
    'median_surv_notcured',
    's1_analytical',
    'G_analytical',
    'CI_analytical',
    'se_CI_analytical',
    'obs_surv',
    'obs_dist_surv' ];

  selectionGroup: any = {};

  displayedColumns: string[] = [];

  columnsToDisplay: string[] = [];

  individualDataForm: FormGroup;

  distributionList: string[] = ['Log-logistic','Weibull'];

  individualMetadata: any = { variables: []};

  loadingDialogRef: any;

  showDownloadResults: boolean = false;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild('dataFileInput', {static: true}) dataFileSelect: TdFileInputComponent;

  errorMsg: string = "";

  defaultErrorMsg: string = "An unexpected error occured. Please ensure the input file(s) is in the correct"
    + "format and/or correct parameters were chosen.";

  followup: any = {
      max: 2,
      min: 1,
      step: 1,
      interval: 1
    };

  constructor(private fileUploadService: TdFileService,private formBuilder: FormBuilder,
    private riskService: RecurrenceRiskService,private router: Router,private dialog: MatDialog) {
    this.individualDataForm = formBuilder.group({
      seerCSVDataFile: ['', Validators.required],
      strata: [''],
      covariates: [''],
      timeVariable: ['', Validators.required],
      eventVariable: ['', Validators.required],
      distribution: ['', Validators.required],
      stageVariable: ['', Validators.required],
      distantStageValue: ['', Validators.required],
      adjustmentFactor: ['1', [Validators.required, Validators.min(0)]],
      yearsOfFollowUp: ['2', [Validators.required, Validators.min(1)]],
      email: ['']
    });

    this.individualDataForm.get('seerCSVDataFile').valueChanges.subscribe( file => {
      if(file) {
        this.loadSeerFormData();
      }
    });

    this.individualDataForm.get('stageVariable').valueChanges.subscribe( (stageVar) => {
      this.individualDataForm.patchValue({distantStageValue: ''}, {emitEvent: false});
      this.errorMsg = '';
    });

    this.individualDataForm.get('timeVariable').valueChanges.subscribe( (timeVar) => {
      let valuesMap = this.individualMetadata['values'];
      if(valuesMap && valuesMap[timeVar] && valuesMap[timeVar].length > 0 ) {
        this.followup.max = valuesMap[timeVar][valuesMap[timeVar].length-1];
        this.patchValueHelper({ yearsOfFollowUp: this.followup.max });
      }
    });

    router.events.subscribe( (event) => {
      if (event instanceof NavigationStart) {
        this.riskService.setCurrentState('individual', {
          data: this.dataSource.data,
          metadata: this.individualMetadata,
          form: this.individualDataForm.value,
          dispColumns: this.displayedColumns,
          selectionGroup: this.selectionGroup
        });
      }
    });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    let state = this.riskService.getCurrentState('individual');
    this.dataSource.data = state.data;
    this.individualMetadata = state.metadata;
    this.individualDataForm.patchValue(state.form, {emitEvent: false});
    this.individualDataForm.patchValue({ timeVariable: state.form.timeVariable }, {emitEvent: true});
    this.displayedColumns = state.dispColumns || this.CORE_COLUMNS.slice();
    this.columnsToDisplay = state.dispColumns || this.displayedColumns;
    this.selectionGroup = state.selectionGroup || this.selectionGroup;
    this.dataFileSelect.inputElement.setAttribute('aria-label','data file');
  }

  handleSubmitData(downloadFlag: boolean) {
    let formData: FormData = new FormData();
    Object.keys(this.individualDataForm.controls).forEach(key => {
      let input = this.individualDataForm.get(key);
      if( key === 'seerCSVDataFile') {
        formData.append(key,input.value,input.value.name);
      } else {
        formData.append(key,input.value);
      }
    });

    let headers = { 'accept': downloadFlag ?
      'text/csv' : 'application/json' }

    let options: IUploadOptions = {
      url: `${environment.apiUrl}/recurrence/individualData`,
      method: 'post',
      formData: formData,
      headers: headers
    };

    this.fileUploadService.upload(options).subscribe( (response) => {
        if(response) {
          this.closeLoadingDialog();
          downloadFlag ? this.saveData(response) : this.displayData(response);
        } else {
          this.individualDataForm.patchValue({email: ''});
          this.dialog.open(IndividualDialogComponent,
           { width: '400px',
             data: { infoOnly: true, message: 'Your calculations were submitted.' }
           });
        }
    }, (err) => {
        this.individualDataForm.patchValue({email: ''});
        this.closeLoadingDialog();
        this.dataSource.data = [];
        this.handleErrorMessage(err);
    });
  }

  onSubmit(downloadFlag: boolean = false) {

    this.individualDataForm.updateValueAndValidity();
    //submit everything
    if(this.individualDataForm.invalid) {
      this.errorMsg = "All form fields except strata and covariates are required."
      return false;

    } else {
      if(this.shouldProvideEmail()) {
        const dialogRef = this.dialog.open(IndividualDialogComponent, {
          width: '400px',
          data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
          if(result) {
            this.individualDataForm.patchValue({email: result });
            this.handleSubmitData(downloadFlag);
          }
        });

      } else {
        this.openLoadingDialog();
        this.handleSubmitData(downloadFlag);
        return true;
      }
    }
  }

  loadSeerFormData() {
    //upload files and get back metadata to fill in form inputs
    let dataFile = this.individualDataForm.get('seerCSVDataFile').value;
    let formData: FormData = new FormData();

    if( dataFile) {
     formData.append('seerCSVDataFile', dataFile, dataFile.name);

     let options: IUploadOptions = {
       url: `${environment.apiUrl}/recurrence/individualMetadata`,
       method: 'post',
       formData: formData
      };

     this.openLoadingDialog();
     this.fileUploadService.upload(options).subscribe(
       (response) => {
         this.closeLoadingDialog();
         let metadata = JSON.parse(response);
         this.individualMetadata = metadata;
         this.selectionGroup = {};
         this.individualDataForm.patchValue({
          strata: '',
          covariates: '',
          timeVariable: '',
          eventVariable: '',
          distribution: '',
          stageVariable: '',
          distantStageValue: '',
          adjustmentFactor: '1',
          yearsOfFollowUp: '2'}, {emitEvent: false});
         this.errorMsg = '';
         this.individualDataForm.markAsUntouched();
       },
       (err) => {
         this.closeLoadingDialog();
         this.individualMetadata = {};
         this.selectionGroup = {};
         this.handleErrorMessage(err);
       });
    }
  }

  displayData(response) {
    this.displayedColumns = this.CORE_COLUMNS.slice();
    var strata = this.individualDataForm.get('strata').value;
    strata && strata.filter(  (val) => val.length > 0)
      .forEach( (val) => this.displayedColumns.unshift(val) );
    this.columnsToDisplay = this.displayedColumns;
    const data = JSON.parse(response);
    this.dataSource.data = data;
    this.showDownloadResults = true;
  }

  saveData(response) {
    const blob = new Blob([response], { type: 'text/csv' });
    FileSaver.saveAs(blob, 'individualData.csv');
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isNumber(value:any) {
    return !isNaN(value);
  }

  unboxNumber(value:any) {
    if( Array.isArray(value) ) {
      return (value.length > 0) ? value[0] : 'NA';
    } else {
      return value;
    }
  }

  valuesForVariable() : any[] {
    let variable = this.individualDataForm.get('stageVariable').value;
  	let values = this.individualMetadata['values'];
  	return values? values[variable] : [];
  }

  handleErrorMessage(response) {
    let errorObj = JSON.parse(response || '{}');
    if(errorObj && errorObj.errors && errorObj.errors.length > 0) {
      let error = errorObj.errors.pop();
      this.errorMsg = error.param ? `${error.msg} for ${error.param}` : `${error.msg || this.defaultErrorMsg}`;
    } else {
      this.errorMsg = this.defaultErrorMsg;
    }
    this.individualDataForm.setErrors({'invalid':true});
  }

  closeLoadingDialog() {
    if(this.loadingDialogRef) {
      this.loadingDialogRef.close();
    }
  }

  openLoadingDialog() {
    this.loadingDialogRef = this.dialog.open(LoadingDialogComponent);
  }

  shouldProvideEmail(): boolean {
    let covariatesVal = this.individualDataForm.get('covariates').value;
    let strataVal = this.individualDataForm.get('strata').value;

    return (covariatesVal && covariatesVal.length > 0)
      || (strataVal && strataVal.length > 2)
  }

  patchValueHelper(chunk:any) {
    this.individualDataForm.patchValue(chunk,{emitEvent: false});
  }

  handleSelectionGroup(event:MatOptionSelectionChange) {
    this.selectionGroup[event.source.value] = event.source.selected;
  }

  isSelectionGroupDisabled(selectedOptionsForInput:any,option:string): boolean {
    let options =  selectedOptionsForInput ? [].concat(selectedOptionsForInput) : [];
    return this.selectionGroup[option] && (options.indexOf(option) < 0);
  }
}

@Component({
  selector: 'individual-dialog',
  templateUrl: 'individual-dialog.component.html',
})
export class IndividualDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IndividualDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
