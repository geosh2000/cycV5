import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-survey-report',
  templateUrl: './survey-report.component.html',
  styles: [`
            .custom-day {
              text-align: center;
              padding: 0.185rem 0.25rem;
              display: inline-block;
              height: 2rem;
              width: 2rem;
            }
            .custom-day.focused {
              background-color: #e6e6e6;
            }
            .custom-day.range, .custom-day:hover {
              background-color: rgb(2, 117, 216);
              color: white;
            }
            .custom-day.faded {
              background-color: rgba(2, 117, 216, 0.5);
            }
  `],
})
export class SurveyReportComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  loading:Object = {}
  surveyId:any

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')
  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct

  surveyData:Object = {}
  reportData:any = []

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
        this.surveyId = params.surveyId
        this.getSurveyData()
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Reportes Formularios');
    jQuery('#picker').val(`${moment(this.inicio).format('DD/MM')} a ${moment(this.fin).format('DD/MM')}`)
  }

  isToday( date ){
    if( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
      return 'bg-success text-light'
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
    } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals(date, this.fromDate))) {
      this.toDate = date
      this.fin = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).format('DD/MM')} a ${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')}`)
      el.close()
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
      this.fin = null
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  download( id ){
    let title ='Reporte'

    if( this.surveyData['master'] ){
      title = `${this.surveyData['master']['name']}_${this.inicio}a${this.fin}`
    }
    this.toXls( id, title )
  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

  getSurveyData(){
    this.loading['survey'] = true

    this.surveyData = {
      'master': null,
      'fields': [],
      'opts': [],
    }

    this._api.restfulGet( this.surveyId, `Survey/survey`)
          .subscribe( res => {

            this.loading['survey'] = false

            this.surveyData = res['data']
            this.titleService.setTitle('CyC - ' + this.surveyData['master']['name'] + ' (Reporte)');
            this.showContents = this._init.checkCredential( this.surveyData['master']['reportKey'] ? this.surveyData['master']['reportKey'] : 'default', true )

          }, err => {

            console.log('ERROR', err)

            this.loading['survey'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.surveyId}/${this.inicio}/${this.fin}`, `Survey/results`)
          .subscribe( res => {

            this.loading['data'] = false

            this.reportData = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['data'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

}
