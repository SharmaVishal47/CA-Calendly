import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthServiceLocal} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthServiceLocal,private router: Router){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isAuthenticated = this.authService.getIsAuthenticated();
    if(!isAuthenticated){
      this.router.navigate(['']);
    }
    return true;
  }
}
