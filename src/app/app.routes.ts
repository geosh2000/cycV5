import { RouterModule, Routes } from '@angular/router';
// import { DetailAsesorComponent } from './components/detail-asesor/detail-asesor.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './shared/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForecastProgramacionComponent } from './components/forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from './components/hc/vacantes.component';
import { HeadcountComponent } from './components/hc/headcount.component';
import { AprobacionesComponent } from './components/rrhh/aprobaciones.component';
import { PrenominaComponent } from './components/rrhh/prenomina/prenomina.component';
import { AprobarVacantesComponent } from './components/rrhh/aprobar-vacantes.component';
import { ApplyAllCxcComponent } from './components/formularios/apply-all-cxc.component';
import { BitacoraSupersComponent } from './components/formularios/bitacora-supers/bitacora-supers.component';
import { CuartilesComponent } from './components/reportes/cuartiles/cuartiles.component';
import { PrecisionComponent } from './components/reportes/precision/precision.component';
import { PorIntervaloComponent } from './components/reportes/precision/por-intervalo.component';
import { AddExternalUserComponent } from './components/config/add-external-user.component';
import { ChangeSupervisorComponent } from './components/config/change-supervisor.component';
import { PyaComponent } from './components/monitors/pya/pya.component';
import { CambioPdvComponent } from './components/pdv/cambio-pdv.component';
import { TestComponent } from './test/test/test.component';
import { LiveTabComponent } from './components/monitors/venta/live-tab.component';
import { AsistenciaComponent } from './components/reportes/asistencia/asistencia.component';
import { CxcAdminComponent } from './components/cxc/cxc-admin/cxc-admin.component';
import { HxConfigComponent } from './components/config/horarios/hx-config.component';
import { VentaPorCanalComponent } from './components/reportes/venta/venta-por-canal.component';
import { VentaPorCanalPdvComponent } from './components/reportes/venta/venta-por-canal-pdv.component';
import { QueuesV2Component } from './components/monitors/queues-v2/queues-v2.component';
import { PausesComponent } from './components/monitors/pauses/pauses.component';
import { MonitorPausasComponent } from './components/monitors/monitor-pausas/monitor-pausas.component';
import { RnComponent } from './components/monitors/venta/rn.component';
import { VentaPorAsesorComponent } from './components/monitors/venta-por-asesor/venta-por-asesor.component';
import { ParticipacionComponent } from './components/monitors/ivr/participacion.component';
import { DashPorHoraComponent } from './components/monitors/dash-por-hora/dash-por-hora.component';
import { StatisticsComponent } from './components/monitors/calls/statistics/statistics.component';
import { SlaComponent } from './components/monitors/sla/sla.component';
import { KpisComponent } from './components/monitors/kpis/kpis.component';
import { KpisPdvComponent } from './components/monitors/kpis-pdv/kpis-pdv.component';
import { ReportUpdatesComponent } from './components/config/updates/report-updates.component';
import { FamsComponent } from './components/config/fams/fams.component';
import { CalendarioComponent } from './components/asistencia/calendario/calendario.component';
import { AusentismosComponent } from './components/asistencia/ausentismos/ausentismos.component';
import { AleatoriedadComponent } from './components/reportes/calidad/aleatoriedad/aleatoriedad.component';
import { BonosComponent } from './components/reportes/bonos/bonos.component';
import { AusHistoricoComponent } from './components/asistencia/ausentismos/aus-historico/aus-historico.component';
import { PbxStatusComponent } from './shared/pbx-status/pbx-status.component';
import { CambioLocalizadorAsesorComponent } from './components/config/cambio-localizador-asesor/cambio-localizador-asesor.component';
import { SearchAsesorComponent } from './shared/search-asesor/search-asesor.component';
import { AsesoresFotosComponent } from './components/config/asesores-fotos/asesores-fotos.component';
import { UploadCalidadComponent } from './components/config/upload-calidad/upload-calidad.component';
import { UploadLogsPdvComponent } from './components/config/upload-logs-pdv.component';
import { TablafComponent } from './components/reportes/tablaf/tablaf.component';
import { TablafSoporteComponent } from './components/reportes/tablaf/tablaf-soporte.component';
import { SetHorariosComponent } from './components/config/set-horarios/set-horarios.component';
import { OutletComponent } from './components/formularios/outlet/outlet.component';
import { DbOutletComponent } from './components/formularios/outlet/db/db-outlet.component';
import { ProReportComponent } from './components/reportes/pro-report/pro-report.component';
import { PollsComponent } from './components/formularios/polls/polls.component';
import { DashOutletComponent } from './components/monitors/dash-outlet/dash-outlet.component';
import { Ovirtual2018Component } from './components/monitors/dash-outlet/ovirtual2018.component';
import { DiasPendientesComponent } from './components/asistencia/dias-pendientes/dias-pendientes.component';
import { DetalleAsesoresComponent } from './components/hc/detalle-asesores/detalle-asesores.component';
import { StepsComponent } from './addon/steps/steps.component';
import { QuinielaComponent } from './components/mundial/quiniela/quiniela.component';
import { ResultadosMundialComponent } from './components/mundial/resultados-mundial/resultados-mundial.component';
import { MainContentComponent } from './mainPages/main-content.component';
import { AfiliadosComponent } from './affiliatePages/afiliados.component';
import { ReporteAfiliadosComponent } from './components/reportes/reporte-afiliados/reporte-afiliados.component';
import { CargaHorariosComponent } from './components/asistencia/carga-horarios/carga-horarios.component';
import { ProgramacionComponent } from './components/asistencia/programacion/programacion.component';
import { CambioTurnoComponent } from './components/asistencia/cambio-turno/cambio-turno.component';
import { VentaPorCanalMtComponent } from './components/reportes/venta/venta-por-canal-mt.component';
import { SaleIndexMonitorComponent } from './components/monitors/sale-index-monitor/sale-index-monitor.component';
import { CxcRegistroComponent } from './components/cxc/cxc-registro/cxc-registro.component';
import { CxcAplicablesComponent } from './components/cxc/cxc-aplicables/cxc-aplicables.component';
import { BitacoraComponent } from './components/monitors/bitacora/bitacora.component';
import { SurveyComponent } from './components/formularios/survey/survey.component';
import { SurveyReportComponent } from './components/reportes/survey-report/survey-report.component';
import { HcControlComponent } from './components/hc/hc-control/hc-control.component';
import { AltasBatchComponent } from './components/hc/altas-batch/altas-batch.component';
import { QueuesV3Component } from './components/monitors/queues-v3/queues-v3.component';
import { EvaluacionDesempenoComponent } from './components/rrhh/evaluacion-desempeno/evaluacion-desempeno.component';
import { CallStatisticsComponent } from './components/monitors/calls/call-statistics.component';
import { MultipleCallStatsComponent } from './components/monitors/calls/multiple-call-stats.component';
import { HcPdvComponent } from './components/hc/hc-pdv/hc-pdv.component';
import { PdvSuperAssignComponent } from './components/config/pdv-super-assign/pdv-super-assign.component';
import { CcSuperAssignComponent } from './components/config/cc-super-assign/cc-super-assign.component';


