import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook, readFile, read as readXlsx } from 'xlsx';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';

@Component({
  selector: 'app-ofertas-pdv',
  templateUrl: './ofertas-pdv.component.html',
  styles: []
})
export class OfertasPdvComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  listFlag:boolean = false
  large:boolean = true
  mainCredential:string = 'pdv_ofertasUpload'

  imageForm: FormGroup
  imageFileUp: File
  jsonFile:any
  @ViewChild('imageFile') image_File

  loading:Object = {}
  saving:boolean = false
  vacantesList:any
  listProfiles:any
  selectedVac:any []
  selectVacIndex:Object = {}
  xlsData:any = []

  resetFlag:any
  resetVac:any

  results:any = []
  summary:Object = {}
  timeout:any

  config:EasyTableServiceService
  columns:any = [
    { key: 'Segmento', title: 'Segmento' },
    { key: 'Destination', title: 'Destino' },
    { key: 'Tipo', title: 'Tipo' },
    { key: 'Incentivo', title: 'Incentivo' },
    { key: 'Name', title: 'Nombre' },
    { key: 'priceDiscount', title: 'Descuento' },
    { key: 'bookWinStart', title: 'Booking Inicio' },
    { key: 'bookWinEnd', title: 'Booking Fin' },
    { key: 'travWinStart', title: 'Travel Inicio' },
    { key: 'travWinEnd', title: 'Travel Fin' },
    { key: 'Activo', title: 'Status' },
  ]

  constructor(public _api: ApiService,
      public _init:InitService,
      private titleService: Title,
      private _tokenCheck:TokenCheckService,
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

    this.imageForm = new FormGroup({
      fname:              new FormControl('', [ Validators.required,  ] ),
      dir:                new FormControl('', [ Validators.required,  ] ),
      imageFile:          new FormControl('', [ Validators.required,  ] ),
      ftype:              new FormControl('.xlsx', [ Validators.required,  ] )
    })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.config =  EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true

    this.titleService.setTitle('CyC - Subir Ofertas');
  }

  setImagePath(){
    this.readImg( this.image_File.nativeElement )
  }

  readImg( file ){

    if(file.files && file.files[0]){

      if( file.files[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ){
        console.error('Formato incorrecto')
        this.toastr.error('Formato de archivo incorrecto. Debe ser "xlsx"', 'Error')
        return false
      }

      console.log('Archivo cargado')
      this.imageForm.controls['fname'].setValue('ofertas')
      this.imageForm.controls['dir'].setValue('pdvOfertas')

      this.imageFileUp = file.files[0]

    }else{
      console.error('No existe ninguna imagen cargada')
    }
  }

  submit(){
    let Image = this.image_File.nativeElement

    if( Image.files && Image.files[0] ){
      this.imageFileUp = Image.files[0]
    }else{
      this.toastr.error('No se ha cargado ningun archivo correcto', 'ERROR')
      return true
    }

    let ImageFile: File = this.imageFileUp

    let formData: FormData = new FormData()
    formData.append( 'fname', this.imageForm.controls['fname'].value)
    formData.append( 'dir',   this.imageForm.controls['dir'].value)
    formData.append( 'ftype', this.imageForm.controls['ftype'].value)
    formData.append( 'image', ImageFile, ImageFile.name)

    this.loading['building'] = true
    this.loading['upload'] = true
    this._api.restfulImgPost( formData, 'UploadImage/uploadImage' )
            .subscribe( res => {
                this.loading['upload'] = false
                this.buildForms()

            }, err => {
                this.loading['upload'] = false
                this.loading['building'] = false
                console.log('ERROR', err)
                this.toastr.error( err, 'Error' )
              })

  }

  buildForms(){
    clearTimeout(this.timeout)
    let url = `img/${this.imageForm.controls['dir'].value}`
    let file = `${this.imageForm.controls['fname'].value + this.imageForm.controls['ftype'].value}`
    let test = false
    // let url = 'assets/formats'
    // let file = 'ofertasPdv.xlsx'
    // let test = true

    this._api.getFile( file, url, test )
        .subscribe( f => {
          let data = new Uint8Array(f);
          let workbook = readXlsx(data, {type:'array'});
          let sheetName = workbook.SheetNames[0]
          let xlsData = utils.sheet_to_json( workbook.Sheets[sheetName] )
          this.resetFlag = new Date()
          this.resetVac = new Date()

          for( let item of xlsData ){
            item['incentivo_cc'] = 0
            item['incentivo_pdv'] = 0
            item['incentivo_descr'] = null
            // tslint:disable-next-line:forin
            for( let field in item ){
              switch(field){
                case 'bookWinStart':
                case 'bookWinEnd':
                case 'travWinStart':
                case 'travWinEnd':
                  item[field] = this.xlsToMoment(item[field])
                  break
                case 'priceDiscount':
                  item[field] = parseFloat(item[field]) > 0 && parseFloat(item[field]) <= 1 ? `${(parseFloat(item[field])*100).toFixed(0)}%` : item[field]
                  break
              }
            }
          }

          this.xlsData = xlsData

          this.loading['building'] = false
          }, er => {
            this.loading['building'] = false
            console.log('ERROR', er)
            this.toastr.error( er, 'Error' )
        })
  }

  dwlFormat(){
    jQuery('#dwlFrame').attr( 'src', 'assets/formats/ofertasPdv.xlsx')
  }

  xlsToMoment(date) {
    return moment(Math.round((date - 25569)*86400*1000)).add(1, 'days').format('YYYY-MM-DD')
  }

  changeIncentivo( field, row ){
    if( this._init.checkSingleCredential('pdv_ofertasUpload') ){
      let val = parseInt(row[field]) == 1 ? 0 : 1
      // let val = 3
      this.changeInc( field, row, val, true )
    }
  }

  changeInc( field, row, val, inc = false ){
    row[field] = inc ? val : (val.checked ? 1 : 0)
  }

  save(){
    this.loading['save'] = true

    this._api.restfulPut( this.xlsData, 'Lists/ofertas' )
            .subscribe( res => {

              this.loading['save'] = false
              this.toastr.success( 'Información guardado', 'Guardado' )
              this.xlsData = []

              console.log(res)
            }, err => {
              console.log('ERROR', err)

              this.loading['save'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  deleteRow( row ){
    console.log(row)
    let index = this.xlsData.indexOf(row)
    console.log(index)
    console.log(this.xlsData.length)
    this.xlsData.splice(index,1)
    console.log(this.xlsData.length)
  }

  printDate(date, format){
    return moment(date).format(format)
  }

}
