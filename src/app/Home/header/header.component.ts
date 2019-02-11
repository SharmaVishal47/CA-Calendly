import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {AuthServiceLocal} from '../../Auth/auth.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ShareYourLinkComponentComponent} from '../../share-your-link-component/share-your-link-component.component';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit,OnDestroy  {
  emailId: string;
  userId: string;
  isAuthenticated = false;
  private authListnerSubscription: Subscription;

  constructor(private authService: AuthServiceLocal,private router:Router,private dialog: MatDialog) { }

  ngOnInit() {
    this.authListnerSubscription = this.authService.authStatusListener.subscribe(isAuth =>{
      this.isAuthenticated = isAuth;
      this.emailId = this.authService.getUserEmaild();
      this.userId = this.authService.getUserId();
    });
    /* this.authService.autoAuthenticateUser();*/
    this.isAuthenticated = this.authService.getIsAuthenticated();
  }

  ngOnDestroy() {
    this.authListnerSubscription.unsubscribe();
  }

  onLogout() {
    this.isAuthenticated = false;
    this.authService.logout();
  }

  openDialog(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = "";
    this.dialog.open(ShareYourLinkComponentComponent, dialogConfig);
  }

  checkLogin() {
    this.authService.autoAuthenticateUser();
    /*routerLink="/login"*/
  }
}
