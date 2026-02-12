import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'products', loadChildren: () => import('../products/products.module').then(m => m.ProductsModule) },
            { path: 'categories', loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesModule) },
            { path: 'rentals', loadChildren: () => import('../rentals/rentals.module').then(m => m.RentalsModule) },
            { path: 'orders', loadChildren: () => import('../orders/orders.module').then(m => m.OrdersModule) },
            { path: 'payments', loadChildren: () => import('../payments/payments.module').then(m => m.PaymentsModule) },
            { path: 'customers', loadChildren: () => import('../customers/customers.module').then(m => m.CustomersModule) },
            { path: 'reports', loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule) },
            // { path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule) }
        ]
    }
];

@NgModule({
    declarations: [
        LayoutComponent,
        SidebarComponent,
        HeaderComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class LayoutModule { }
