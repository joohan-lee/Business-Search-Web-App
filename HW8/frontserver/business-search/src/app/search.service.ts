import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  // backserver_endpoint: string = "http://localhost:3000/";
  backserver_endpoint: string = "https://csci571-business-info-ng.wl.r.appspot.com/";

  businesses?: any;
  selectedBusinessName!: string;

  is_reserved?:boolean;
  reservations?:any;

  constructor(private http: HttpClient) { }

  getGeocoding(location: string): Observable<any>{
    var url = this.backserver_endpoint + 'geocoding/' + location;
    return this.http.get<any>(url);
  }

  getBusiness(term: string, latitude: number, longitude: number, categories:string, distance:number): Observable<any>{
    /** For Yelp API, we sent following parameters to Web server.
     1. term(keyword): string
     2. latitude: decimal
     3. longitude: decimal
     4. categories: string, comma delimited
     5. radius(distance): int , maxvalue is 25 miles
     6. limit: int, Number of business results to return. => 10*/
     var radius = Math.floor((distance) * 1609.344); // radius is in meters, so convert mile into meter. It also accepts only integer.
     if (radius > 40000){
         // Yelp API supports maximum 40000 meters distance
         radius = 40000
     }
     var limit = 10;

     var url = this.backserver_endpoint + 'searchBusiness?term=' + term + "&latitude="+ latitude + "&longitude=" 
      + longitude + "&categories=" + categories + "&radius=" + radius + "&limit=" + limit;

    var response = this.http.get<any>(url);
    response.subscribe((res) => {
      this.businesses = res['businesses'];
    });
    return response;
  }

  
  getBusinessDetail(selectedBusinessId:string){
    var url = this.backserver_endpoint + 'businessDetail/' + selectedBusinessId;
    
    return fetch(url).then(res=>res.json());
    
  }

  getReviews(businessId:string){
    var url = this.backserver_endpoint + 'reviewDetail/' + businessId;
    
    return fetch(url).then(res=>res.json());
  }
  
  cancelReserve(cancelBusinessName:string){
    // load localStorage
    var saved_reservations_str = localStorage.getItem("reservations");
    var saved_reservations = [];
    if(saved_reservations_str != null){
      saved_reservations = JSON.parse(saved_reservations_str);
    }

    // check if there is business, which is currently presented, in the localStorage.
    // if there is, remove it from localStorage.
    for(var i=0; i < saved_reservations.length; i++){
      var reservation = saved_reservations[i];
      if(reservation.business_name == cancelBusinessName){
        // if the business is already reserved,(which means its name is already in localStorage)
        // remove that reservation from the list.
        saved_reservations.splice(i, 1);
      }
    }

    // after removal, update localStorage with reservations.
    localStorage.setItem("reservations", JSON.stringify(saved_reservations));
    this.reservations = saved_reservations;
    alert('Reservation cancelled!');
    this.is_reserved = false;
  }
  
}
