import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';
import { HomeComponent } from '../../home/home.component';
import { StepsComponent } from '../../../addon/steps/steps.component';
import { DetalleAsesoresComponent } from '../../hc/detalle-asesores/detalle-asesores.component';
import { AsesoresFotosComponent } from '../../config/asesores-fotos/asesores-fotos.component';
import { LoginComponent } from '../../shared/login/login.component';
import { NotFoundComponent } from '../../not-found/not-found.component';
import { ForecastProgramacionComponent } from '../../forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from '../../hc/vacantes.component';
import { AprobacionesComponent } from '../../rrhh/aprobaciones.component';
import { PrenominaComponent } from '../../rrhh/prenomina/prenomina.component';
import { AprobarVacantesComponent } from '../../rrhh/aprobar-vacantes.component';
import { CalendarioComponent } from '../../asistencia/calendario/calendario.component';
import { AusentismosComponent } from '../../asistencia/ausentismos/ausentismos.component';
import { DiasPendientesComponent } from '../../asistencia/dias-pendientes/dias-pendientes.component';
import { CuartilesComponent } from '../../reportes/cuartiles/cuartiles.component';
import { PorIntervaloComponent } from '../../reportes/precision/por-intervalo.component';
import { AsistenciaComponent } from '../../reportes/asistencia/asistencia.component';
import { PrecisionComponent } from '../../reportes/precision/precision.component';
import { VentaPorCanalPdvComponent } from '../../reportes/venta/venta-por-canal-pdv.component';
import { Ovirtual2018Component } from '../../monitors/dash-outlet/ovirtual2018.component';
import { SlaComponent } from '../../monitors/sla/sla.component';
import { DashOutletComponent } from '../../monitors/dash-outlet/dash-outlet.component';
import { KpisPdvComponent } from '../../monitors/kpis-pdv/kpis-pdv.component';
import { KpisComponent } from '../../monitors/kpis/kpis.component';
import { ParticipacionComponent } from '../../monitors/ivr/participacion.component';
import { PyaComponent } from '../../monitors/pya/pya.component';
import { QueuesV2Component } from '../../monitors/queues-v2/queues-v2.component';
import { VentaPorCanalComponent } from '../../reportes/venta/venta-por-canal.component';
import { BonosComponent } from '../../reportes/bonos/bonos.component';
import { AleatoriedadComponent } from '../../reportes/calidad/aleatoriedad/aleatoriedad.component';
import { TablafComponent } from '../../reportes/tablaf/tablaf.component';
import { ProReportComponent } from '../../reportes/pro-report/pro-report.component';
import { TablafSoporteComponent } from '../../reportes/tablaf/tablaf-soporte.component';
import { BitacoraSupersComponent } from '../../formularios/bitacora-supers/bitacora-supers.component';
import { LiveTabComponent } from '../../monitors/venta/live-tab.component';
import { RnComponent } from '../../monitors/venta/rn.component';
import { MonitorPausasComponent } from '../../monitors/monitor-pausas/monitor-pausas.component';
import { VentaPorAsesorComponent } from '../../monitors/venta-por-asesor/venta-por-asesor.component';
import { DashPorHoraComponent } from '../../monitors/dash-por-hora/dash-por-hora.component';
import { StatisticsComponent } from '../../monitors/calls/statistics/statistics.component';
import { ResultadosMundialComponent } from '../../mundial/resultados-mundial/resultados-mundial.component';
import { QuinielaComponent } from '../../mundial/quiniela/quiniela.component';
import { PollsComponent } from '../../formularios/polls/polls.component';
import { CambioLocalizadorAsesorComponent } from '../../config/cambio-localizador-asesor/cambio-localizador-asesor.component';
import { CxcComponent } from '../../rrhh/cxc.component';
import { ApplyAllCxcComponent } from '../../formularios/apply-all-cxc.component';
import { CxcAdminComponent } from '../../reportes/cxc/cxc-admin.component';
import { AddExternalUserComponent } from '../../config/add-external-user.component';
import { ChangeSupervisorComponent } from '../../config/change-supervisor.component';
import { HxConfigComponent } from '../../config/horarios/hx-config.component';
import { FamsComponent } from '../../config/fams/fams.component';
import { ReportUpdatesComponent } from '../../config/updates/report-updates.component';
import { UploadLogsPdvComponent } from '../../config/upload-logs-pdv.component';
import { UploadCalidadComponent } from '../../config/upload-calidad/upload-calidad.component';
import { CambioPdvComponent } from '../../pdv/cambio-pdv.component';
import { OutletComponent } from '../../formularios/outlet/outlet.component';
import { DbOutletComponent } from '../../formularios/outlet/db/db-outlet.component';

