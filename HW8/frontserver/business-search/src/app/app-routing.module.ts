import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from './search/search.component';
import { BookingsComponent } from './bookings/bookings.component';

const routes: Routes = [
  { path: '',   redirectTo: '/search', pathMatch: 'full' }, // redirect to `first-component`
  { path: 'search', component: SearchComponent },
  { path: 'bookings', component: BookingsComponent },
  // { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
]; // sets up routes constant where you define your routes

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
