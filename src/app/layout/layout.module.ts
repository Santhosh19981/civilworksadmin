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
            { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule), data: { permission: 'dashboard' } },
            { path: 'products', loadChildren: () => import('../products/products.module').then(m => m.ProductsModule), data: { permission: 'products' } },
            { path: 'categories', loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesModule), data: { permission: 'categories' } },
            { path: 'rentals', loadChildren: () => import('../rentals/rentals.module').then(m => m.RentalsModule), data: { permission: 'rentals' } },
            { path: 'orders', loadChildren: () => import('../orders/orders.module').then(m => m.OrdersModule), data: { permission: 'orders' } },
            { path: 'payments', loadChildren: () => import('../payments/payments.module').then(m => m.PaymentsModule), data: { permission: 'payments' } },
            { path: 'customers', loadChildren: () => import('../customers/customers.module').then(m => m.CustomersModule), data: { permission: 'customers' } },
            { path: 'helpers', loadChildren: () => import('../helpers/helpers.module').then(m => m.HelpersModule), data: { permission: 'helpers' } },
            { path: 'members', loadChildren: () => import('../members/members.module').then(m => m.MembersModule), data: { permission: 'members' } },
            { path: 'reports', loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule), data: { permission: 'reports' } },
            { path: 'employees', loadChildren: () => import('../employees/employees.module').then(m => m.EmployeesModule), data: { permission: 'employees' } },
            { path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule), data: { permission: 'settings' } },
            { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule) }
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
