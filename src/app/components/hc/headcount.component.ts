import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../globals';

@Component({
  selector: 'app-headcount',
  templateUrl: './headcount.component.html',
  styles: []
})
export class HeadcountComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'hc_detalle_asesores'

  loading:Object = {}

  data:any

  constructor(public _api: ApiService,
                private _init:InitService,
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
            jQuery("#loginModal").modal('show');
          }
        })

    this.activatedRoute.params.subscribe( params => {
      if( params.id ){
        // this.selected['id']     = params.id
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - HeadCount');
    this.getHeadCount()
  }

  getHeadCount(){
    this.loading['data'] = true

    this._api.restfulGet( '3|4','Headcount/headCount' )
              .subscribe( res => {

                this.loading['data'] = false

                let index = {
                  mainDep: {},
                  UDN:  {},
                  Area:  {},
                  Departamento:  {},
                  Puesto:  {},
                  copcPuesto:  {},
                  Oficina:  {},
                }

                for( let item of res['data'] ){
                  index['mainDep']      = this.index( index['mainDep'],     item['MainDep'], 'UDN', item['UDN'] )
                  index['UDN']          = this.index( index['UDN'],         item['UDN'], 'Area', item['Area'] )
                  index['Area']         = this.index( index['Area'],        item['Area'], 'Departamento', item['Departamento'] )
                  index['Departamento'] = this.index( index['Departamento'], item['Departamento'], 'Puesto', item['Puesto'] )
                  index['Puesto']       = this.index( index['Puesto'],      item['Puesto'], 'copcPuesto', item['copcPuesto'] )
                  index['copcPuesto']   = this.index( index['copcPuesto'],  item['copcPuesto'], 'Oficina', item['Oficina'] )
                  index['Oficina']      = this.index( index['Oficina'],     item['Oficina'], '1', 1 )
                }
                console.log(index)
                this.data=res['data']

              }, err => {
                console.log("ERROR", err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  index( arr, val, sub, subVal ){

    if( arr[val] ){
      if( arr[val][sub] ){
        if( arr[val][sub].indexOf(subVal) < 0 ){
          arr[val][sub].push(subVal)
        }
      }else{
        arr[val][sub] = [subVal]
      }
    }else{
      arr[val] = { [sub] : [subVal] }
    }

    return arr
  }

  printDate( date, format ){
    return moment(date).format(format)
  }


}
