import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.css']
})
export class BusinessDetailComponent implements OnInit {
  @Input() detailedInfo?: any;
  @Input() displayData?: any;


  is_open_now?: boolean; // if true, 'Open Now' in green color, false, 'Closed' in red. if undefined, don't display.
  display_url?: string;

  constructor(public searchService: SearchService) { }

  ngOnInit(): void {
    // whenever page is changed, check localStorage to see if the business is already reserved or not.
    var saved_reservations_str = localStorage.getItem("reservations");
    var saved_reservations = [];
    if(saved_reservations_str != null){
      saved_reservations = JSON.parse(saved_reservations_str);
    }

    this.searchService.is_reserved= false;

    for(var i=0; i < saved_reservations.length; i++){
      var reservation = saved_reservations[i];
      if(reservation.business_name == this.searchService.selectedBusinessName){
        // if the business is already reserved,(which means its name is already in localStorage)
        this.searchService.is_reserved = true;
      }
    }
  }

  shareTwitter(){
    var sentence = "Check " + this.searchService.selectedBusinessName + " on Yelp.";
    var share_url = "http://twitter.com/intent/tweet?text=" + sentence + " " + this.detailedInfo.url + "\n"; //url base
    window.open(share_url);
  }

  shareFacebook(){
    var share_url = "http://facebook.com/sharer/sharer.php?u=" + this.detailedInfo.url + "\n"; //url base
    window.open(share_url);
  }

}
