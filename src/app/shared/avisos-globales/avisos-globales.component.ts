import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;

@Component({
  selector: 'app-avisos-globales',
  templateUrl: './avisos-globales.component.html',
  styles: []
})
export class AvisosGlobalesComponent implements OnInit, OnDestroy {

  loading:Object = {}
  pdvList:any = []
  pdvSearchList:any = []

  advList:Object = {}

  selectedPdvs = []

  timeToRefresh = {
    success: 300,
    error: 30
  }
  timerCount = 300
  timeout:any

  selectOptions:Select2Options = {
    multiple: true,
  }

  constructor( private _api: ApiService, private toastr: ToastrService) {

  }

  ngOnInit() {
    this.getPdvs()
    this.getAvisos()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getPdvs(){
    this.loading['pdvs'] = true

    this._api.restfulGet( '', 'Lists/pdvList')
              .subscribe( res => {

                this.loading['pdvs'] = false
                this.pdvList = res['data']

                let searchList = []

                for( let pdv of res['data'] ){
                  let tmp = {
                    id: pdv.id,
                    text: pdv.displayNameList
                  }
                  searchList.push( tmp )
                }

                this.pdvSearchList = searchList

              }, err => {
                console.log('ERROR', err)

                this.loading['pdvs'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  newAdv(){
    jQuery('#newPdvAdv').modal('show')
  }

  selectedVal( val ){
    this.selectedPdvs = val.value
  }

  getAvisos(){
    this.loading['avisos'] = true

    this._api.restfulGet( '', 'Navbar/avisosPDV')
              .subscribe( res => {

                this.loading['avisos'] = false
                let avisos = {}

                for( let adv of res['data'] ){
                  if( !avisos[adv['pdv']] ){
                    avisos[adv['pdv']] = []
                  }

                  adv['status'] = adv['status'] == 0 ? false : true
                  avisos[adv['pdv']].push(adv)
                }

                this.advList = avisos

                this.timerCount = this.timeToRefresh['success']
                this.startTimer()

              }, err => {
                console.log('ERROR', err)

                this.loading['avisos'] = false

                this.timerCount = this.timeToRefresh['error']
                this.startTimer()

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  startTimer(){
    if( this.timerCount == 0 ){
      this.getAvisos()
    }else{
      this.timerCount --
      this.timeout = setTimeout( () => this.startTimer(), 1000 )
    }

  }

  pdvName( pdv ){
    for( let item of this.pdvList ){
      if( parseInt(pdv) == parseInt( item['id']) ){
        return item['displayNameList']
      }
    }
  }

}
