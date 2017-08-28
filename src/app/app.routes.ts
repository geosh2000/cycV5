import { RouterModule, Routes } from '@angular/router';
import { DetailAsesorComponent } from './components/detail-asesor/detail-asesor.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/shared/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForecastProgramacionComponent } from './components/forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from './components/hc/vacantes.component';
import { AprobacionesComponent } from './components/rrhh/aprobaciones.component';
import { NominaComponent } from './components/rrhh/nomina.component';
import { CxcComponent } from './components/rrhh/cxc.component';
import { ApplyAllCxcComponent } from './components/formularios/apply-all-cxc.component';
import { CuartilesComponent } from './components/reportes/cuartiles/cuartiles.component';
import { PrecisionComponent } from './components/reportes/precision/precision.component';
import { TestComponent } from './test/test/test.component';

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },

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
  { path: 'nomina', component: NominaComponent },

  // Reportes
  { path: 'cuartiles', component: CuartilesComponent },
  { path: 'precisionPronostico', component: PrecisionComponent },

  // CXC
  { path: 'cxc', component: CxcComponent },
  { path: 'cxc/rrhh', component: ApplyAllCxcComponent },

  //test
  { path: 'test', component: TestComponent },

  { path: '**', pathMatch: 'full', redirectTo: 'notFound' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
