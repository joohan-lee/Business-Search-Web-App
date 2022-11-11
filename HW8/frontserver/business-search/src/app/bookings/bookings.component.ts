import { Component, OnInit } from '@angular/core';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  reservations?:any;
  constructor(public searchService: SearchService) { }

  ngOnInit(): void {
    var saved_reservations_str = localStorage.getItem("reservations");
    if(saved_reservations_str != null){
      this.searchService.reservations = JSON.parse(saved_reservations_str);
    }
  }

}
