import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SearchComponent } from './search/search.component';
import { BookingsComponent } from './bookings/bookings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- NgModel은 이 패키지가 제공합니다.
import { HttpClientModule } from '@angular/common/http';



// Material autocomplete Modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { BusinesslistComponent } from './businesslist/businesslist.component';

// Material tabs modules
import { MatTabsModule } from '@angular/material/tabs';
import { BusinessDetailComponent } from './business-detail/business-detail.component';

import { GoogleMapsModule } from '@angular/google-maps';
import { ReviewDetailComponent } from './review-detail/review-detail.component'


@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    BookingsComponent,
    BusinesslistComponent,
    BusinessDetailComponent,
    ReviewDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatTabsModule,
    GoogleMapsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
