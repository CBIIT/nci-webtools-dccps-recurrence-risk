import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog} from '@angular/material';
import { TdFileService, TdFileInputComponent, IUploadOptions } from '@covalent/core/file';
import { environment } from '../../environments/environment';
import { RecurrenceRiskService } from '../../shared/services/recurrenceRisk.service';
import { LoadingDialogComponent } from '../../shared/dialogs/loading-dialog.component';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'rrt-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

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
    'obs_dist_surv'];

  displayedColumns: string[] = [];

  columnsToDisplay: string[] = [];

  groupDataForm: FormGroup;

  showDownloadResults: boolean;

  followup: any = {
    max: 30,
    min: 1,
    step: 1,
    interval: 1
  };

  groupMetadata: any = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('dicFileInput') dicFileSelect: TdFileInputComponent;

  @ViewChild('dataFileInput') dataFileSelect: TdFileInputComponent;

  @ViewChild('canSurvFileInput') csvFileSelect: TdFileInputComponent;

  errorMsg: string = "";

  defaultErrorMsg: string = "An unexpected error occured. Please ensure the input file(s) is in the correct"
      + "format and/or correct parameters were chosen.";

  constructor(private fileUploadService: TdFileService,private formBuilder: FormBuilder,
    private riskService: RecurrenceRiskService,private router: Router,private dialog: MatDialog) {
    this.groupDataForm = formBuilder.group({
      seerDictionaryFile: new FormControl(''),
      seerDataFile: new FormControl(''),
      canSurvDataFile: new FormControl(''),
      stageVariable: new FormControl(''),
      stageValue: new FormControl(''),
      adjustmentFactor: new FormControl(''),
      yearsOfFollowUp: new FormControl('25')
    });

    this.groupDataForm.get('seerDictionaryFile').valueChanges.subscribe( file => {
      this.handleSeerDictionaryFileChange(file);
    });

    this.groupDataForm.get('seerDataFile').valueChanges.subscribe( file => {
      this.handleSeerDataFileChange(file);
    });

    this.groupDataForm.get('stageVariable').valueChanges.subscribe( (stageVar) => {
      this.groupDataForm.patchValue({stageValue: ''}, {emitEvent: false});
      this.errorMsg = '';
    });

	  router.events.subscribe( (event) => {
      if (event instanceof NavigationStart) {
        this.riskService.setCurrentState('group', {
          data: this.dataSource.data,
          metadata: this.groupMetadata,
          form: this.groupDataForm.value,
          dispColumns: this.displayedColumns
        });
	  	}
	  });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
	  let state = this.riskService.getCurrentState('group');
	  this.dataSource.data = state.data;
	  this.groupMetadata = state.metadata;
	  this.groupDataForm.patchValue(state.form, {emitEvent: false});
	  this.displayedColumns = state.dispColumns || this.CORE_COLUMNS.slice();
	  this.columnsToDisplay = state.dispColumns || this.displayedColumns;
	  this.dicFileSelect.inputElement.setAttribute('aria-label','dic file');
    this.dataFileSelect.inputElement.setAttribute('aria-label','data file');
    this.csvFileSelect.inputElement.setAttribute('aria-label','csv file');
  }

  handleSeerDictionaryFileChange(file: File) {
    if(file) {
      this.loadSeerFormData();
    }
  }

  handleSeerDataFileChange(file: File) {
    if(file) {
      this.loadSeerFormData();
    }
  }

  handleSubmitData(downloadFlag: boolean) {
    let formData: FormData = new FormData();
    Object.keys(this.groupDataForm.controls).forEach(key => {
      formData.append(key,this.groupDataForm.get(key).value);
    });

    let headers = { 'accept': downloadFlag ?
      'text/csv' : 'application/json' }

    let options: IUploadOptions = {
      url: `${environment.apiUrl}/recurrence/groupData`,
      method: 'post',
      formData: formData,
      headers: headers
    };

    let dialogRef = this.dialog.open(LoadingDialogComponent);

    this.fileUploadService.upload(options).subscribe(
      (response) => {
        dialogRef.close();
        downloadFlag ? this.saveData(response) : this.displayData(response);
      },
      (err) => {
        dialogRef.close();
        this.dataSource.data = [];
        this.handleErrorMessage(err);
    });
  }

  onSubmit(downloadFlag: boolean = false) {
    this.groupDataForm.updateValueAndValidity();
    //submit everything
    if(this.groupDataForm.invalid) {
      this.errorMsg = "All form fields are required."
      return false;
    } else {
      this.handleSubmitData(downloadFlag);
      return true;
    }
  }

  loadSeerFormData() {
    //upload files and get back metadata to fill in form inputs
    let dicFile = this.groupDataForm.get('seerDictionaryFile').value;
    console.log(dicFile);
    let dataFile = this.groupDataForm.get('seerDataFile').value;
    let formData: FormData = new FormData();

    if( dicFile && dataFile) {
      formData.append('seerDictionaryFile', dicFile, dicFile.name);
      formData.append('seerDataFile', dataFile, dataFile.name);

      let options: IUploadOptions = {
        url: `${environment.apiUrl}/recurrence/groupMetadata`,
        method: 'post',
        formData: formData
       };

      let dialogRef = this.dialog.open(LoadingDialogComponent);
    
      this.fileUploadService.upload(options).subscribe(
        (response) => {
          dialogRef.close();
          let metadata = JSON.parse(response);
          this.groupMetadata = metadata;
          this.followup.max = this.groupMetadata.maxFollowUp[0];
          this.errorMsg = '';
          this.groupDataForm.patchValue(
            { stageVariable: '',
              stageValue: '',
              adjustmentFactor: '1',
              yearsOfFollowUp: Math.min(this.followup.max, 25)
            }, {emitEvent: false} );
          this.groupDataForm.markAsUntouched();
        },
        (err) => {
          dialogRef.close();
          this.groupMetadata = {};
          this.dataSource.data = [];
          this.followup.max = 30;
          this.handleErrorMessage(err);
        });
     }
  }

  displayData(response) {
    this.displayedColumns = this.CORE_COLUMNS.slice();
    this.groupMetadata.variables
      .filter( (val) => val.toLowerCase().indexOf('page_type') < 0 )
      .forEach( (val) => this.displayedColumns.unshift(val) );
    this.columnsToDisplay = this.displayedColumns;
    const data = JSON.parse(response);
    this.dataSource.data = data;
    this.showDownloadResults = true;
  }

  saveData(response) {
    const blob = new Blob([response], { type: 'text/csv' });
    FileSaver.saveAs(blob, 'groupData.csv');
  }

  handleErrorMessage(response) {
    let errorObj = JSON.parse(response || '{}');
    if(errorObj && errorObj.errors && errorObj.errors.length > 0) {
      let error = errorObj.errors.pop();
      this.errorMsg = error.param ? `${error.msg} for ${error.param}` : `${error.msg || this.defaultErrorMsg}`;
    } else {
      this.errorMsg = this.defaultErrorMsg;
    }
    this.groupDataForm.setErrors({'invalid':true});
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  valuesForVariable() : any[] {
    let variable = this.groupDataForm.get('stageVariable').value;
  	let values = this.groupMetadata['values'];
  	return values ? values[variable] : [];
  }

  patchValueHelper(chunk:any) {
    this.groupDataForm.patchValue(chunk,{emitEvent: false});
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
}
