import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, Injectable } from '@angular/core';
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
import { CxcAddComponent } from '../cxc-add/cxc-add.component';
import { UploadImageComponent } from '../../formularios/upload-image.component';
import { CxcCommentComponent } from '../cxc-comment/cxc-comment.component';
import { CxcAprobeComponent } from '../cxc-aprobe/cxc-aprobe.component';
import { CxcSendRhComponent } from '../cxc-send-rh/cxc-send-rh.component';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

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
  selector: 'app-cxc-registro',
  templateUrl: './cxc-registro.component.html',
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
export class CxcRegistroComponent implements OnInit {

  @ViewChild(CxcLinkComponent) public _link:CxcLinkComponent
  @ViewChild(CxcAddComponent) public _add:CxcAddComponent
  @ViewChild(CxcCommentComponent) public _comment:CxcCommentComponent
  @ViewChild(CxcAprobeComponent) public _aprobe:CxcAprobeComponent
  @ViewChild( CxcSendRhComponent ) public _send:CxcSendRhComponent
  @ViewChild( UploadImageComponent ) public _image:UploadImageComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'cxc_read'

  searchType:any = 'Fecha'
  moreInfo:boolean = false
  onlyReg:boolean = false
  noTx:boolean = false
  resumed:boolean = false

  loading:Object = {
    linkcxc: {},
    save: {}
  }

  data:any = []
  dataLink:any = []

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct
  dateSelected:any

  documentImage:any
  imageTitle:any

  searchTerm:Object = {}
  linkLoc:any
  linkId:any
  linkCxcLinkId:any

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
      if( params.id ){
        // this.selected['id']     = params.id
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Registro CXC');
  }

  getCxc( onlyReg = this.onlyReg, noTx = this.noTx, resumed = this.resumed ){

    this.onlyReg = onlyReg
    this.noTx = noTx
    this.resumed = resumed

    this.loading['cxc'] = true

    let params = {
      type: this.searchType,
      onlyReg: onlyReg,
      noTx: noTx,
      resumed: resumed,
      search: {
        [this.searchType]: this.searchTerm[this.searchType]
      }
    }


  this._api.restfulPut( params, `Cxc/search`)
          .subscribe( res => {

            this.loading['cxc'] = false
            this.data = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['cxc'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
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
      this.searchTerm['Fecha'] = { inicio: this.inicio, fin: this.fin }
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

  onSelected( event ){
    this.searchTerm['asesor'] = event.asesor
  }

  getLinkable( loc, id, link ){
    this._link.open( loc, id, link )
  }

  linked( event ){
    if( event.status ){
      this.getCxc()
    }
  }

  linkInserted( data ){
    this._link.open( data['loc'], data['id'], null, 1  )
  }

  addCxC( loc ){
    this._link.closeModal( false )
    this._add.nuevo( loc )
  }

  viewCxc( load = true, id ){
    console.log(this._image)
    if(load){
      this._image.build(`Subir Documento de CXC: ${id}`, 'cxc', id)
    }else{
      let d = new Date()
      this.documentImage=`${Globals.APISERV}/img/cxc/${id}.jpg?${d.getTime()}`
      this.imageTitle = id
      jQuery('#showDocument').modal('show')
    }
  }

  upldCheck( event ){
    if(event.ERR){
      this.toastr.error( event.msg, 'Error!')
    }else{
      this.toastr.success( event.msg, 'Success!')
      this.getCxc()
    }
  }

  deleteImage(){
    this.loading['delete'] = true

    this._api.restfulDelete( `cxc/${this.imageTitle}/jpg`, 'UploadImage/imageDel' )
            .subscribe( res => {
              if(res['ERR']){
                this.toastr.error( res['msg'], 'Error!')
              }else{
                this.toastr.success( res['msg'], 'Borrado')
                jQuery('#showDocument').modal('hide')
                this.getCxc()
              }
              this.loading['delete'] = false
            })
  }

  updateImg(event){
    let d = new Date()
    if(this.imageTitle != null){
      this.documentImage=`${Globals.APISERV}/img/asesores/${this.imageTitle}.jpg?${d.getTime()}`
    }
  }

  commentSave( event ){
    if( event.status ){
      this.updateRegs( 'cxcIdLink', event.id, 'comments', event.comment )
      this.toastr.success('Comentarios Guardados', 'Guardado')
      jQuery('#commentModal').modal('hide')
    }
  }

  updateRegs( compare, compareVal, field, val ){
    for( let item of this.data ){
      if( item[compare] == compareVal ){
        item[field] = val
      }
    }
  }

  editCxc( field, val, id, flag = false, run = true, quincenas? ){

    if( !run ){
      return false
    }

    let params = {
      where: {
        id: id
      },
      set: {
        [field]: val
      }
    }

    if( val == 1 ){
      if( !flag ){
        this._send.build( id )
        return true
      }else{
        params['set']['quincenas'] = quincenas
      }
    }else{
      flag = true
    }

    if( flag ){
      this.loading['save'][id] = true

      this._api.restfulPut( params, `Cxc/editReg`)
            .subscribe( res => {

              this.loading['save'][id] = false
              this.updateRegs( 'cxcIdLink', id, field, val )
              if( val == 1 && field == 'status'){
                this.updateRegs( 'cxcIdLink', id, 'NQ', quincenas )
              }
              this.toastr.success(`${field} guardado`, 'Guardado')

            }, err => {

              console.log('ERROR', err)

              this.loading['save'][id] = false

              let error = err.json()
              this.toastr.error( error.msg, err.statusText )
              console.error(err.statusText, error.msg)

            })
    }
  }

  aprobe( item ){
    this._aprobe.build( item )
  }

  saveAprobe( event ){
    if( event.status ){
      this.updateRegs( 'cxcIdLink', event.id, 'status', 2 )
      this.toastr.success('Cxc Aplicado', 'Guardado')
    }
  }

}
