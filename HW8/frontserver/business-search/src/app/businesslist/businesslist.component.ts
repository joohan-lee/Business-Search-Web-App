import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SearchService } from '../search.service';
import { FormGroup } from '@angular/forms';
import { InputParams } from '../params';


@Component({
  selector: 'app-businesslist',
  templateUrl: './businesslist.component.html',
  styleUrls: ['./businesslist.component.css']
})
export class BusinesslistComponent implements OnInit {
  @Input() isSubmitted?: boolean;

  isDetail: boolean = false;
  selectedBusinessName: string = '';

  detailedInfo?:any;
  displayData:any = {};

  //reservation
  reservation = {business_name: this.selectedBusinessName, email:'', date:'', time_hour:'', time_minute:''};
  was_validated:boolean = false;
  reserveForm!: FormGroup;
  today_yyyy_mm_dd: string = this.setToday();

  // google map
  mapOptions: google.maps.MapOptions = {
    center: { lat: 38.9987208, lng: -77.2538699 },
    zoom : 14
  }
  marker = {
      position: { lat: 38.9987208, lng: -77.2538699 },
  }

  // review data
  reviewArray?:Array<any>;

   
  constructor(public searchService: SearchService) { }

  ngOnInit(): void {
  }

  // Example starter JavaScript for disabling form submissions if there are invalid fields
  reserveSubmit() {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event:any) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }

          form.classList.add('was-validated')
        }, false)
      })
      this.was_validated = true;
      this.reservation.business_name = this.selectedBusinessName;
      
      if(this.reservation.business_name != '' && this.reservation.date!='' && this.reservation.email != '' && 
        this.reservation.time_hour !='' && this.reservation.time_minute!=''){ //if all input was successfully validated,
          //get current reservations from localStorage.
          var saved_reservations_str = localStorage.getItem("reservations");
          var saved_reservations = [];
          if(saved_reservations_str != null){
            saved_reservations = JSON.parse(saved_reservations_str);
          }
          saved_reservations.push(this.reservation)

          // save reservations
          localStorage.setItem("reservations", JSON.stringify(saved_reservations));
          alert('Reservation created!');

          // close modal
          var close_btn = document.getElementById('modal_close_btn');
          close_btn?.click();
          
          // change the reserve button to cancel button
          this.searchService.is_reserved = true;
          this.searchService.reservations =saved_reservations;
      }
  }

  setToday(){
    let today = new Date();
    var year = today.getFullYear();
    var month = '' + (today.getMonth() + 1);
    var day = '' + today.getDate();
    if(month.length < 2){
      month = '0' + month;
    }
    if(day.length < 2){
      day = '0' + day;
    }
    // this.today_yyyy_mm_dd = year + '-' + month + '-' + day;

    return year + '-' + month + '-' + day;
  }

  showDetail(business:any){
    this.isDetail = true;
    this.selectedBusinessName = business.name;
    this.searchService.selectedBusinessName = business.name;
    const selectedBusinessId = business.id;
    this.searchService.getBusinessDetail(selectedBusinessId)
      .then(data=>{
        this.detailedInfo = data;
        /*Process data to display detail*/
        // Address
        this.displayData['address'] = data.location.display_address;
        // Categories
        this.displayData.categories = '';
        for(var i = 0; i < data.categories.length; i++){
          this.displayData.categories += data.categories[i]['title'];
          if(i<data.categories.length-1) this.displayData.categories += " | ";
        } 
        // Phone
        this.displayData.phone = data.display_phone;
        // Price range
        this.displayData.price_rng = data.price;
        // Status
        var hours = data.hours;
        if(hours != undefined && hours.length > 0){
          this.displayData.is_open_now = hours[0]['is_open_now'];
        }
        // URL
        this.displayData.url = data.url;
        // Photos
        this.displayData.photos_url_arr = data.photos;
      });
  }

  backToList(){
    this.isDetail=false;
  }

  mapClick(event:any){
    if(event.index == 1) { // if clicked mat-tab is Map. (index 1)
      this.mapOptions = {
        center:{
          lat: this.detailedInfo['coordinates']['latitude'],
          lng: this.detailedInfo['coordinates']['longitude']
        },
        zoom:14
      };
      this.marker = {
        position:{
          lat : this.detailedInfo['coordinates']['latitude'],
          lng : this.detailedInfo['coordinates']['longitude']
        }
      };
    }
    else if(event.index==2){ // if clicked mat-tab is review(index 2).
      if(this.reviewArray == undefined){
        this.searchService.getReviews(this.detailedInfo.id)
          .then(data=>{
            this.reviewArray = data['reviews']; // extract only reviews.
          })
      }
    }
      
  }
  

}
