import { RouterModule, Routes } from '@angular/router';
import { DetailAsesorComponent } from './components/detail-asesor/detail-asesor.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/shared/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForecastProgramacionComponent } from './components/forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from './components/hc/vacantes.component';
import { AprobacionesComponent } from './components/rrhh/aprobaciones.component';
import { PrenominaComponent } from './components/rrhh/prenomina/prenomina.component';
import { CxcComponent } from './components/rrhh/cxc.component';
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
import { CxcAdminComponent } from './components/reportes/cxc/cxc-admin.component';
import { HxConfigComponent } from './components/config/horarios/hx-config.component';
import { VentaPorCanalComponent } from './components/reportes/venta/venta-por-canal.component';
import { QueuesComponent } from './components/monitors/queues/queues.component';
import { QueuesV2Component } from './components/monitors/queues-v2/queues-v2.component';
import { PausesComponent } from './components/monitors/pauses/pauses.component';
import { MonitorPausasComponent } from './components/monitors/monitor-pausas/monitor-pausas.component';
import { RnComponent } from './components/monitors/venta/rn.component';
import { VentaPorAsesorComponent } from './components/monitors/venta-por-asesor/venta-por-asesor.component';
import { ParticipacionComponent } from './components/monitors/ivr/participacion.component';
import { DashPorHoraComponent } from './components/monitors/dash-por-hora/dash-por-hora.component';
import { StatisticsComponent } from './components/monitors/calls/statistics/statistics.component';
import { KpisComponent } from './components/monitors/kpis/kpis.component';
import { ReportUpdatesComponent } from './components/config/updates/report-updates.component';
import { FamsComponent } from './components/config/fams/fams.component';
import { CalendarioComponent } from './components/asistencia/calendario/calendario.component';
import { AusentismosComponent } from './components/asistencia/ausentismos/ausentismos.component';
import { AleatoriedadComponent } from './components/reportes/calidad/aleatoriedad/aleatoriedad.component';
import { AusHistoricoComponent } from './components/asistencia/ausentismos/aus-historico/aus-historico.component';
import { PbxStatusComponent } from './addon/pbx-status/pbx-status.component';
import { CambioLocalizadorAsesorComponent } from './components/config/cambio-localizador-asesor/cambio-localizador-asesor.component';
import { SearchAsesorComponent } from './addon/search-asesor/search-asesor.component';


const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'test', component: TestComponent },

  // DetalleAsesores
  { path: 'detail-asesor', component: DetailAsesorComponent },
  { path: 'detail-asesor/:id', component: DetailAsesorComponent },
  { path: 'detail-asesor/:id/:tipo', component: DetailAsesorComponent },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'notFound', component: NotFoundComponent },
  { path: 'forecastProgramacion', component: ForecastProgramacionComponent },

  // Vacantes
  { path: 'vacantes', component: VacantesComponent },
  { path: 'vacantes/:type', component: VacantesComponent },
  { path: 'vacantes/:type/:udn', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area/:dep', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area/:dep/:puesto', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area/:dep/:puesto/:alias', component: VacantesComponent },

  // RRHH
  { path: 'aprobaciones_rrhh', component: AprobacionesComponent },
  { path: 'nomina', component: PrenominaComponent },
  { path: 'prenomina', component: PrenominaComponent },
  { path: 'aprobarVacantes', component: AprobarVacantesComponent },

  // Asistencia
  { path: 'asistencia/calendario', component: CalendarioComponent },
  { path: 'asistencia/ausentismos', component: AusentismosComponent },

  // Reportes
  { path: 'cuartiles', component: CuartilesComponent },
  { path: 'precisionPronostico', component: PrecisionComponent },
  { path: 'precisionPorIntervalo', component: PorIntervaloComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'mp/ventaPorCanal', component: VentaPorCanalComponent },
  { path: 'calidad/aleatoriedad', component: AleatoriedadComponent },

  //Bitacoras
  { path: 'bitacoraSupervisores', component: BitacoraSupersComponent },

  //Monitores
  { path: 'pya', component: PyaComponent },
  { path: 'ventaMonitor', component: LiveTabComponent },
  { path: 'ventaRn', component: RnComponent },
  { path: 'queues', component: QueuesV2Component },
  { path: 'queues2', component: QueuesV2Component },
  { path: 'pauses', component: MonitorPausasComponent },
  { path: 'pausas', component: MonitorPausasComponent },
  { path: 'ventaAsesor', component: VentaPorAsesorComponent },
  { path: 'monitors/ivrParticipacion', component: ParticipacionComponent },
  { path: 'monitors/callStatistics', component: StatisticsComponent },
  { path: 'dashporhora', component: DashPorHoraComponent },
  { path: 'kpis', component: KpisComponent },

  // CXC
  { path: 'cxc', component: CxcComponent },
  { path: 'cxcAdmin', component: CxcAdminComponent },
  { path: 'cxc/rrhh', component: ApplyAllCxcComponent },
  { path: 'cxc/rrhh/:filter', component: ApplyAllCxcComponent },

  // Config
  { path: 'config/addExternal', component: AddExternalUserComponent },
  { path: 'config/chgSuper', component: ChangeSupervisorComponent },
  { path: 'config/hxConfig', component: HxConfigComponent },
  { path: 'config/uploadTables', component: ReportUpdatesComponent },
  { path: 'config/fams', component: FamsComponent },
  { path: 'config/reasignacionRsva', component: CambioLocalizadorAsesorComponent },

  // PDV
  { path: 'cambios-pdvs-asesores', component: CambioPdvComponent },

  //test
  { path: 'test', component: TestComponent },

  { path: '**', pathMatch: 'full', redirectTo: 'notFound' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
