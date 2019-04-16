import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook, readFile, read as readXlsx } from 'xlsx';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as Globals from '../../../globals';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-smd-upload',
  templateUrl: './smd-upload.component.html',
  styles: []
})
export class SmdUploadComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'upload_info'

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
  xlsAttr:any = []
  uploadType:any = 'regs'

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

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Upload SMD Records');
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
      this.imageForm.controls['fname'].setValue('smd')
      this.imageForm.controls['dir'].setValue('smd')

      this.imageFileUp = file.files[0]

    }else{
      console.error('No existe ninguna imagen cargada')
    }
  }

  uploadXls(){
    let Image = this.image_File.nativeElement
    let type = this.uploadType

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
                this.buildForms(type)

            }, err => {
                this.loading['upload'] = false
                this.loading['building'] = false
                console.log('ERROR', err)
                this.toastr.error( err, 'Error' )
              })

  }

  buildForms( type ){

    let url = Globals.PRODENV == 1 ? `img/${this.imageForm.controls['dir'].value}` : `assets`
    let file = Globals.PRODENV == 1 ? `${this.imageForm.controls['fname'].value + this.imageForm.controls['ftype'].value}` : 'smd.xlsx'
    let test = Globals.PRODENV == 1 ? false : true
    let dt = {}

    this._api.getFile( file, url, test )
        .subscribe( f => {
          let data = new Uint8Array(f);
          let workbook = readXlsx(data, {type:'array'});
          let sheetName = workbook.SheetNames[0]
          let jsonFile = utils.sheet_to_json( workbook.Sheets[sheetName], {raw: true, defval:null} )

          switch( type ){
            case 'regs':
              if( !jsonFile[0]['Evaluador'] ){
                this.toastr.error('ERROR!', 'Los campos del archivo cargado no corresponden al tipo de registro seleccionado')
                this.loading['building'] = false
                return
              }
              break
            case 'users':
              if( !jsonFile[0]['Job'] ){
                this.toastr.error('ERROR!', 'Los campos del archivo cargado no corresponden al tipo de registro seleccionado')
                this.loading['building'] = false
                return
              }
              break
          }

          let result = this.buildTx(jsonFile, type)

          switch( type ){
            case 'regs':
              dt = {
                'main': result['evaluaciones'],
                'attr': result['atributos']
              }
              break
            case 'users':
              dt = {
                'usr': result
              }
              break
          }

          this.uploadData(dt, type)

          }, er => {
            this.loading['building'] = false
            console.log('ERROR', er)
            this.toastr.error( er, 'Error' )
        })
  }

  buildTx( arr, type ){

    let result
    switch(type){
      case 'regs':
        result = this.buildRegs(arr)
        break
      case 'users':
        result = this.buildUsers(arr)
        break
    }

    return result

  }

  buildUsers( arr ){
    let usr:any = []

    for(let e of arr){
      let v:any=[]

      // tslint:disable-next-line:forin
      for( let c in e ){
        v.push(e[c])
      }

      let row:Object = {
        id: `HEX('${v[0]}')`,
        smdId: v[0],
        username: v[3].substring(0,v[3].indexOf('@')-1),
        Nombre: v[1],
        Apellido: v[2],
        job: v[7],
        role: v[9],
      }

      usr.push(row)

    }

    return usr
  }

  buildRegs( arr ){
    let attr:any=[]
    let evs:any=[]

    for(let e of arr){
      let id, i = 0, x=0;
      let tmpR
      let v:any=[]
      // tslint:disable-next-line:forin
      for( let c in e ){

        if( i == 0 ){
          id = e[c]
        }

        if( i > 41 ){
          if( x == 0 ){
            tmpR = {
              txMainId: id,
              atributo: c,
              val: e[c] == null ? null : e[c].toLowerCase() == 'si' ? 1 : 0
            }
          }else{
            switch(x){
              case 1:
                tmpR['comentarios'] = e[c] == null ? null : e[c] == '-' ? null : e[c]
                break
              case 2:
                tmpR['subatributos'] = e[c] == null ? null : e[c] == '~' ? null : e[c]
                break
            }
          }
          x++
          if( x > 2 ){
            attr.push(tmpR)
            x = 0
          }
        }else{
          v.push(e[c])
        }

        i++
      }

      let row:Object = {
        id: v[0],
        asesor: `HEX('${v[1]}')`,
        evaluador: v[4],
        Programa: v[5],
        Etiqueta: v[6],
        dtTx: this.xlsToMoment(v[7], 'YYYY-MM-DD HH:mm:ss'),
        dtEval: this.xlsToMoment(v[8], 'YYYY-MM-DD HH:mm:ss'),
        dtUpload: this.xlsToMoment(v[9], 'YYYY-MM-DD HH:mm:ss'),
        dtUpdate: this.xlsToMoment(v[10], 'YYYY-MM-DD HH:mm:ss'),
        tiempoMonitoreo: v[11],
        general: v[12] == 'N/A' ? null : (v[12] == 'Pasó' ? 1 : 0),
        ecufPass: v[13] == 'N/A' ? null : (v[13] == 'Pasó' ? 1 : 0),
        ecnPass: v[14] == 'N/A' ? null : (v[14] == 'Pasó' ? 1 : 0),
        eccPass: v[15] == 'N/A' ? null : (v[15] == 'Pasó' ? 1 : 0),
        encPts: v[16] == 'N/A' ? null : parseFloat(v[16].substring(0,v[16].length-1))/100,
        ecufPrec: v[21] == 'N/A' ? null : parseFloat(v[21].substring(0,v[21].length-1))/100,
        ecnPrec: v[22] == 'N/A' ? null : parseFloat(v[22].substring(0,v[22].length-1))/100,
        eccPrec: v[23] == 'N/A' ? null : parseFloat(v[23].substring(0,v[23].length-1))/100,
        ecufControl: v[24] == 'N/A' ? null : parseFloat(v[24].substring(0,v[24].length-1))/100,
        ecnControl: v[25] == 'N/A' ? null : parseFloat(v[25].substring(0,v[25].length-1))/100,
        eccControl: v[26] == 'N/A' ? null : parseFloat(v[26].substring(0,v[26].length-1))/100,
        comentariosTx: v[27],
        dtDevolucion: this.xlsToMoment(v[32], 'YYYY-MM-DD HH:mm:ss'),
        comentariosDevolucion: v[33],
        fortalezas: v[34],
        oportunidades: v[35],
        campaign: v[41] == '-' ? null : v[41],
      }

      evs.push(row)

    }

    return {atributos: attr, evaluaciones: evs}
  }

  testToastr( flag ){
    if(flag){
      console.log('success, show toastr')
      this.toastr.success('SUCCESS', 'Show Toastr')
    }else{
      console.log('error, show toastr')
      this.toastr.error('ERROR', 'Show Toastr')
    }
  }

  xlsToMoment(date, format) {
    let result =  moment(Math.round((date - 25569)*86400*1000)).add(5, 'hours').format(format)

    return result == 'Invalid date' ? null : date == null ? null : result
  }

  uploadData( dt, type ){
    this.loading['building'] = true

    let url

    switch(type){
      case 'regs':
        url =  'Smd/upload'
        break
      case 'users':
        url = 'Smd/updateUsers'
        break
    }

    this._api.restfulPut( dt, url )
            .subscribe( res => {

              this.loading['building'] = false
              let msg, result = res
              console.log(result)

              switch(type){
                case 'regs':
                  msg = `${result['regs']} registros cargados`
                  break
                case 'users':
                  msg = `${result['regs']} usuarios cargados`
                  break
              }

              this.toastr.success('Done!', msg)

            }, err => {
              console.log('ERROR', err)

              this.loading['building'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

              if( type == 'regs' ){
                console.log('Errores', error['errores'])
              }

            })
    }

}
