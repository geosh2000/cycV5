import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;


import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-pya',
  templateUrl: './pya.component.html',
  styles: []
})
export class PyaComponent implements OnInit {

  ready:boolean = false
  loading:boolean = false
  showContents:boolean = false
  mainCredential:string = 'monitor_gtr'

  sw:any = {status: false, title: 'Mostrar Todo'}
  totalSwitch:any = {"status": false}
  horas:any = [
  	{
  		"status": false, "class" : "0", "Hora_group" : 0
  	},
  	{
  		"status": false, "class" : "0_5", "Hora_group" : 0.5
  	},
  	{
  		"status": false, "class" : "1", "Hora_group" : 1
  	},
  	{
  		"status": false, "class" : "1_5", "Hora_group" : 1.5
  	},
  	{
  		"status": false, "class" : 2, "Hora_group" : 2
  	},
  	{
  		"status": false, "class" : "2_5", "Hora_group" : 2.5
  	},
  	{
  		"status": false, "class" : 3, "Hora_group" : 3
  	},
  	{
  		"status": false, "class" : "3_5", "Hora_group" : 3.5
  	},
  	{
  		"status": false, "class" : 4, "Hora_group" : 4
  	},
  	{
  		"status": false, "class" : "4_5", "Hora_group" : 4.5
  	},
  	{
  		"status": false, "class" : 5, "Hora_group" : 5
  	},
  	{
  		"status": false, "class" : "5_5", "Hora_group" : 5.5
  	},
  	{
  		"status": false, "class" : 6, "Hora_group" : 6
  	},
  	{
  		"status": false, "class" : "6_5", "Hora_group" : 6.5
  	},
  	{
  		"status": false, "class" : 7, "Hora_group" : 7
  	},
  	{
  		"status": false, "class" : "7_5", "Hora_group" : 7.5
  	},
  	{
  		"status": false, "class" : 8, "Hora_group" : 8
  	},
  	{
  		"status": false, "class" : "8_5", "Hora_group" : 8.5
  	},
  	{
  		"status": false, "class" : 9, "Hora_group" : 9
  	},
  	{
  		"status": false, "class" : "9_5", "Hora_group" : 9.5
  	},
  	{
  		"status": false, "class" : 10, "Hora_group" : 10
  	},
  	{
  		"status": false, "class" : "10_5", "Hora_group" : 10.5
  	},
  	{
  		"status": false, "class" : 11, "Hora_group" : 11
  	},
  	{
  		"status": false, "class" : "11_5", "Hora_group" : 11.5
  	},
  	{
  		"status": false, "class" : 12, "Hora_group" : 12
  	},
  	{
  		"status": false, "class" : "12_5", "Hora_group" : 12.5
  	},
  	{
  		"status": false, "class" : 13, "Hora_group" : 13
  	},
  	{
  		"status": false, "class" : "13_5", "Hora_group" : 13.5
  	},
  	{
  		"status": false, "class" : 14, "Hora_group" : 14
  	},
  	{
  		"status": false, "class" : "14_5", "Hora_group" : 14.5
  	},
  	{
  		"status": false, "class" : 15, "Hora_group" : 15
  	},
  	{
  		"status": false, "class" : "15_5", "Hora_group" : 15.5
  	},
  	{
  		"status": false, "class" : 16, "Hora_group" : 16
  	},
  	{
  		"status": false, "class" : "16_5", "Hora_group" : 16.5
  	},
  	{
  		"status": false, "class" : 17, "Hora_group" : 17
  	},
  	{
  		"status": false, "class" : "17_5", "Hora_group" : 17.5
  	},
  	{
  		"status": false, "class" : 18, "Hora_group" : 18
  	},
  	{
  		"status": false, "class" : "18_5", "Hora_group" : 18.5
  	},
  	{
  		"status": false, "class" : 19, "Hora_group" : 19
  	},
  	{
  		"status": false, "class" : "19_5", "Hora_group" : 19.5
  	},
  	{
  		"status": false, "class" : 20, "Hora_group" : 20
  	},
  	{
  		"status": false, "class" : "20_5", "Hora_group" : 20.5
  	},
  	{
  		"status": false, "class" : 21, "Hora_group" : 21
  	},
  	{
  		"status": false, "class" : "21_5", "Hora_group" : 21.5
  	},
  	{
  		"status": false, "class" : 22, "Hora_group" : 22
  	},
  	{
  		"status": false, "class" : "22_5", "Hora_group" : 22.5
  	},
  	{
  		"status": false, "class" : 23, "Hora_group" : 23
  	},
  	{
  		"status": false, "class" : "23_5", "Hora_group" : 23.5
  	}
  ]

  data:any

  constructor(private _api:ApiService,
                      private _init:InitService,
                      private _route:Router) {

      this.getHorarios('2017-09-26')
  }

  ngOnInit() {
  }

  getHorarios( fecha ){
    this.loading = true
    this._api.restfulGet(fecha, 'Horarios/horarios')
      .subscribe( res => {
        if(res['status']){
          this.data = res['data']
          this.ready = true
          this.loading = false
          console.log(res)
        }else{
          console.error( res )
        }
      })
  }

  chgAllStatus(){

    let status = !this.totalSwitch.status

    this.totalSwitch.status = status

    for(let item in this.data){
      this.data[item].status = status
    }

  }

  chgSwitch(){

    let status = !this.sw.status

    this.sw.status = status

    switch(status){
      case true:
        this.sw.title = "Mostrar Entradas"
        break;
      case false:
        this.sw.title = "Mostrar Todo"
        break;
    }

  }

}
