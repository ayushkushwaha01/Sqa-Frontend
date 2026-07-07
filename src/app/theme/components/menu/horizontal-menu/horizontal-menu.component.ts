import { supplierMenuItems } from "./../menu"; // Ensure this path matches your project structure
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AppSettings } from "../../../../app.settings";
import { Settings } from "../../../../app.settings.model";
import { MenuService } from "../menu.service";
import { MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "app-horizontal-menu",
  templateUrl: "./horizontal-menu.component.html",
  styleUrls: ["./horizontal-menu.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService],
})
export class HorizontalMenuComponent implements OnInit {
  @Input("menuParentId") menuParentId: any;
  public menuItems: Array<any> = [];
  public settings: Settings;
  public currentUrl: string = "";

  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  constructor(
    public appSettings: AppSettings,
    public menuService: MenuService,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    const isClient = localStorage.getItem("isClient");
    const userType = localStorage.getItem("userType");

    // 1. Determine which menu list to use
    let activeMenuArray = [];

    if (userType === "supplier") {
      activeMenuArray = supplierMenuItems; // Use the imported supplier menu
    } else if (isClient && JSON.parse(isClient) == true) {
      activeMenuArray = this.menuService.getClientMenuItems();
    } else {
      activeMenuArray = this.menuService.getHorizontalMenuItems(); // Admin/Default
    }

    // 2. Filter by parentId AFTER selecting the correct menu list
    this.menuItems = activeMenuArray.filter(
      (item) => item.parentId == this.menuParentId,
    );

    // 3. Handle Route Changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.cdr.detectChanges();
      }
    });

    setTimeout(() => this.cdr.detectChanges(), 100);
  }

  isMenuItemActive(menu: any): boolean {
    return this.menuService.isMenuItemActive(menu);
  }

  ngAfterViewInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.settings.fixedHeader) {
          const mainContent = document.getElementById("main-content");
          if (mainContent) {
            mainContent.scrollTop = 0;
          }
        } else {
          const drawer = document.getElementsByClassName(
            "mat-drawer-content",
          )[0] as HTMLElement;
          if (drawer) {
            drawer.scrollTop = 0;
          }
        }
      }
    });
  }
}
