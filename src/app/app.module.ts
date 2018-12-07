import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Daterangepicker } from 'ng2-daterangepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule, registerLocaleData } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FileUploadModule } from 'ng2-file-upload';
import { PopoverModule } from 'ngx-popover';
import localeEsMX from '@angular/common/locales/es-MX'
import { UiSwitchModule } from 'ngx-ui-switch'
import { ChartModule } from '@gustav0ar/ngx-highcharts'
import { HighchartsStatic } from '@gustav0ar/ngx-highcharts/dist/HighchartsService';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { OrderModule } from 'ngx-order-pipe'
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { FullCalendarModule } from 'ng-fullcalendar';
import { ContextMenuModule } from 'ngx-contextmenu';
import { ToastrModule } from 'ngx-toastr';
import { Select2Module } from 'ng2-select2';
import { NgDragDropModule } from 'ng-drag-drop';
import {TableModule} from 'ngx-easy-table';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';


// services
import { NavbarService, AsesoresService, LoginService, CredentialsService, TokenCheckService, ApiService, InitService, GlobalServicesService } from './services/service.index';
import { ScrollingModule } from '@angular/cdk/scrolling';

// pipes
import { KeysPipe } from './pipes/keys.pipe';
import { CapitalizadoPipe } from './pipes/capitalizado.pipe';

