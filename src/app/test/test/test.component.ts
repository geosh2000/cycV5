import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var jQuery:any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styles: []
})
export class TestComponent implements AfterViewInit {


  constructor() {

  }

  ngAfterViewInit() {
  }

  test(){
    jQuery("#myTable").tablesorter({
      widgets: ['filter', 'zebra'],
      widgetOptions : {
        //Filters
        filter_childRows: false,
        filter_columnFilters: true,
        filter_cssFilter: "tablesorter-filter",
        filter_functions: null,
        filter_hideFilters: false,
        filter_ignoreCase: true,
        filter_reset: null,
        filter_searchDelay: 300,
        filter_startsWith: false,
        filter_useParsedData: false
      }
    });
  }



}
