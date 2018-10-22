import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;

@Component({
  selector: 'app-new-adv-pdv',
  templateUrl: './new-adv-pdv.component.html',
  styles: []
})
export class NewAdvPdvComponent implements OnInit {

  selectOptions:Select2Options = {
    placeholder: 'Selecciona un PDV...'
  }
  pdvSearchList:any = []

  formNew:Object = {
    pdv: '',
    localizador: '',
    aviso: ''
  }
  form:Object = {}
  loading:Object = {}

  constructor( private _api: ApiService, private toastr:ToastrService ) {
    this.getPdvs()
    this.resetForm()
  }

  resetForm(){
    this.form = JSON.parse(JSON.stringify(this.formNew))
  }

  close(){
    this.resetForm()
    jQuery('#newPdvAdv').modal('hide')
  }

  ngOnInit() {
  }

  selectedVal( val ){
    console.log( val )
  }

  getPdvs(){
    this._api.restfulGet( '', 'Lists/pdvList')
              .subscribe( res => {

                let searchList = [{id: '0', text: '    Selecciona un PDV...'}]

                for( let pdv of res['data'] ){
                  let tmp = {
                    id: pdv.id,
                    text: pdv.displayNameList.trim()
                  }
                  searchList.push( tmp )
                }

                this.pdvSearchList = searchList

              }, err => {
                console.log('ERROR', err)

                let error = err.error
                console.error(err.statusText, error.msg)

              })
  }

  saveAdv(){
    this.loading['save'] = true

    console.log( this.form )

    for( let field in this.form ){
      if(this.form[field] == ''){
        this.toastr.error( 'El campo '+field+' es obligatorio', 'Error en formulario' )
        this.loading['save'] = false
        return false
      }
    }

    if( this.form['pdv'] == '0' ){
      this.toastr.error( 'Debes seleccionar un PDV', 'Error en formulario' )
      this.loading['save'] = false
      return false
    }

  if( !this.form['localizador'].match(/^[0-9]*$/gm) ){
    this.toastr.error( 'El localizador debe contener sólo números', 'Error en formulario' )
    this.loading['save'] = false
    return false
  }

  // this.form['aviso'] = this.form['aviso'].replace(/\w\S*/g, function (word) {
  //   return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  // })

    this._api.restfulPut( this.form, 'Navbar/pdvAdvSave')
              .subscribe( res => {
                this.loading['save'] = false

                this.toastr.success('Registro Guardado', 'Guardado')
                this.close()

              }, err => {
                this.loading['save'] = false
                console.log('ERROR', err)

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

}
