import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-review-detail',
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.css']
})
export class ReviewDetailComponent implements OnInit {
  @Input() reviewArray?: Array<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
