import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../messagedialog/messagedialog.component';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceLocal implements OnInit{

  private isAuthenticated = false;
  authStatusListener = new Subject<boolean>();
  private emailId: string;
  private userId: string;
  private fullName: string;
  private tokenTimer;
  private token: string;

  constructor(private httpClient: HttpClient,private router: Router,private dialog: MatDialog) { }

  ngOnInit(){
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getIsAuthenticated(){
    return this.isAuthenticated;
  }

  getUserEmaild(){
    return this.emailId;
  }
  getUserId(){
    return this.userId;
  }

  getFullName(){
    return this.fullName;
  }

  logout(){
    this.isAuthenticated = false;
    this.userId = null;
    this.emailId = null;
    this.fullName = null;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['']);
  }

  loginUser(data: {emailID: string,password: string}){
    this.httpClient.post<any>('http://localhost:3000/user/checkemailpassword',data).subscribe((responseData)=>{
      if(responseData.data.length>0){
        this.token = responseData.token;
        if(this.token){
          this.emailId = data.emailID;
          this.userId = responseData.data[0].userId.toString();
          this.fullName = responseData.data[0].fullName.toString();
          this.isAuthenticated = true;
          this.router.navigate(["dashboard/"+data.emailID]);
          this.authStatusListener.next(true);

          const expiresIn = responseData.expiresIn;
          this.setAuthTimer(expiresIn);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn*1000);
          this.saveAuthData(this.token,expirationDate,responseData.data[0].userId,this.emailId);

        }else{
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = "Please Login Again";
          this.dialog.open(MessagedialogComponent, dialogConfig);
          this.authStatusListener.next(false);
        }
      }else{
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = "Invalid username/password.";
        this.dialog.open(MessagedialogComponent, dialogConfig);
        this.authStatusListener.next(false);
      }
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
      this.authStatusListener.next(false);
    });
  }

  private getAuthData(){
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const emailId = localStorage.getItem('emailId');
    if(!token || !expirationDate){

      return;
    }
    return {
      token: token,
      expirationDate: expirationDate,
      userId: userId,
      emailId: emailId
    };
  }

  autoAuthenticateUser(){
    try{
      const authInfo = this.getAuthData();
      if(!authInfo){
        this.logout();
        this.router.navigate(["login"]);
        return;
      }
      const now =new Date();
      const expiresIn =  Date.parse(authInfo.expirationDate) - now.getTime();
      if(expiresIn > 0){
        this.httpClient.post<any>('http://localhost:3000/user/checkTokenUserId',{userId: authInfo.userId,token: authInfo.token}).subscribe((responseData)=>{
          this.httpClient.post<any>('http://localhost:3000/user/checkuseremail',{email: authInfo.emailId}).subscribe((responseData)=>{
            if(responseData.data.length > 0){
              this.fullName = responseData.data[0].fullName;
              this.token = authInfo.token;
              this.isAuthenticated = true;
              this.userId = authInfo.userId;
              this.emailId = authInfo.emailId;
              this.authStatusListener.next(true);
              this.setAuthTimer(expiresIn/1000);
              this.router.navigate(["dashboard/"+authInfo.emailId]);
            }else{
              this.logout();
              this.router.navigate(["login"]);
            }
          });
        },error => {
          this.logout();
          this.router.navigate(["login"]);
        });
      }else {
        this.logout();
        this.router.navigate(["login"]);
      }
    }catch (e) {
      console.log("error====",e);
    }

  }

  private saveAuthData(token: string, expirationDate: Date, userId: string,email: string) {
    localStorage.setItem('token',token);
    localStorage.setItem('expiration',expirationDate.toISOString());
    localStorage.setItem('userId',userId);
    localStorage.setItem('emailId',email);
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('emailId');
  }
  setAuthTimer(duration: number){
    this.tokenTimer = setTimeout(()=>{
      this.logout();
    },duration*1000);
  }
}
