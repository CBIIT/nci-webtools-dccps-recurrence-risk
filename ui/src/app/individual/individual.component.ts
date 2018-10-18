import { Inject, Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatPaginator,
  MatTableDataSource,
  MatSort ,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA } from '@angular/material';
import { TdFileService, IUploadOptions } from '@covalent/core/file';
import { environment } from '../../environments/environment';
import { RecurrenceRiskService } from '../../shared/services/recurrenceRisk.service';

import * as FileSaver from 'file-saver';

@Component({
  selector: 'rrt-individual',
  templateUrl: './individual.component.html',
  styleUrls: ['./individual.component.scss']
})
export class IndividualComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([{},{},{}]);

  displayedColumns: string[] = [
    'link',
    'cure',
    'lambda',
    'theta',
    'surv_curemodel',
    'surv_notcured',
    'median_surv_notcured',
    's1_numerical',
    'G_numerical',
    'CI_numerical',
    's1_analytical',
    'G_analytical',
    'CI_analytical',
    'se_CI_analytical',
    'obs_surv',
    'obs_dist_surv'];

  columnsToDisplay: string[] = this.displayedColumns.slice();

  individualDataForm: FormGroup;

  distributionList: string[] = ['Log-logistic','Weibull'];

  individualMetadata: any = { variables: []};

  isDataLoading: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  errorMsg: string = "";

  followup: any = {
      max: 2,
      min: 1,
      step: 1,
      interval: 1
    };

  constructor(private fileUploadService: TdFileService,private formBuilder: FormBuilder,
    private riskService: RecurrenceRiskService,private router: Router,private dialog: MatDialog) {
    this.individualDataForm = formBuilder.group({
      seerCSVDataFile: [''],
      strata: [''],
      covariates: [''],
      timeVariable: [''],
      eventVariable: [''],
      distribution: [''],
      stageVariable: [''],
      distantStageValue: [''],
      adjustmentFactor: [''],
      yearsOfFollowUp: ['2'],
      email: ['']
    });

    this.individualDataForm.get('seerCSVDataFile').valueChanges.subscribe( file => {
      if(file) {
        this.loadSeerFormData();
      }
    });

    this.individualDataForm.get('timeVariable').valueChanges.subscribe( (timeVar) => {
      let valuesMap = this.individualMetadata['values'];
      if(valuesMap && valuesMap[timeVar] && valuesMap[timeVar].length > 0 ) {
        this.followup.max = valuesMap[timeVar][valuesMap[timeVar].length-1];
      }

    });

    router.events.subscribe( (event) => {
      if (event instanceof NavigationStart) {
        this.riskService.setCurrentState('individual', {
          data: this.dataSource.data,
          metadata: this.individualMetadata,
          form: this.individualDataForm.value
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
  }

  handleSubmitData(downloadFlag: boolean) {
    let formData: FormData = new FormData();
    Object.keys(this.individualDataForm.controls).forEach(key => {
      formData.append(key,this.individualDataForm.get(key).value);
    });

    let headers = { 'accept': downloadFlag ?
      'text/csv' : 'application/json' }

    let options: IUploadOptions = {
      url: `${environment.apiUrl}/recurrence/individualData`,
      method: 'post',
      formData: formData,
      headers: headers
    };

    this.isDataLoading = true;
    this.fileUploadService.upload(options).subscribe( (response) => {
        this.isDataLoading = false;
        if(response) {
          downloadFlag ? this.saveData(response) : this.displayData(response);
        } else {
          this.dialog.open(IndividualDialogComponent,
           { width: '400px',
             data: { infoOnly: true, message: 'Your calculations were submitted.' }
           });
        }
    }, (err) => {
        this.errorMsg = err;
        this.individualDataForm.setErrors({'invalid':true});
        this.isDataLoading = false;
        this.dataSource.data = [];
    });
  }

  onSubmit(downloadFlag: boolean = false) {

    this.individualDataForm.updateValueAndValidity();
    //submit everything
    if(this.individualDataForm.invalid) {
      this.errorMsg = "All form fields except strata and covariates are required."
      return false;
    } else {
      if(this.individualDataForm.get('covariates').value &&
          this.individualDataForm.get('covariates').value.length > 0) {
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

     this.fileUploadService.upload(options).subscribe(
       (response) => {
         let metadata = JSON.parse(response);
         this.individualMetadata = metadata;
       },
       (err) => {
         this.individualMetadata = {};
         this.errorMsg = "An error occurred with the submitted data, please make sure the form data is correct."
       });
    }
  }

  displayData(response) {
    const data = JSON.parse(response);
    this.dataSource.data = data;
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
  	if(values) {
  		return values[variable];
  	} else {
  		return [];
  	}
  }

  getErrorMessage(): String {
    return this.errorMsg;
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
