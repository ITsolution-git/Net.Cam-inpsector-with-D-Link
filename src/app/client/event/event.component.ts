import { Component, Optional } from '@angular/core';

// NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective 
import { NgTableComponent } from 'ng2-table/ng2-table';

import { NetcamService } from '../../services/netcam.service';
import * as Global from '../../global';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'event-component',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./event.component.css'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './event.component.html'
})
export class EventComponent {
  // Set our default values
  numDisplay: number = 250;
  //displayEnum = [25,50,100,250,500];

  CriticalityValue: any;
  Criticality = [
    { value: '0', status: 'Debug' },
    { value: '1', status: 'Information' },
    { value: '2', status: 'Warning' },
    { value: '3', status: 'Error' },
    { value: '4', status: 'Critical' }
  ];

  public rows:Array<any> = [];
  public columns:Array<any> = [
    {title: 'Criticality', name: 'Icon', sort: false},
    {title: 'TimeStamp', name: 'TimeStampStr', sort: false},
    {title: 'Source', name: 'Source', sort: false},
    {title: 'Description', name: 'Description', sort: false},
  ];

  public page:number = 1;
  public itemsPerPage:number = 10;
  public maxSize:number = 5;
  public numPages:number = 1;
  public length:number = 0;

  public config:any = {
    paging: true,
    sorting: {columns: this.columns},
    filtering: {filterString: ''},
    className: ['table-striped', 'table-bordered']
  };

  private tableData:Array<any>;
  
  // TypeScript public modifiers
  constructor(private netcamService: NetcamService) {

  }

  ngOnInit() {
    this.RefreshEventLog(this.numDisplay, 0);
  }
  ngAfterViewInit() {
    //this.DispValue = this.Display[0].value;
    this.CriticalityValue = this.Criticality[0].value;
  }
  ngOnDestroy() {
    // unsubscribe here
  }

  onUpdate() {
    this.RefreshEventLog(this.numDisplay, this.CriticalityValue * 1);
  }
  
  public onChangeTable(config:any, page:any = {page: this.page, itemsPerPage: this.itemsPerPage}):any {
    this.rows = this.tableData;
    this.length = this.tableData.length;
  }

  RefreshEventLog(numRecords: number, minCrit: number) {
    // for the list of cameras
    this.netcamService.GetEventLogs(numRecords, minCrit)
      .then(data => {
        if (Global.consoleDebug) { console.log('[EVENT] GetEventLogs') }

        if (this.netcamService.eventLogs != undefined) {

          this.tableData = this.netcamService.eventLogs;

          this.tableData.forEach((value, key) => {     
            var critStr = 'debug';
            if (this.tableData[key].Criticality == 1) critStr = 'info';
            if (this.tableData[key].Criticality == 2) critStr = 'warning';
            if (this.tableData[key].Criticality == 3) critStr = 'error';
            if (this.tableData[key].Criticality == 4) critStr = 'critical';
            
            this.tableData[key].Icon = '<i class="material-icons bullet-' + critStr + '">lens</i>';
            this.tableData[key].TimeStampStr = this.netcamService.FormatDate(this.tableData[key].TimeStamp);            
          });

          this.onChangeTable(this.config);        
        }

      }, err => {
        if (Global.consoleDebug) { console.log('[EVENT] GetEventLogs Error: ' + err) }
      });    
  }

}
