import { Component, ViewChild, ViewContainerRef, OnInit } from '@angular/core';

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import * as Globals from '../../globals';
import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

@Component({
  selector: 'app-cambio-pdv',
  templateUrl: './cambio-pdv.component.html',
  styles: []
})
export class CambioPdvComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false;
  credentialStatus = 5;
  mainCredential="pdv_cambioModulo"
  currentUser:any
  results:any

  resultChange:any

  saving:boolean = false
  readyToSave:boolean = false

  // Autocomplete
  protected searchStrName:string;
  protected dataServiceName:CompleterData;
  protected searchStrPdv:string;
  protected dataServicePdv:CompleterData;
  // protected dataServiceName:string
  selectedAsesor:any
  selectedOK:boolean = false;
  selectedPDV:any
  selectedPDVOK:boolean = false;
  dateSelectedStatus:boolean = false;
  dateSelected:any
  places:any

  resultParams:any = {
    fecha: null,
    asesor_in: null,
    vacante_out: null,
    vacante_in: null,
    replaced: null,
    switch: false
  }

  // asesor a reemplazar
  replacedAsesor:any = {
    id: null,
    Nombre: null,
    selectedChoice: false,
    class: 'list-group-item-success'
  }

  placeSelected:any = null

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    ranges: {
               'Today': [moment(), moment()]
            }
  }

  constructor(
              private _dateRangeOptions: DaterangepickerConfig,
              private _api:ApiService,
              private _init:InitService,
              private completerService:CompleterService,
              public toastr: ToastsManager, vcr: ViewContainerRef) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }



  }

  protected onSelected(item){
    this.resetReplaced(true , true)
    this.selectedAsesor = item.originalObject
    this.selectedOK = true

    if(this.currentUser != null){
      let currentUser = this.currentUser
      this.dataServicePdv = this.completerService.remote(`${ Globals.APISERV }/api/restful/index.php/Asesores/PDVSelect/?token=${currentUser.token}&usn=${currentUser.username}&term=`, 'Ciudad,PDV', 'PDV')
    }

    // console.log(this.selectedAsesor)

  }

  protected onSelectedPDV(item){
    this.selectedPDV = item.originalObject
    this.resetReplaced(true)

    this.getPlaces(item.originalObject.id)

    // console.log(this.selectedPDV)

  }

  setVal( val ){
    this.dateSelected = val.format("YYYY-MM-DD")
    this.dateSelectedStatus = true
    this.selectedOK = false
    jQuery('#dateSelect').val(this.dateSelected)

    if(this.currentUser != null){
      let currentUser = this.currentUser
      this.dataServiceName = this.completerService.remote(`${ Globals.APISERV }/api/restful/index.php/Asesores/asesoresPDV/${ this.dateSelected }?token=${currentUser.token}&usn=${currentUser.username}&term=`, 'Nombre,nCorto,Usuario', 'Nombre')
        .descriptionField('PDV')
    }
  }

  getPlaces( pdv ){
    this._api.restfulGet(`actualPlacesPDV/${this.dateSelected}/${ pdv }`, 'Asesores')
              .subscribe( res => {
                // console.log( res )
                if(res['status']){
                  this.places = res['data']
                  this.selectedPDVOK = true
                }else{
                  console.error( res['msg'] )
                }
              })

  }

  resetReplaced( flag=false, selec=false, all=false ){
    this.replacedAsesor.id = null
    this.replacedAsesor.Nombre = null
    this.resultChange = null
    this.replacedAsesor.selectedChoice = false

    if(flag){
      this.placeSelected = null
      this.places = null
    }

    if(selec){
      this.selectedOK = false
      this.selectedAsesor = null
    }

    if(all){
      this.selectedAsesor = null
    }
  }

  placeAsesor( index ){
    this.placeSelected = index
    let placeData = this.places[index]

    if(placeData.asesor != null){
      this.replacedAsesor.id = placeData.asesor
      this.replacedAsesor.Nombre = placeData.Nombre
    }else{
      this.resetReplaced()
    }

    this.replacedAsesor.selectedChoice = false

  }

  selectReplaceChoice(){
    this.replacedAsesor.selectedChoice = !this.replacedAsesor.selectedChoice
  }

  returnReplaced(){
    this.removeAsesor()
  }

  removeAsesor(){
    this.resetReplaced( true )
  }

  saveChanges(){
      this.resultParams = {
        fecha: this.dateSelected,
        asesor_in: this.selectedAsesor.id,
        vacante_out: this.selectedAsesor.vacante,
        vacante_in: this.places[this.placeSelected].Vacante,
        replaced: this.places[this.placeSelected].asesor,
        switch: this.replacedAsesor.selectedChoice
      }

  }

  postChgPDV(){
    this.saving=true

    this._api.restfulPut( this.resultParams, 'SolicitudBC/chgPDV' )
            .subscribe( res => {
              if(res['data'] != null){
                console.log(res)
                this.saving = false
                this.resultChange = res['data']
                jQuery('#confirmModal').modal('hide')
                this.resetReplaced( true, true, true )
                this.toastr.success(`Cambio de PDV Registrado`, 'Aprobado!');
              }else{
                console.error(res)
                this.toastr.error(`Hubo un error en el registro`, 'ERROR!');
              }
            })
  }

  ngOnInit() {
  }

}
