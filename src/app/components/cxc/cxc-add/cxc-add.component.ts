import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, Injectable, Output, EventEmitter } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

import { CxcLinkComponent } from '../cxc-link/cxc-link.component';

@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<any> {

  fromModel(date: string): NgbDateStruct {

    let tmp = new Date(parseInt(moment(date).format('YYYY')), parseInt(moment(date).format('MM')), parseInt(moment(date).format('DD')))

    return (date && tmp.getFullYear) ? {year: tmp.getFullYear(), month: tmp.getMonth(), day: tmp.getDate()} : null;
  }

  toModel(date: NgbDateStruct): string {
    // return date ? new Date(date) : null;
    return date ? moment({year: date.year, month: date.month - 1, day:date.day}).format('YYYY-MM-DD') : null;
  }
}

@Component({
  selector: 'app-cxc-add',
  templateUrl: './cxc-add.component.html',
  styles: [],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class CxcAddComponent implements OnInit {

  @ViewChild(CxcLinkComponent) public _link:CxcLinkComponent
  @Input() currentUser:any
  @Output() save = new EventEmitter

  loading:Object = {}
  dateSelected:any
  asesor:any

  searchTerm:Object = {}
  linkLoc:any
  linkId:any
  linkCxcLinkId:any

  form:Object = {}
  formDefault:Object = {
    fecha_cxc: '',
    asesor: '',
    Localizador: '',
    tipo: '',
    status: '',
    comments: ''
  }

  inserted_id:any

  constructor(public _api: ApiService,
                public _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                private route:Router,
                private activatedRoute:ActivatedRoute,
                public toastr: ToastrService) {

  }

  ngOnInit(){}

  nuevo(localizador = ''){
    this.form = JSON.parse(JSON.stringify(this.formDefault))
    this.form['Localizador'] = localizador
    jQuery('#cxcAddModal').modal('show')
  }

  isToday( date ){
    if( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
      return 'bg-success text-light'
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
    this.dateSelected = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
    jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')}`)
    el.close()
  }

  onSelected( event ){
    this.asesor = event.asesor
  }

  validate(){

    let locPatt = /^(([7-9]{1}[0-9]{6})|([1]{1}[0-9]{7}))$/gm

    for( let field in this.form ){
      if( !this.form[field] || this.form[field] == null || this.form[field] == '' ){
        this.toastr.error('Formulario Incompleto -> '+field, 'No Válido')
        return false
      }
    }

    if( !locPatt.test(this.form['Localizador']) ){
      this.toastr.error('Localizador Incorrecto', 'Válido')
      return false
    }

    this.addNew()
    return true
  }

  addNew( ){
    this.loading['new'] = true

    this._api.restfulPut( this.form, `Cxc/new`)
          .subscribe( res => {

            this.loading['new'] = false
            this.inserted_id = res['data']
            jQuery('#cxcAddModal').modal('hide')
            this.save.emit({id: this.inserted_id, loc: this.form['Localizador']})

          }, err => {

            console.log('ERROR', err)

            this.loading['new'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

}
