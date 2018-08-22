import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var jQuery:any;

@Component({
  selector: 'app-cxc-send-rh',
  templateUrl: './cxc-send-rh.component.html',
  styles: []
})
export class CxcSendRhComponent implements OnInit {

  @Output() save = new EventEmitter

  quincenas:number
  checkBox:boolean = false
  id:any

  constructor() { }

  ngOnInit() {
  }

  build( id ){
    this.quincenas = null
    this.checkBox = false
    this.id = id
    jQuery('#sendCxcRHModal').modal('show');
  }

  closeModal(){
    this.save.emit({status: false})
    jQuery('#sendCxcRHModal').modal('hide');
  }

  saveModal(){
    this.save.emit({status: true, id: this.id, value: this.quincenas})
    jQuery('#sendCxcRHModal').modal('hide');
  }

}
