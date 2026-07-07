import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, UrlSegment, NavigationEnd } from "@angular/router"; 
import { Title } from '@angular/platform-browser';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

    public pageTitle!: string;
    public Header!: string;
    public breadcrumbs: {
        name: string;
        url: string;
        description: string;
    }[] = [];
    description: string = '';
    public settings: Settings;
    
    // ✅ Existing Flags
    public isManageUsersRoute: boolean = false;
    public isAdminSettingsRoute: boolean = false;

    // ✅ New Flags for Supplier routes
    public isSupplierInspectionRoute: boolean = false;
    public isSupplierPartsRoute: boolean = false;
    public isSupplierProcessRoute: boolean = false;
    public isSupplierDashboardRoute: boolean = false;

    constructor(
        public appSettings: AppSettings,
        public router: Router, 
        public activatedRoute: ActivatedRoute,                
        public title: Title
    ) {
        this.settings = this.appSettings.settings; 
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.buildBreadcrumbs();
            }
        });   
    }

    ngOnInit(): void {
        this.buildBreadcrumbs();
    }

    private buildBreadcrumbs(): void {
        this.breadcrumbs = [];                
        this.parseRoute(this.router.routerState.snapshot.root); 
        this.pageTitle = "";
        let foundDescription = "";
        this.breadcrumbs.forEach(breadcrumb => {
            this.pageTitle += ' | ' + breadcrumb.name;
            this.Header = breadcrumb.name;
            if (breadcrumb.description) {
                foundDescription = breadcrumb.description;
            }
        });       
        this.description = foundDescription;
        this.title.setTitle(this.settings.name + this.pageTitle);

        // ✅ Check Admin routes
        this.isManageUsersRoute = this.router.url.includes('/app/admin/manage-users');

        const adminSettingsRoutes = [
            '/app/admin/settings',
            '/app/admin/departments',
            '/app/admin/lookups',
            '/app/admin/event-log',
            '/app/admin/escalation'
        ];
        this.isAdminSettingsRoute = adminSettingsRoutes.some(route => this.router.url.includes(route));

        // ✅ Check Supplier 4 distinct routes
        this.isSupplierInspectionRoute = this.router.url.includes('/app/supplier-login/inspection/');
        this.isSupplierPartsRoute = this.router.url.includes('/app/supplier-login/parts-audits/');
        this.isSupplierProcessRoute = this.router.url.includes('/app/supplier-login/process-audits/');
        this.isSupplierDashboardRoute = this.router.url.includes('/app/supplier-login/dashboard');
    }

    private parseRoute(node: ActivatedRouteSnapshot) { 
        if (node.data['breadcrumb'] && !node.data['hideBreadcrumb']) {
            if (node.url.length) {
                let urlSegments: UrlSegment[] = [];
                node.pathFromRoot.forEach(routerState => {
                    urlSegments = urlSegments.concat(routerState.url);
                });
                let url = urlSegments.map(urlSegment => urlSegment.path).join('/');
                this.breadcrumbs.push({
                    name: node.data['breadcrumb'],
                    url: '/' + url,
                    description: node.data['description'],
                });
            }
        }
        if (node.firstChild) {
            this.parseRoute(node.firstChild);
        }
    }

    public closeSubMenus() {
        let menu = document.querySelector(".sidenav-menu-outer");
        if (menu) {
            for (let i = 0; i < menu.children[0].children.length; i++) {
                let child = menu.children[0].children[i];
                if (child) {
                    if (child.children[0].classList.contains('expanded')) {
                        child.children[0].classList.remove('expanded');
                        child.children[1].classList.remove('show');
                    }
                }
            }
        }
    }
}