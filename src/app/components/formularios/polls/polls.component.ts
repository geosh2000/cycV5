import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styles: []
})
export class PollsComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  saving:boolean = false
  mainCredential:string = 'default'

  showImage:any = ''
  showTitle:any = ''

  loading:Object = {
    '1': {},
    '2': {},
    '3': {},
  }
  curSelection:any
  flagCurSel:boolean = true

  elements:any = [
    {
      src: 'assets/img/poll-antifaz/buho.jpeg',
      name: 'buho'
    },
    {
      src: 'assets/img/poll-antifaz/colores.jpeg',
      name: 'colores'
    },
    {
      src: 'assets/img/poll-antifaz/frankie.jpeg',
      name: 'frankie'
    },
    {
      src: 'assets/img/poll-antifaz/frida.jpeg',
      name: 'frida'
    },
    {
      src: 'assets/img/poll-antifaz/hulk.jpeg',
      name: 'hulk'
    },
    {
      src: 'assets/img/poll-antifaz/mcdonalds.jpeg',
      name: 'mcdonalds'
    },
    {
      src: 'assets/img/poll-antifaz/sailor.jpeg',
      name: 'sailor'
    },
    {
      src: 'assets/img/poll-antifaz/spider.jpeg',
      name: 'spider'
    },
    {
      src: 'assets/img/poll-antifaz/unicornio.jpeg',
      name: 'unicornio'
    },
    {
      src: 'assets/img/poll-antifaz/wolverine.jpeg',
      name: 'wolverine'
    },
  ]

  choice:Object = {
    1: '',
    2: '',
    3: ''
  }

  constructor(public _api: ApiService,
                private titleService: Title,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService,
                private modalService: NgbModal ) {

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

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Votación Antifaz 2018');
    this.getSelection()
  }

  choose(name, place){
    for( let item in this.choice ){
      if( item == place ){
        if( this.choice[place] == name){
          this.choice[place] = ''
          this.saveSel(place, '')
        }else{
          this.choice[place] = name
          this.saveSel(place, name)
        }
      }else{
        if( this.choice[item] == name){
          this.choice[item] = ''
          this.saveSel(item, '')
        }
      }
    }
  }

  disabled(){
    let now = moment()
    if( now >= moment('2018-05-04 00:00:00') ){
      return true
    }else{
      return false
    }
  }

  getSelection(){
    this.loading['curSel'] = true

    this._api.restfulGet( 'antifaz2018', 'Polls/poll' )
              .subscribe( res => {

                this.loading['curSel'] = false
                this.curSelection = res['data']
                this.flagCurSel = true

                if( this.curSelection ){
                  this.choice['1'] = this.curSelection['sel1']
                  this.choice['2'] = this.curSelection['sel2']
                  this.choice['3'] = this.curSelection['sel3']
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['curSel'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  saveSel( sel, name ){
    this.loading[sel][name] = true
    this.saving = true

    let params = {
      data: {[`sel${sel}`]: name},
      poll: 'antifaz2018'
    }

    this._api.restfulPut( params, 'Polls/save' )
              .subscribe( res => {

                this.loading[sel][name] = false
                this.saving = false


              }, err => {
                console.log("ERROR", err)

                this.loading[sel][name] = false
                this.saving = false
                this.choice[sel] = ''

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  openModal(content, item) {
    this.showImage = item['src']
    this.showTitle = item['name']
    this.modalService.open(content, { size: 'lg', centered: true })
  }

  private getDismissReason(reason: any): string {
    if (reason == ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason == ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

}