import { APP_ROUTING } from './app.routes';
import { AppComponent } from './app.component';
import { NgSwitchComponent } from './components/ng-switch/ng-switch.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CambioPuestoComponent } from './components/formularios/cambio-puesto.component';
import { ForecastProgramacionComponent } from './components/forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from './components/hc/vacantes.component';
import { EditDetailsComponent } from './components/formularios/edit-details.component';
import { SetBajaComponent } from './components/formularios/set-baja.component';
import { AgregarCxcComponent } from './components/formularios/agregar-cxc.component';
import { SaldarCxcComponent } from './components/formularios/saldar-cxc.component';
import { ApplyCxcComponent } from './components/formularios/apply-cxc.component';
import { SancionesComponent } from './components/tables/sanciones.component';
import { AddVacanteComponent } from './components/formularios/add-vacante.component';
import { DeactivateVacanteComponent } from './components/formularios/deactivate-vacante.component';
import { TestComponent } from './test/test/test.component';
import { TableComponent } from './components/tables/table.component';
import { AddAsesorComponent } from './components/formularios/add-asesor.component';
import { AjusteSalarialComponent } from './components/formularios/ajuste-salarial.component';
import { EditarAjusteSalarialComponent } from './components/formularios/editar-ajuste-salarial.component';
import { AddContratoComponent } from './components/formularios/add-contrato.component';
import { AprobacionesComponent } from './components/rrhh/aprobaciones.component';
import { ApplyAllCxcComponent } from './components/formularios/apply-all-cxc.component';
import { CuartilesComponent } from './components/reportes/cuartiles/cuartiles.component';
import { PrecisionComponent } from './components/reportes/precision/precision.component';
import { ButtonSaveDirective } from './directives/button-save.directive';
import { PorIntervaloComponent } from './components/reportes/precision/por-intervalo.component';
import { BitacoraSupersComponent } from './components/formularios/bitacora-supers/bitacora-supers.component';
import { AprobarVacantesComponent } from './components/rrhh/aprobar-vacantes.component';
import { AddExternalUserComponent } from './components/config/add-external-user.component';
import { PyaComponent } from './components/monitors/pya/pya.component';
import { CambioPdvComponent } from './components/pdv/cambio-pdv.component';
import { ChangeSupervisorComponent } from './components/config/change-supervisor.component';
import { LiveTabComponent } from './components/monitors/venta/live-tab.component';
import { DomseguroPipe } from './pipes/domseguro.pipe';
import { AsistenciaComponent } from './components/reportes/asistencia/asistencia.component';
import { AddAusentismoComponent } from './components/formularios/add-ausentismo.component';
import { JornadasComponent } from './components/reportes/asistencia/jornadas.component';
import { NoAcentosPipe } from './pipes/no-acentos.pipe';
import { UploadImageComponent } from './components/formularios/upload-image.component';
import { ReingresoAsesorComponent } from './components/formularios/reingreso-asesor.component';
import { HxConfigComponent } from './components/config/horarios/hx-config.component';
import { VentaPorCanalComponent } from './components/reportes/venta/venta-por-canal.component';
import { RnComponent } from './components/monitors/venta/rn.component';
import { GraficaVentasComponent } from './components/home/grafica-ventas.component';
import { ReportUpdatesComponent } from './components/config/updates/report-updates.component';
import { PersonalDataComponent } from './components/home/personal-data.component';
import { EventDisplayComponent } from './components/home/event-display.component';
import { FamsComponent } from './components/config/fams/fams.component';
import { UploadFilesComponent } from './components/formularios/upload-files.component';
import { PausesComponent } from './components/monitors/pauses/pauses.component';
import { CalendarioComponent } from './components/asistencia/calendario/calendario.component';
import { AleatoriedadComponent } from './components/reportes/calidad/aleatoriedad/aleatoriedad.component';
import { PrenominaComponent } from './components/rrhh/prenomina/prenomina.component';
import { AusentismosComponent } from './components/asistencia/ausentismos/ausentismos.component';
import { VentaPorAsesorComponent } from './components/monitors/venta-por-asesor/venta-por-asesor.component';
// tslint:disable-next-line:max-line-length
import { CardAsesorEstadisticaComponent } from './components/monitors/venta-por-asesor/card-asesor-estadistica/card-asesor-estadistica.component';
import { ParticipacionComponent } from './components/monitors/ivr/participacion.component';
import { PathSelectComponent } from './components/monitors/ivr/path-select/path-select.component';
import { PyaExceptionComponent } from './components/formularios/pya-exception.component';
import { PyaCardsComponent } from './components/monitors/pya/pya-cards/pya-cards.component';
import { HorariosSemanaComponent } from './components/home/horarios-semana/horarios-semana.component';
import { AusHistoricoComponent } from './components/asistencia/ausentismos/aus-historico/aus-historico.component';
import { MonitorPausasComponent } from './components/monitors/monitor-pausas/monitor-pausas.component';
import { PausaAsesorComponent } from './components/monitors/monitor-pausas/pausa-asesor/pausa-asesor.component';
import { PauseDetailComponent } from './components/monitors/monitor-pausas/pause-detail/pause-detail.component';
import { CambioLocalizadorAsesorComponent } from './components/config/cambio-localizador-asesor/cambio-localizador-asesor.component';
import { QueuesV2Component } from './components/monitors/queues-v2/queues-v2.component';
import { CbpComponent } from './components/monitors/queues-v2/cbp/cbp.component';
import { DashPorHoraComponent } from './components/monitors/dash-por-hora/dash-por-hora.component';
import { StatisticsComponent } from './components/monitors/calls/statistics/statistics.component';
import { GraphCallStatsComponent } from './components/monitors/calls/statistics/graph-call-stats/graph-call-stats.component';
import { KpisComponent } from './components/monitors/kpis/kpis.component';
import { TablesorterComponent } from './plugins/tablesorter/tablesorter.component';
import { KpisDetailComponent } from './components/monitors/kpis/kpis-detail/kpis-detail.component';
import { AsesoresFotosComponent } from './components/config/asesores-fotos/asesores-fotos.component';
import { SlaComponent } from './components/monitors/sla/sla.component';
import { UploadCalidadComponent } from './components/config/upload-calidad/upload-calidad.component';
import { BonosComponent } from './components/reportes/bonos/bonos.component';
import { TablafComponent } from './components/reportes/tablaf/tablaf.component';
import { MpMxComponent } from './components/reportes/tablaf/mp-mx/mp-mx.component';
import { SoporteMxComponent } from './components/reportes/tablaf/soporte-mx/soporte-mx.component';
import { TablafSoporteComponent } from './components/reportes/tablaf/tablaf-soporte.component';
import { UploadLogsPdvComponent } from './components/config/upload-logs-pdv.component';
import { SetHorariosComponent } from './components/config/set-horarios/set-horarios.component';
import { OutletComponent } from './components/formularios/outlet/outlet.component';
import { DbOutletComponent } from './components/formularios/outlet/db/db-outlet.component';
import { ProReportComponent } from './components/reportes/pro-report/pro-report.component';
import { PollsComponent } from './components/formularios/polls/polls.component';
import { DashOutletComponent } from './components/monitors/dash-outlet/dash-outlet.component';
import { GraphOutletComponent } from './components/monitors/dash-outlet/graph-outlet/graph-outlet.component';
import { Ovirtual2018Component } from './components/monitors/dash-outlet/ovirtual2018.component';
import { DiasPendientesComponent } from './components/asistencia/dias-pendientes/dias-pendientes.component';
import { AprobacionDpComponent } from './components/asistencia/dias-pendientes/aprobacion-dp/aprobacion-dp.component';
import { KpisPdvComponent } from './components/monitors/kpis-pdv/kpis-pdv.component';
import { DetalleAsesoresComponent } from './components/hc/detalle-asesores/detalle-asesores.component';
import { DetDetalleComponent } from './components/hc/detalle-asesores/det-detalle/det-detalle.component';
import { DetContratoComponent } from './components/hc/detalle-asesores/det-contrato/det-contrato.component';
import { VentaPorCanalPdvComponent } from './components/reportes/venta/venta-por-canal-pdv.component';
import { DetSalarioComponent } from './components/hc/detalle-asesores/det-salario/det-salario.component';
import { DetHistorialComponent } from './components/hc/detalle-asesores/det-historial/det-historial.component';
import { DetHorarioComponent } from './components/hc/detalle-asesores/det-horario/det-horario.component';
import { StepsComponent } from './addon/steps/steps.component';
import { HeadcountComponent } from './components/hc/headcount.component';
import { QuinielaComponent } from './components/mundial/quiniela/quiniela.component';
import { ResultadosMundialComponent } from './components/mundial/resultados-mundial/resultados-mundial.component';
import { AfiliadosComponent } from './affiliatePages/afiliados.component';
import { MainContentComponent } from './mainPages/main-content.component';
import { MainPages } from './mainPages/main-pages.module';
import { SharedModule } from './shared/shared.module';
import { ReporteAfiliadosComponent } from './components/reportes/reporte-afiliados/reporte-afiliados.component';
import { CargaHorariosComponent } from './components/asistencia/carga-horarios/carga-horarios.component';
import { ProgramacionComponent } from './components/asistencia/programacion/programacion.component';
import { AffiliatesComponent } from './components/pages/affiliates/affiliates.component';
import { MainComponent } from './components/pages/main/main.component';
import { CambioTurnoComponent } from './components/asistencia/cambio-turno/cambio-turno.component';
import { VentaPorCanalMtComponent } from './components/reportes/venta/venta-por-canal-mt.component';
import { SaleIndexMonitorComponent } from './components/monitors/sale-index-monitor/sale-index-monitor.component';
import { CxcRegistroComponent } from './components/cxc/cxc-registro/cxc-registro.component';
import { CxcLinkComponent } from './components/cxc/cxc-link/cxc-link.component';
import { CxcAddComponent } from './components/cxc/cxc-add/cxc-add.component';
import { CxcLineComponent } from './components/cxc/cxc-line/cxc-line.component';
import { CxcAdminComponent } from './components/cxc/cxc-admin/cxc-admin.component';
import { CxcCommentComponent } from './components/cxc/cxc-comment/cxc-comment.component';
import { CxcAprobeComponent } from './components/cxc/cxc-aprobe/cxc-aprobe.component';
import { CxcAplicablesComponent } from './components/cxc/cxc-aplicables/cxc-aplicables.component';
import { CxcPayDetailComponent } from './components/cxc/cxc-pay-detail/cxc-pay-detail.component';
import { HomeCxcViewComponent } from './components/home/home-cxc-view/home-cxc-view.component';
import { BitacoraComponent } from './components/monitors/bitacora/bitacora.component';
import { BitacoraAddActionComponent } from './components/monitors/bitacora/bitacora-add-action/bitacora-add-action.component';

