import { Component, OnInit } from '@angular/core';
import { PageHeaderService } from 'src/app/shared/page-header.service';

@Component({
  selector: 'app-supplier-login',
  templateUrl: './supplier-login.component.html',
  styleUrls: ['./supplier-login.component.scss']
})
export class SupplierLoginComponent implements OnInit {

  constructor(private pageHeaderService: PageHeaderService) { }

  ngOnInit(): void {
    this.pageHeaderService.setSidenavWidth(0);
  }

}