const APP_ROUTES: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // DetalleAsesores
  { path: 'detail-asesor', component: DetalleAsesoresComponent },
  { path: 'detail-asesor/:id', component: DetalleAsesoresComponent },
  { path: 'detail-asesor/:id/:tipo', component: DetalleAsesoresComponent },
  { path: 'asesores-fotos', component: AsesoresFotosComponent },
  { path: 'detalle-asesores', component: DetalleAsesoresComponent },
  { path: 'detalle-asesores/:id', component: DetalleAsesoresComponent },
  { path: 'detalle-asesores/:id/:tipo', component: DetalleAsesoresComponent },
  { path: 'altasBatch', component: AltasBatchComponent },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forecastProgramacion', component: ForecastProgramacionComponent },

  // Vacantes
  { path: 'vacantesPDV', component: HcPdvComponent },
  { path: 'vacantes', component: HcControlComponent },
  { path: 'vacantes/:type', component: HcControlComponent },
  { path: 'vacantes/:type/:udn', component: HcControlComponent },
  { path: 'vacantes/:type/:udn/:area', component: HcControlComponent },
  { path: 'vacantes/:type/:udn/:area/:dep', component: HcControlComponent },
  { path: 'vacantes/:type/:udn/:area/:dep/:puesto', component: HcControlComponent },
  { path: 'vacantes/:type/:udn/:area/:dep/:puesto/:alias', component: HcControlComponent },

  // RRHH
  { path: 'aprobaciones_rrhh', component: AprobacionesComponent },
  { path: 'nomina', component: PrenominaComponent },
  { path: 'prenomina', component: PrenominaComponent },
  { path: 'aprobarVacantes', component: AprobarVacantesComponent },
  { path: 'evaluacionesDesempeno', component: EvaluacionDesempenoComponent },
  { path: 'evaluacionesDesempeno/:asesor', component: EvaluacionDesempenoComponent },

  // Asistencia
  { path: 'asistencia/calendario', component: CalendarioComponent },
  { path: 'asistencia/ausentismos', component: AusentismosComponent },
  { path: 'asistencia/diasPendientes', component: DiasPendientesComponent },
  { path: 'asistencia/cargaHorarios', component: CargaHorariosComponent },
  { path: 'asistencia/programacion', component: ProgramacionComponent },
  { path: 'asistencia/cambioTurno', component: CambioTurnoComponent },

  // Reportes
  { path: 'cuartiles', component: CuartilesComponent },
  { path: 'precisionPronostico', component: PrecisionComponent },
  { path: 'precisionPorIntervalo', component: PorIntervaloComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'mp/ventaPorCanal', component: VentaPorCanalComponent },
  { path: 'mt/ventaPorCanal', component: VentaPorCanalMtComponent },
  { path: 'mp/ventaPorPdv', component: VentaPorCanalPdvComponent },
  { path: 'calidad/aleatoriedad', component: AleatoriedadComponent },
  { path: 'bonosCUN', component: BonosComponent },
  { path: 'tablaf', component: TablafComponent },
  { path: 'tablafSoporte', component: TablafSoporteComponent },
  { path: 'proReport', component: ProReportComponent },
  { path: 'afiliados', component: ReporteAfiliadosComponent},
  { path: 'surveyReport/:surveyId', component: SurveyReportComponent },

  // Bitacoras
  { path: 'bitacoraSupervisores', component: BitacoraSupersComponent },

  // Monitores
  { path: 'pya', component: PyaComponent },
  { path: 'ventaMonitor', component: LiveTabComponent },
  { path: 'ventaRn', component: RnComponent },
  { path: 'queues/:skill/:monitor', component: QueuesV2Component },
  { path: 'queues/:skill', component: QueuesV2Component },
  { path: 'queues', component: QueuesV2Component },
  { path: 'colas', component: QueuesV3Component },
  { path: 'pauses', component: MonitorPausasComponent },
  { path: 'pausas', component: MonitorPausasComponent },
  { path: 'ventaAsesor', component: VentaPorAsesorComponent },
  { path: 'monitors/ivrParticipacion', component: ParticipacionComponent },
  { path: 'monitors/callStatistics', component: CallStatisticsComponent },
  { path: 'monitors/multiCalls', component: MultipleCallStatsComponent },
  { path: 'dashporhora', component: DashPorHoraComponent },
  { path: 'kpis', component: KpisComponent },
  { path: 'kpisPDV', component: KpisPdvComponent },
  { path: 'sla', component: SlaComponent },
  { path: 'ovv2018', component: DashOutletComponent },
  { path: 'oVirtual2018', component: Ovirtual2018Component },
  { path: 'saleIndex', component: SaleIndexMonitorComponent },
  { path: 'bitacoraGtr', component: BitacoraComponent },

  // CXC
  { path: 'cxc', component: CxcRegistroComponent },
  { path: 'cxcAdmin', component: CxcAdminComponent },
  { path: 'cxc/rrhh', component: CxcAplicablesComponent },
  { path: 'cxc/registro', component: CxcRegistroComponent },
  { path: 'cxc/aplicacion', component: CxcAplicablesComponent },

  // Config
  { path: 'config/addExternal', component: AddExternalUserComponent },
  // { path: 'config/chgSuper', component: ChangeSupervisorComponent },
  { path: 'config/chgSuperPdv', component: PdvSuperAssignComponent },
  { path: 'config/chgSuperCC', component: CcSuperAssignComponent },
  { path: 'config/hxConfig', component: HxConfigComponent },
  { path: 'config/uploadTables', component: ReportUpdatesComponent },
  { path: 'config/fams', component: FamsComponent },
  { path: 'config/reasignacionRsva', component: CambioLocalizadorAsesorComponent },
  { path: 'config/uploadCalidad', component: UploadCalidadComponent },
  { path: 'config/uploadLogsPdv', component: UploadLogsPdvComponent },

  // PDV
  { path: 'cambios-pdvs-asesores', component: CambioPdvComponent },

  // Formularios
  { path: 'citas-outlet', component: OutletComponent },
  { path: 'db-outlet', component: DbOutletComponent },
  { path: 'survey/:surveyId', component: SurveyComponent },

  // Polls
  { path: 'polls/antifaz2018', component: PollsComponent },
  { path: 'polls/quiniela2018', component: QuinielaComponent },
  { path: 'polls/resultadosMundial2018', component: ResultadosMundialComponent },

  // Fifa
  { path: 'polls/fifaSql', component: StepsComponent },
  { path: 'notFound', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
