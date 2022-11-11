import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../search.service';
import { FormControl } from '@angular/forms';
import {NgForm} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import { InputParams } from '../params';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  keyword: string = '';
  distance?: number;
  category: string ='Default';
  mapped_category:string = '';
  location: string = '';
  lat: number = 0;
  lng: number = 0;
  

  isChecked:boolean = false;
  isSubmitted:boolean = false;

  //autocomplete
  searchKeywordCtrl = new FormControl();
  options: string[] = [];
  filteredKeywords: string[] = [];
  isLoading = false;
  errorMsg!: string;
  selectedMovie: any = "";
  // end_point_autocomplete = "http://localhost:3000/autocomplete/"
  end_point_autocomplete = "https://csci571-business-info-ng.wl.r.appspot.com/autocomplete/"

  // yelp backend response
  response: any; 



  constructor(private searchService: SearchService, private http: HttpClient) { }

  ngOnInit(): void {
    this.searchKeywordCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length > 0 //call http request only length of input is longer than one.
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredKeywords = [];
          this.isLoading = true;
        }),
        switchMap(value => this.http.get(this.end_point_autocomplete + value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined) {
          this.errorMsg = "unable to get data.";
          this.filteredKeywords = [];
        } else {
          this.errorMsg = "";
          for(var i = 0; i<data['categories'].length; i++){
            this.filteredKeywords.push(data['categories'][i].title);
          }
          for(var i = 0; i<data['terms'].length; i++){
            this.filteredKeywords.push(data['terms'][i].text);
          }
        }
      });
  }

  location_chkbox_click(event:Event){
    var chkbox = event.target as HTMLInputElement;
    if (chkbox.checked){
      this.isChecked = true;
      this.location = '';
    }else{
      this.isChecked = false;
    }
  }

  clearForm(){
    this.searchKeywordCtrl.reset(); //clear keyword.
    this.category = 'Default';
    this.distance = undefined;
    this.location = '';
    this.isChecked = false;
    this.isSubmitted = false;
  }

  onSubmit(){
    var category_map:any = {
      "Default": "all",
      "Arts & Entertainment": "arts",
      "Health & Medical": "health",
      "Hotels & Travel": "hotelstravel",
      "Food": "food",
      "Professional Services": "professional"
    }
    this.mapped_category = category_map[this.category];
    
    this.getLatLng();
    
    this.isSubmitted = true;
    

  }

  getLatLng(){
    
    // get latitude and longitude
    var lat;
    var lng;
    if(this.isChecked){// if auto-detect is checked      
      // call ipinfo
      var ipinfo_url = "https://ipinfo.io/json?token=";
      var token = "0a6365ed9b2d4b";
      this.http.get(ipinfo_url + token)
      .subscribe((data:any)=>{
        var loc = data['loc'].split(',');
        lat = loc[0];
        lng = loc[1];
        // callback(this.searchService, lat, lng);
        if(this.distance == undefined){this.distance = 10;}
        this.searchService.getBusiness(this.searchKeywordCtrl.value, lat, lng, this.mapped_category, this.distance)
          .subscribe(data => {
            this.response = data;
          });
      });
    }else{
      // call google geocoding api
      this.searchService.getGeocoding(this.location)
        .subscribe((data)=>{
          if (data['results'].length == 0){
            alert('No Geocoding API results with given location, "' + this.location + '". Please try again with another location.');
            location.reload();
          }
          else{
            lat = data['results'][0]['geometry']['location']['lat'];
            lng = data['results'][0]['geometry']['location']['lng'];
            // callback(this.searchService, lat, lng);
            if(this.distance == undefined){this.distance = 10;}
            this.searchService.getBusiness(this.searchKeywordCtrl.value, lat, lng, this.mapped_category, this.distance)
            .subscribe(data => {
              this.response = data;
            });
          }
        });
    }
    
  }

  cleanPreviousSearch(){
    // clean searchServices.business (clean previous search result.) before submitting
    this.searchService.businesses = undefined;
  }

}

