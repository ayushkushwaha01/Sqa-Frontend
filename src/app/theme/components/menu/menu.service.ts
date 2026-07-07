import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Menu } from './menu.model';
import { verticalMenuItems, horizontalMenuItems, clientMenuItems } from './menu';

@Injectable()
export class MenuService {

  constructor(private location:Location,
              private router:Router){ } 
    
  public getVerticalMenuItems():Array<Menu> {
    return verticalMenuItems;
  }

  public getHorizontalMenuItems():Array<Menu> {
    return horizontalMenuItems;
  }
  public getClientMenuItems():Array<Menu> {
    return clientMenuItems;
  }

  public expandActiveSubMenu(menu:Array<Menu>){
      let url = this.location.path();
      let routerLink = url; // url.substring(1, url.length);
      let activeMenuItem = menu.filter(item => item.routerLink === routerLink);
      if(activeMenuItem[0]){
        let menuItem = activeMenuItem[0];
        while (menuItem.parentId != 0){  
          let parentMenuItem = menu.filter(item => item.id == menuItem.parentId)[0];
          menuItem = parentMenuItem;
          this.toggleMenuItem(menuItem.id);
        }
      }
  }

  public toggleMenuItem(menuId){
    let menuItem = document.getElementById('menu-item-'+menuId);
    let subMenu = document.getElementById('sub-menu-'+menuId);  
    if(subMenu){
      if(subMenu.classList.contains('show')){
        subMenu.classList.remove('show');
        menuItem.classList.remove('expanded');
      }
      else{
        subMenu.classList.add('show');
        menuItem.classList.add('expanded');
      }      
    }
  }

  public closeOtherSubMenus(menu:Array<Menu>, menuId){
    let currentMenuItem = menu.filter(item => item.id == menuId)[0]; 
    if(currentMenuItem.parentId == 0 && !currentMenuItem.target){
      menu.forEach(item => {
        if(item.id != menuId){
          let subMenu = document.getElementById('sub-menu-'+item.id);
          let menuItem = document.getElementById('menu-item-'+item.id);
          if(subMenu){
            if(subMenu.classList.contains('show')){
              subMenu.classList.remove('show');
              menuItem.classList.remove('expanded');
            }              
          } 
        }
      });
    }
  }

  isMenuItemActive(menu: any): boolean {
    const routerUrl = this.router.url.split('?')[0];
    const url = (routerUrl && routerUrl !== '/') ? routerUrl : location.hash.replace('#', '').split('?')[0];

    // 1. Handle "Setup" Menu: highlight it when visiting ANY process/setup or parts/setup URL
    if (menu.title === 'Setup') {
      return url.startsWith('/app/sqm/process/setup/') || url.startsWith('/app/sqm/parts/setup/');
    }

    // 2. Handle "Process Audit" Menu: highlight ONLY if the URL doesn't contain '/setup/'
    if (menu.routerLink === '/app/sqm/process') {
      return url.startsWith('/app/sqm/process') && !url.includes('/setup/');
    }

    // 3. Handle "Parts Audit" Menu: highlight ONLY if the URL doesn't contain '/setup/'
    if (menu.routerLink === '/app/sqm/parts') {
      return url.startsWith('/app/sqm/parts') && !url.includes('/setup/');
    }

    // 4. Default logic for all other menus
    const result =
      url.startsWith(menu.routerLink) ||

      // ✅ NEW ADDITION: Highlight main 'Inspection' tab for inner screen routes
      (menu.routerLink === '/app/sqm/inspection' && 
        url.startsWith('/app/sqm/inspect-inner-screen')) ||

      (menu.routerLink === '/app/prts-part' &&
        (url.startsWith('/app/prtsnavbar') ||
         url.startsWith('/app/prtsonepager'))) ||

      (menu.routerLink === '/app/subjective-audits' &&
        url.startsWith('/app/checklistdoard')) ||

      (menu.routerLink === '/app/objective-audits' &&
        (url.startsWith('/app/setup/subjective/check') ||
         url.startsWith('/app/setup/subjective/overview') ||
         url.startsWith('/app/parameterboard'))) ||

      // Supplier - Process Audits inner-screen routes
      (menu.routerLink === '/app/supplier-login/process-audits' &&
        (url.startsWith('/app/supplier-login/inner-screen/process-ref') ||
         url.startsWith('/app/supplier-login/inner-screen/capa-ref'))) ||

      // Supplier - Parts Audits inner-screen routes
      (menu.routerLink === '/app/supplier-login/parts-audits' &&
        (url.startsWith('/app/supplier-login/inner-screen/parts-ref') ||
         url.startsWith('/app/supplier-login/inner-screen/part-inner-capa') ||
         url.startsWith('/app/supplier-login/inner-screen/parts-capa'))) ||

      // Supplier - Inspection inner-screen routes
      (menu.routerLink === '/app/supplier-login/inspection' &&
        (url.startsWith('/app/supplier-login/inner-screen/inspection-ref') ||
         url.startsWith('/app/supplier-login/inner-screen/ins-inner-capa') ||
         url.startsWith('/app/supplier-login/inner-screen/ins-active-ref') ||
         url.startsWith('/app/supplier-login/inner-screen/ins-sample')));

    return result;
  }

}