import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';
import { CdkTableModule } from '../../node_modules/@angular/cdk/table';
import { CdkTreeModule } from '../../node_modules/@angular/cdk/tree';
import { CxcSendRhComponent } from './components/cxc/cxc-send-rh/cxc-send-rh.component';
import { SurveyComponent } from './components/formularios/survey/survey.component';
import { SurvHistoricComponent } from './components/formularios/survey/surv-historic/surv-historic.component';
import { SurveyReportComponent } from './components/reportes/survey-report/survey-report.component';
import { HcControlComponent } from './components/hc/hc-control/hc-control.component';
import { HcUdnComponent } from './components/hc/hc-control/hc-udn/hc-udn.component';
import { HcPuestosComponent } from './components/hc/hc-control/hc-puestos/hc-puestos.component';
import { AltasBatchComponent } from './components/hc/altas-batch/altas-batch.component';
import { BatchAsesorFormComponent } from './components/hc/altas-batch/batch-asesor-form/batch-asesor-form.component';
import { ShowQMonitorComponent } from './components/monitors/queues-v2/show-qmonitor/show-qmonitor.component';
import { QueuesV3Component } from './components/monitors/queues-v3/queues-v3.component';
import { CallCardComponent } from './components/monitors/queues-v3/call-card/call-card.component';
import { CallBlockComponent } from './components/monitors/queues-v3/call-block/call-block.component';
import { CallCardSmComponent } from './components/monitors/queues-v3/call-card-sm/call-card-sm.component';
import { EvaluacionDesempenoComponent } from './components/rrhh/evaluacion-desempeno/evaluacion-desempeno.component';
import { ModalEvaluacionDesComponent } from './components/rrhh/evaluacion-desempeno/modal-evaluacion-des/modal-evaluacion-des.component';
import { AddNewAgentComponent } from './components/formularios/add-new-agent/add-new-agent.component';
import { CallStatisticsComponent } from './components/monitors/calls/call-statistics.component';
import { MultipleCallStatsComponent } from './components/monitors/calls/multiple-call-stats.component';
import { HcPdvComponent } from './components/hc/hc-pdv/hc-pdv.component';
import { PdvSuperAssignComponent } from './components/config/pdv-super-assign/pdv-super-assign.component';
import { CcSuperAssignComponent } from './components/config/cc-super-assign/cc-super-assign.component';
import { ReportesAvisosPdvComponent } from './components/reportes/reportes-avisos-pdv/reportes-avisos-pdv.component';
import { DisciplinaPositivaComponent } from './components/rrhh/disciplina-positiva/disciplina-positiva.component';
import { MetasPdvComponent } from './components/config/metas/metas-pdv/metas-pdv.component';
import { PdvZoneAssignComponent } from './components/config/pdv-zone-assign/pdv-zone-assign.component';
import { OfertasPdvComponent } from './components/uploads/ofertas-pdv/ofertas-pdv.component';
import { OfertasActivasComponent } from './components/reportes/ofertas-activas/ofertas-activas.component';
import { VentaSemanaComponent } from './components/reportes/venta-semana/venta-semana.component';
import { MasBuscadosMpComponent } from './components/reportes/mas-buscados-mp/mas-buscados-mp.component';
import { LostCallsComponent } from './components/reportes/lost-calls/lost-calls.component';
import { PdvCoordAssignComponent } from './components/config/pdv-coord-assign/pdv-coord-assign.component';

