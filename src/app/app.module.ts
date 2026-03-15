import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthGuard } from './core/auth.guard';
import { NotFoundComponent } from './shared/not-found.component';
import { SharedModule } from './shared/shared.module';
import { AuthInterceptor } from './core/auth.interceptor';

const routes: Routes = [
    { path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
    {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule)
    },
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '404' }
];

@NgModule({
    declarations: [
        AppComponent,
        NotFoundComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        RouterModule.forRoot(routes)
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
