import { NgModule } from '@angular/core';

// Modulos
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { OrderModule } from 'ngx-order-pipe';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { RouterModule } from '@angular/router';
import { Ng2CompleterModule } from 'ng2-completer';

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
import { CdkTableModule } from '../../../node_modules/@angular/cdk/table';
import { CdkTreeModule } from '../../../node_modules/@angular/cdk/tree';

// Pipes
import { KeysPipe } from '../pipes/keys.pipe';
import { CapitalizadoPipe } from '../pipes/capitalizado.pipe';

// Components
import { AsistenciaBadgeComponent } from './buttons/asistencia-badge/asistencia-badge.component';
import { BonoApproveComponent } from './buttons/bono-approve/bono-approve.component';
import { ExtraSwitchComponent } from './buttons/extra-switch/extra-switch.component';
import { PuntualidadBadgeComponent } from './buttons/puntualidad-badge/puntualidad-badge.component';
import { SaBadgeComponent } from './buttons/sa-badge/sa-badge.component';
import { CountdownComponent } from './countdown/countdown.component';
import { CountdownMetaComponent } from './countdown-meta/countdown-meta.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PbxStatusComponent } from './pbx-status/pbx-status.component';
import { SearchAsesorComponent } from './search-asesor/search-asesor.component';
import { TableTemplateComponent } from './table-template/table-template.component';
import { CsvComponent } from './upload/csv/csv.component';
import { CumplimientoComponent } from './progress/cumplimiento/cumplimiento.component';
import { AsesorFilterComponent } from './filters/asesor-filter/asesor-filter.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AvisosGlobalesComponent } from './avisos-globales/avisos-globales.component';



@NgModule({
    imports: [
        CommonModule,
        NgbModule.forRoot(),
        FormsModule, ReactiveFormsModule,
        UiSwitchModule,
        OrderModule,
        MultiselectDropdownModule,
        RouterModule,
        Ng2CompleterModule,

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
    ],
    declarations:  [

        // Pipes
        KeysPipe,
        CapitalizadoPipe,

        // Components
        AsistenciaBadgeComponent,
        BonoApproveComponent,
        ExtraSwitchComponent,
        PuntualidadBadgeComponent,
        SaBadgeComponent,
        CountdownComponent,
        CountdownMetaComponent,
        AsesorFilterComponent,
        LoginComponent,
        LogoutComponent,
        NavbarComponent,
        PbxStatusComponent,
        CumplimientoComponent,
        SearchAsesorComponent,
        TableTemplateComponent,
        CsvComponent,
        UserPreferencesComponent,
        SidebarComponent,
        AvisosGlobalesComponent,

    ],
    exports: [

        // Pipes
        KeysPipe,
        CapitalizadoPipe,

        // Components
        AsistenciaBadgeComponent,
        BonoApproveComponent,
        ExtraSwitchComponent,
        PuntualidadBadgeComponent,
        SaBadgeComponent,
        CountdownComponent,
        CountdownMetaComponent,
        AsesorFilterComponent,
        LoginComponent,
        LogoutComponent,
        NavbarComponent,
        PbxStatusComponent,
        CumplimientoComponent,
        SearchAsesorComponent,
        TableTemplateComponent,
        CsvComponent,
        SidebarComponent,
        UserPreferencesComponent,
        AvisosGlobalesComponent,

    ]
})
export class SharedModule { }