declare let jQuery: Object;

declare var require: any;

export function highchartsFactory() {
    let hc = require('highcharts');
    let hcm = require('highcharts/highcharts-more');
    let exp = require('highcharts/modules/exporting');
    let sg = require('highcharts/modules/solid-gauge');
    let sank = require('highcharts/modules/sankey');

    hcm(hc);
    exp(hc);
    sg(hc);
    sank(hc);
    return hc;
}

registerLocaleData(localeEsMX)


@NgModule({
  declarations: [
    AppComponent,
    NgSwitchComponent,
    HomeComponent,
    NotFoundComponent,
    CambioPuestoComponent,
    ForecastProgramacionComponent,
    VacantesComponent,
    EditDetailsComponent,
    SetBajaComponent,
    AgregarCxcComponent,
    SaldarCxcComponent,
    ApplyCxcComponent,
    SancionesComponent,
    AddVacanteComponent,
    DeactivateVacanteComponent,
    TestComponent,
    TableComponent,
    AddAsesorComponent,
    AjusteSalarialComponent,
    EditarAjusteSalarialComponent,
    AddContratoComponent,
    AprobacionesComponent,
    ApplyAllCxcComponent,
    CuartilesComponent,
    PrecisionComponent,
    ButtonSaveDirective,
    PorIntervaloComponent,
    BitacoraSupersComponent,
    AprobarVacantesComponent,
    AddExternalUserComponent,
    PyaComponent,
    CambioPdvComponent,
    ChangeSupervisorComponent,
    LiveTabComponent,
    DomseguroPipe,
    AsistenciaComponent,
    AddAusentismoComponent,
    JornadasComponent,
    CxcAdminComponent,
    NoAcentosPipe,
    UploadImageComponent,
    ReingresoAsesorComponent,
    HxConfigComponent,
    VentaPorCanalComponent,
    RnComponent,
    GraficaVentasComponent,
    ReportUpdatesComponent,
    PersonalDataComponent,
    EventDisplayComponent,
    FamsComponent,
    UploadFilesComponent,
    PausesComponent,
    CalendarioComponent,
    AleatoriedadComponent,
    PrenominaComponent,
    AusentismosComponent,
    VentaPorAsesorComponent,
    CardAsesorEstadisticaComponent,
    ParticipacionComponent,
    PathSelectComponent,
    PyaExceptionComponent,
    PyaCardsComponent,
    HorariosSemanaComponent,
    AusHistoricoComponent,
    MonitorPausasComponent,
    PausaAsesorComponent,
    PauseDetailComponent,
    CambioLocalizadorAsesorComponent,
    QueuesV2Component,
    CbpComponent,
    DashPorHoraComponent,
    StatisticsComponent,
    GraphCallStatsComponent,
    KpisComponent,
    TablesorterComponent,
    KpisDetailComponent,
    AsesoresFotosComponent,
    SlaComponent,
    UploadCalidadComponent,
    BonosComponent,
    TablafComponent,
    MpMxComponent,
    SoporteMxComponent,
    TablafSoporteComponent,
    UploadLogsPdvComponent,
    SetHorariosComponent,
    OutletComponent,
    DbOutletComponent,
    ProReportComponent,
    PollsComponent,
    DashOutletComponent,
    GraphOutletComponent,
    Ovirtual2018Component,
    DiasPendientesComponent,
    AprobacionDpComponent,
    KpisPdvComponent,
    DetalleAsesoresComponent,
    DetDetalleComponent,
    DetContratoComponent,
    VentaPorCanalPdvComponent,
    DetSalarioComponent,
    DetHistorialComponent,
    DetHorarioComponent,
    StepsComponent,
    HeadcountComponent,
    QuinielaComponent,
    ResultadosMundialComponent,
    AfiliadosComponent,
    MainContentComponent,
    ReporteAfiliadosComponent,
    CargaHorariosComponent,
    ProgramacionComponent,
    AffiliatesComponent,
    MainComponent,
    CambioTurnoComponent,
    VentaPorCanalMtComponent,
    SaleIndexMonitorComponent,
    CxcRegistroComponent,
    CxcLinkComponent,
    CxcAddComponent,
    CxcLineComponent,
    CxcCommentComponent,
    CxcAprobeComponent,
    CxcAplicablesComponent,
    CxcPayDetailComponent,
    HomeCxcViewComponent,
    BitacoraComponent,
    BitacoraAddActionComponent,
    CxcSendRhComponent,
    SurveyComponent,
    SurvHistoricComponent,
    SurveyReportComponent,
    HcControlComponent,
    HcUdnComponent,
    HcPuestosComponent,
    AltasBatchComponent,
    BatchAsesorFormComponent,
    ShowQMonitorComponent,
    QueuesV3Component,
    CallCardComponent,
    CallBlockComponent,
    CallCardSmComponent,
    EvaluacionDesempenoComponent,
    ModalEvaluacionDesComponent,
    AddNewAgentComponent,
    CallStatisticsComponent,
    MultipleCallStatsComponent,
    HcPdvComponent,
    PdvSuperAssignComponent,
    CcSuperAssignComponent,
    ReportesAvisosPdvComponent,
    DisciplinaPositivaComponent,
    MetasPdvComponent,
    PdvZoneAssignComponent,
    OfertasPdvComponent,
    OfertasActivasComponent,
    VentaSemanaComponent,
    MasBuscadosMpComponent,
    LostCallsComponent,
    PdvCoordAssignComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,

    MainPages,
    SharedModule,

    MatButtonModule,
    MatCheckboxModule,

    BrowserAnimationsModule,
    HttpClientModule,
    APP_ROUTING,
    Daterangepicker,
    Ng2SmartTableModule,
    FileUploadModule,
    ChartModule,
    FullCalendarModule,
    ToastrModule.forRoot(),
    Ng2CompleterModule,
    FormsModule,
    ReactiveFormsModule,
    UiSwitchModule,
    NgbModule.forRoot(),
    OrderModule,
    MultiselectDropdownModule,
    ContextMenuModule.forRoot({
      useBootstrap4: true,
      autoFocus: true
    }),
    NgDragDropModule.forRoot(),
    NgxMaterialTimepickerModule.forRoot(),
    ScrollingModule,

    // ==================================================
    // START ANGULAR MATERIAL
    // ==================================================
    CdkTableModule,
    CdkTreeModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    // ==================================================
    // END ANGULAR MATERIAL
    // ==================================================

    Select2Module,
    TableModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'Es-MX' },
    {provide: HighchartsStatic, useFactory: highchartsFactory},
    NavbarService,
    AsesoresService,
    LoginService,
    CredentialsService,
    TokenCheckService,
    ApiService,
    InitService,
    GlobalServicesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
