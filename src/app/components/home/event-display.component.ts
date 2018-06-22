import { Component, OnInit, ViewContainerRef, Input, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ApiService } from '../../services/api.service';

import * as moment from 'moment-timezone';;

@Component({
  selector: 'app-event-display',
  templateUrl: './event-display.component.html',
  styles: []
})
export class EventDisplayComponent implements OnInit {

  @Input() asesor:any
  @Input() original:any

  loadingFams:boolean = false
  reLoadingFams:boolean = false

  famsData:any    = []
  idIndex:Object  = {}

  subsLoading:boolean = false

  constructor( private _api:ApiService,
                public toastr: ToastrService ) {

      this.getData()

  }

  getData( reload = false){

    if(!this.asesor || this.asesor === undefined){
      return false
    }

    if( !reload ){
      this.loadingFams = true
    }else{
      this.reLoadingFams = true
    }

    this._api.restfulGet( `${this.asesor}`, 'Fams/activeFams' )
            .subscribe( res => {

              this.loadingFams = false
              this.reLoadingFams = false

              this.famsData = res['data']

              let i = 0
              for( let item of res['data'] ){
                this.idIndex[item.id] = i
                i++
              }

              if( res['rows'] > 0 ){
                this.tabView( res['data'][0].id )
              }

            }, err => {

              this.loadingFams = false
              this.reLoadingFams = false

              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              }
            })

  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  formatDate( date, format, hour=true ){

    let hr = ""

    if(!hour){
      hr = " 12:00:00"
    }

    let time = moment.tz( `${date}${hr}`, 'America/Mexico_City' )

    return time.tz('America/Bogota').format( format )

  }

  tabView( id ){

    if( this.famsData[this.idIndex[id]].shown != null ){
      return true
    }

    if( this.asesor != this.original ){
      return true
    }

    let params = {
      asesor: this.asesor,
      evento: id
    }

    this._api.restfulPut( params, 'Fams/markRead' )
            .subscribe( res => {

              this.famsData[this.idIndex[id]].shown = '1'

            }, err => {

              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              }
            })

  }

  checkLimit( date, direction ){

    if( this.asesor != this.original ){
      return false
    }

    let now = moment()
    let limit = moment.tz( date, 'America/Mexico_City' )

    limit.tz('America/Bogota')

    if( direction ){

      if( now > limit ){
        return true
      }else{
        return false
      }

    }else{

      if( now <= limit ){
        return true
      }else{
        return false
      }

    }

  }

  subscribe( index, subs ){

      this.subsLoading = true

      let params = {
        asesor: this.asesor,
        evento: this.famsData[index].id
      }

      let confParams = {}

      if( subs ){
        confParams = {
          asistira: '1',
          module: 'Fams/subscribeFam'
        }
      }else{
        confParams = {
          asistira: '0',
          module: 'Fams/unSubscribeFam'
        }
      }

      this._api.restfulPut( params, confParams['module'] )
              .subscribe( res => {
                this.subsLoading = false

                this.famsData[index].asistira = confParams['asistira']

              }, err => {
                this.subsLoading = false
                if(err){
                  let error = err.json()
                  this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                  console.error(err.statusText, error.msg)

                }
              })

  }

}
