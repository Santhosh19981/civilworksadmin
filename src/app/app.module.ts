import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthGuard } from './core/auth.guard';
import { NotFoundComponent } from './shared/not-found.component';

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
        RouterModule.forRoot(routes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
