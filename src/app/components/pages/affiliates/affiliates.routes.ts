import { RouterModule, Routes } from '@angular/router';
import { AffiliatesComponent } from './affiliates.component';

const affiliateRoutes: Routes = [
    {
        path: 'affiliates',
        component: AffiliatesComponent,
        children: []
    }
];

export const AFFILIATE_ROUTES = RouterModule.forChild( affiliateRoutes );
