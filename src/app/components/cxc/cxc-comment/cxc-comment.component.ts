import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cxc-comment',
  templateUrl: './cxc-comment.component.html',
  styles: []
})
export class CxcCommentComponent implements OnInit {

  @Input() id:any
  @Input() comments:any
  @Output() save = new EventEmitter

  loading:Object = {}


  constructor( private _api: ApiService, private toastr: ToastrService ) { }

  ngOnInit() {
  }

  build(id, comments){
    this.id = id
    this.comments = comments
    jQuery('#commentModal').modal('show')
  }

  saveComments(){
    this.loading['save'] = true

    let params = {
      where: {
        id: this.id
      },
      set: {
        comments: this.comments
      }
    }

    this._api.restfulPut( params, `Cxc/editReg`)
          .subscribe( res => {

            this.loading['save'] = false
            this.save.emit({status: true, comment: this.comments, id: this.id})

          }, err => {

            console.log('ERROR', err)

            this.loading['save'] = false

            let error = err.error
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

}
