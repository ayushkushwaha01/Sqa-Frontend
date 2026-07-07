import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-master-data',
  templateUrl: './test-master-data.component.html',
  styleUrls: ['./test-master-data.component.scss']
})
export class TestMasterDataComponent implements OnInit {
constructor() { }
  ngOnInit() { }


  isNavOpen = true;

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }
}