const mainRoutes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
              { path: 'home', component: HomeComponent },
              { path: 'test', component: StepsComponent },

              // DetalleAsesores
              { path: 'detail-asesor', component: DetalleAsesoresComponent },
              { path: 'detail-asesor/:id', component: DetalleAsesoresComponent },
              { path: 'detail-asesor/:id/:tipo', component: DetalleAsesoresComponent },
              { path: 'asesores-fotos', component: AsesoresFotosComponent },
              { path: 'detalle-asesores', component: DetalleAsesoresComponent },
              { path: 'detalle-asesores/:id', component: DetalleAsesoresComponent },
              { path: 'detalle-asesores/:id/:tipo', component: DetalleAsesoresComponent },

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
              { path: 'asistencia/diasPendientes', component: DiasPendientesComponent },

              // Reportes
              { path: 'cuartiles', component: CuartilesComponent },
              { path: 'precisionPronostico', component: PrecisionComponent },
              { path: 'precisionPorIntervalo', component: PorIntervaloComponent },
              { path: 'asistencia', component: AsistenciaComponent },
              { path: 'mp/ventaPorCanal', component: VentaPorCanalComponent },
              { path: 'mp/ventaPorPdv', component: VentaPorCanalPdvComponent },
              { path: 'calidad/aleatoriedad', component: AleatoriedadComponent },
              { path: 'bonosCUN', component: BonosComponent },
              { path: 'tablaf', component: TablafComponent },
              { path: 'tablafSoporte', component: TablafSoporteComponent },
              { path: 'proReport', component: ProReportComponent },

              // Bitacoras
              { path: 'bitacoraSupervisores', component: BitacoraSupersComponent },

              // Monitores
              { path: 'pya', component: PyaComponent },
              { path: 'ventaMonitor', component: LiveTabComponent },
              { path: 'ventaRn', component: RnComponent },
              { path: 'queues/:skill/:monitor', component: QueuesV2Component },
              { path: 'queues/:skill', component: QueuesV2Component },
              { path: 'queues', component: QueuesV2Component },
              { path: 'pauses', component: MonitorPausasComponent },
              { path: 'pausas', component: MonitorPausasComponent },
              { path: 'ventaAsesor', component: VentaPorAsesorComponent },
              { path: 'monitors/ivrParticipacion', component: ParticipacionComponent },
              { path: 'monitors/callStatistics', component: StatisticsComponent },
              { path: 'dashporhora', component: DashPorHoraComponent },
              { path: 'kpis', component: KpisComponent },
              { path: 'kpisPDV', component: KpisPdvComponent },
              { path: 'sla', component: SlaComponent },
              { path: 'ovv2018', component: DashOutletComponent },
              { path: 'oVirtual2018', component: Ovirtual2018Component },

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
              { path: 'config/uploadCalidad', component: UploadCalidadComponent },
              { path: 'config/uploadLogsPdv', component: UploadLogsPdvComponent },

              // PDV
              { path: 'cambios-pdvs-asesores', component: CambioPdvComponent },

              // Formularios
              { path: 'citas-outlet', component: OutletComponent },
              { path: 'db-outlet', component: DbOutletComponent },

              // Polls
              { path: 'polls/antifaz2018', component: PollsComponent },
              { path: 'polls/quiniela2018', component: QuinielaComponent },
              { path: 'polls/resultadosMundial2018', component: ResultadosMundialComponent }
        ]
    },
];


export const MAIN_ROUTES = RouterModule.forChild( mainRoutes );
