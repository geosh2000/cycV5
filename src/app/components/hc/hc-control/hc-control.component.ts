import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { AddVacanteComponent } from '../../formularios/add-vacante.component';
import { TableTemplateComponent } from '../../../shared/table-template/table-template.component';

@Component({
  selector: 'app-hc-control',
  templateUrl: './hc-control.component.html',
  styleUrls: ['./hc-control.component.scss']
})
export class HcControlComponent implements OnInit {

  @ViewChild( AddVacanteComponent ) _add:AddVacanteComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  loading:Object = {}
  data:any = []

  constructor(public _api: ApiService,
    public _init:InitService,
    private titleService: Title,
    private _tokenCheck:TokenCheckService,
    private route:Router,
    private activatedRoute:ActivatedRoute,
    public toastr: ToastrService) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {
          if( res['status'] ){
          this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
          this.showContents = false
          jQuery('#loginModal').modal('show');
          }
        })

    this.activatedRoute.params.subscribe( params => {
      if( params ){
        // this.surveyId = params.surveyId
        // this.getSurveyData()
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - HeadCount');
    this.getData()
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( '', `Headcount/hcVacantes`)
          .subscribe( res => {

            this.loading['data'] = false
            this.data = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['data'] = false

            let error = err.error
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

  showAddVacante( ){
    this._add.buildForm()
  }

  showMopers( event ){

    this.toastr.success(`Mopers guardados con ids: ${JSON.stringify(event['mopers'])}`,'Guardado')
  }

  downloadCSV( title ){
    this.loading['dwl'] = true

    this._api.restfulGet( '', `Headcount/hcDownload` )
              .subscribe( res => {
                this.loading['dwl'] = false
                this.toXls( {Headcount: res['data']}, 'Headcount' )

              }, err => {

                console.log('ERROR', err)

                this.loading['dwl'] = false

                let error = err.error
                this.toastr.error( error.msg, err.statusText )
                console.error(err.statusText, error.msg)

              })
  }

  toXls( sheets, title ){

    let wb: WorkBook = { SheetNames: [], Sheets: {} };

    // tslint:disable-next-line:forin
    for(let ttl in sheets){
      wb.SheetNames.push(ttl);
      wb.Sheets[ttl] = utils.json_to_sheet(sheets[ttl], {cellDates: true});
    }

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

}
