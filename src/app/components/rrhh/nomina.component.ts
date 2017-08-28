import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;


import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-nomina',
  templateUrl: './nomina.component.html',
  styles: []
})
export class NominaComponent implements OnInit {

  showContents:boolean = false
  mainCredential:string = 'payroll_prenomina'

  cxcPendientes:boolean = false
  listCortesFlag:boolean = false
  ready:boolean = false
  loadingNomina:boolean = false
  errorFlag:boolean = false

  currentUser:any
  listCortes:any
  prenomina:any
  errorMsg:any

  smartTableSettings = {
    columns: {
      idAsesor: { title: 'idAsesor'},
      CLAVE: { title: 'CLAVE'},
      Nombre_del_empleado: { title: 'Nombre del empleado'},
      Ubicacion: { title: 'Ubicacion'},
      Centro_de_Costos: { title: 'Centro de Costos'},
      Unidad_de_Negocio: { title: 'Unidad de Negocio'},
      Area: { title: 'Area'},
      Departamento: { title: 'Departamento'},
      Puesto: { title: 'Puesto'},
      Esquema: { title: 'Esquema'},
      Ingreso: { title: 'Ingreso'},
      Egreso: { title: 'Egreso'},
      Salario: { title: 'Salario'},
      total: { title: 'Horas Extra (tiempo)'},
      HorasExtra: { title: 'Horas Extra (monto)'},
      Descansos: { title: 'Descansos'},
      Asistencias: { title: 'Asistencias'},
      Capacitacion: { title: 'Capacitacion'},
      F_Faltas_JUS: { title: 'F Faltas JUS'},
      F_Faltas_IN: { title: 'F Faltas IN'},
      F_Suspension: { title: 'F Suspension'},
      Maternidad: { title: 'Maternidad'},
      Enfermedad: { title: 'Enfermedad'},
      Accidente: { title: 'Accidente'},
      Acc_por_riesgo: { title: 'Acc por riesgo'},
      F_Permiso_sin_g: { title: 'F Permiso sin g'},
      F_Permiso_con_g: { title: 'F Permiso con g'},
      F_Vacaciones: { title: 'F Vacaciones'},
      Descanso_Trabajado: { title: 'Descanso Trabajado'},
      Dia_Festivo: { title: 'Dia Festivo'},
      DomingosTrabajados: { title: 'Domingos Trabajados'},
      Prima_Dominical: { title: 'Prima Dominical'},
      Prima_Vacacional_1_SI: { title: 'Prima Vacacional 1 SI'},
      Dias_de_prima_vac: { title: 'Dias de prima vac'},
      Subsidio_por_incapacidad: { title: 'Subsidio por incapacidad'},
      Compensacion: { title: 'Compensacion'},
      Incentivo: { title: 'Incentivo'},
      Ayuda_de_renta: { title: 'Ayuda de renta'},
      Retroactivo: { title: 'Retroactivo'},
      Comedor: { title: 'Comedor'},
      Descuento_Celular: { title: 'Descuento Celular'},
      Otras_Deducciones: { title: 'Otras Deducciones'},
      Curso_ingles: { title: 'Curso ingles'},
      Optica_otras_deducciones: { title: 'Optica otras deducciones'},
      Servicio_dental: { title: 'Servicio dental'},
      aportacion_voluntariado: { title: 'aportacion voluntariado'},
      Descuento_empleado: { title: 'Descuento empleado'},
      Responsabilidad: { title: 'Responsabilidad'},
      Tarjeta_vales: { title: 'Tarjeta vales'},
      Observaciones: { title: 'Observaciones'},
    },
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    pager: {
      perPage: 50
    }
  }

  constructor(
              private _api:ApiService,
              private _init:InitService
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._api.restfulGet( '', 'Nomina/cxcPendientes' )
            .subscribe( res => {
              if(res['status']){
                if(res['rows']>0){
                  this.cxcPendientes = true
                }
              }else{
                console.error( res )
              }
            })

    this._api.restfulGet( '', 'Nomina/listCortes' )
            .subscribe( res => {
              if(res['status']){
                this.listCortes = res['data']
                this.listCortesFlag = true
              }else{
                console.error( res )
              }
            })

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));


  }

  ngOnInit() {
  }

  selectedCorte( event ){

    this.loadingNomina = true
    this.ready = false
    this.errorFlag = false

    this._api.restfulGet( event.target.value, 'Nomina/prenomina')
            .subscribe( res => {

              this.loadingNomina = false
              this.ready = true

              if(res['status']){

                this.prenomina = res['data']

              }else{
                this.errorFlag = true
                this.errorMsg = res['error']
                console.error( res )
              }
            })
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});
    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

}
