import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { CatalogueComponent } from './pages/catalogue/catalogue.component';
import { CartComponent } from './pages/cart/cart.component';

export const routes: Routes = [
    { 
        path: '', redirectTo: '/main-page', pathMatch: 'full' //default route
    }, 
    {
        path: 'main-page',
        component: MainPageComponent
    },
    {
        path: 'catalogue',
        component: CatalogueComponent
    },
    {
        path: 'cart',
        component: CartComponent
    },
    
];
