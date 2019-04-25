import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../messagedialog/messagedialog.component';
import {MessageServiceService} from './message-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceLocal implements OnInit{

  private isAuthenticated = false;
  authStatusListener = new Subject<boolean>();
  isAuth =  new Subject<boolean>();
  private emailId: string;
  private userId: string;
  private fullName: string;
  private profilePic: string;
  private tokenTimer;
  private token: string;

  constructor(private httpClient: HttpClient,private router: Router,private dialog: MatDialog, private messageService: MessageServiceService) { }

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
  getprofilePic(){
    return this.profilePic;
  }

  getFullName(){
    return this.fullName;
  }
  logOutOnEmailChange(){
    this.isAuthenticated = false;
    this.userId = null;
    this.emailId = null;
    this.fullName = null;
    this.profilePic = null;
    this.authStatusListener.next(false);
    this.isAuth.next(this.isAuthenticated);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
  }
  logout(){
    this.isAuthenticated = false;
    this.userId = null;
    this.emailId = null;
    this.fullName = null;
    this.profilePic = null;
    this.authStatusListener.next(false);
    this.isAuth.next(this.isAuthenticated);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['']);
  }

  loginUserAfterSignup(data: {emailID: string,password: string}){
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkemailpassword',data).subscribe((responseData)=>{
      console.log("responseData=====",responseData);
      if(responseData.data.length>0){
        this.token = responseData.token;
        if(this.token){
          this.emailId = data.emailID;
          this.userId = responseData.data[0].userId.toString();
          this.fullName = responseData.data[0].fullName.toString();
          this.profilePic = responseData.data[0].profilePic
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.router.navigate(['dashboard']);
          this.authStatusListener.next(true);

          const expiresIn = responseData.expiresIn;
          this.setAuthTimer(expiresIn);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn*1000);
          this.saveAuthData(this.token,expirationDate,responseData.data[0].userId,this.emailId);

          /*this.eventService.createEventAfterSignUp(this.emailId);*/
          console.log("Call event create==========");
          this.httpClient.post<any>('https://dev.cloudmeetin.com/events/createeventaftersignup', {email: this.emailId}).subscribe(
            res => {
              this.router.navigate(['dashboard']);
            },
            err => {

            });

        }else{
          console.log("Log97");
          this.router.navigate(['login']);
        }
      }else{
        console.log("Log101");
        this.router.navigate(['login']);
      }
    },error => {
      console.log("Log105");
      this.router.navigate(['login']);
    });
  }

  loginUser(data: {emailID: string,password: string}){
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkemailpassword',data).subscribe((responseData)=>{
      if(responseData.data.length>0){
        this.token = responseData.token;
        if(this.token){
          this.emailId = data.emailID;
          this.userId = responseData.data[0].userId.toString();
          this.fullName = responseData.data[0].fullName.toString();
          this.profilePic = responseData.data[0].profilePic;
          this.isAuthenticated = true;
          this.router.navigate(['dashboard']);
          this.authStatusListener.next(true);
          const expiresIn = responseData.expiresIn;
          this.setAuthTimer(expiresIn);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn*1000);
          this.saveAuthData(this.token,expirationDate,responseData.data[0].userId,this.emailId);
        }else{
          this.messageService.generateInfoMessage("Please Login Again");
          this.authStatusListener.next(false);
        }
      }else{
        this.messageService.generateErrorMessage("Invalid username/password.");
        this.authStatusListener.next(false);
      }
    },error => {
      this.messageService.generateErrorMessage("Something went gone wrong.");
      this.authStatusListener.next(false);
    });
  }

  autoAuthenticateUserAfterIntegration(path: string){
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
        this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkTokenUserId',{userId: authInfo.userId,token: authInfo.token}).subscribe((responseData)=>{
          this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkuseremail',{email: authInfo.emailId}).subscribe((responseData)=>{
            if(responseData.data.length > 0){
              this.fullName = responseData.data[0].fullName;
              this.profilePic = responseData.data[0].profilePic;
              this.token = authInfo.token;
              this.isAuthenticated = true;
              this.userId = authInfo.userId;
              this.emailId = authInfo.emailId;
              this.authStatusListener.next(true);
              console.log("userId auth service====",this.userId);
              this.setAuthTimer(expiresIn/1000);
              // this.router.navigate(["dashboard/"+authInfo.emailId]);
              this.router.navigate([path]);
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
        this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkTokenUserId',{userId: authInfo.userId,token: authInfo.token}).subscribe((responseData)=>{
          this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkuseremail',{email: authInfo.emailId}).subscribe((responseData)=>{
            if(responseData.data.length > 0){
              this.fullName = responseData.data[0].fullName;
              this.profilePic = responseData.data[0].profilePic;
              this.token = authInfo.token;
              this.isAuthenticated = true;
              this.userId = authInfo.userId;
              this.emailId = authInfo.emailId;
              this.authStatusListener.next(true);
              this.setAuthTimer(expiresIn/1000);
              // this.router.navigate(["dashboard/"+authInfo.emailId]);
              this.router.navigate(["dashboard"]);
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

  public getAuthData(){
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

  /*Abhishek*/
  public getUid(){
    const userId = localStorage.getItem('userId');
    return userId;
  }


  validateUser(data: {email: string}){
    console.log('Valid data ',data);
    this.httpClient.post<any>('https://dev.cloudmeetin.com/password/validateUser',data).subscribe((responseData)=>{
      if(responseData.data.length>0){
        console.log('Response token value-------->',responseData.token);
        console.log('Response Email value-------->',responseData.data[0].email);
        this.httpClient.post<any>('https://dev.cloudmeetin.com/sendResetPasswordEmail/sendResetPasswordEmail',{
          message: "You are receiving this message because you have requested to reset your password\n Here is the link to reset your password https://dev.cloudmeetin.com/changePassword/da?email="+responseData.data[0].email+"&data="+responseData.token,
          email: responseData.data[0].email
        }).subscribe((responseData)=>{
          /* if(responseData.data.length>0){*/
          console.log('Response Email-------->',responseData.email);
          this.router.navigate(['/tryAgain/'+responseData.email]);
          this.token = responseData.token;
          /* }else{
             this.messageService.generateErrorMessage("Email could not be send ");
             this.authStatusListener.next(false);
           }*/
        },error => {
          this.messageService.generateErrorMessage("Could not send email!! Check your mail service ");
        });
        /* console.log('Response-------->',responseData.data);
         this.router.navigate(['/tryAgain']);
         this.token = responseData.token;*/
        console.log('Response Message value-------->',"You are receiving this message because you have requested to reset your password\n Here is the link to reset your password https://dev.cloudmeetin.com/changePassword/"+responseData.token);
      }else{
        this.messageService.generateErrorMessage("Sorry its an invalid email id plz try again ! ");
        this.authStatusListener.next(false);
      }
    },error => {
      this.messageService.generateErrorMessage("Could not send email!! Plz check your connection ");
    });
  }


  checkTokenData(data:string,email:string){
    this.httpClient.post<any>('https://dev.cloudmeetin.com/password/checkTokenData',{token:data,email:email}).subscribe((responseData)=>{
      console.log('Response data ',responseData);
      if(responseData.valid===true){
        console.log('Response data ',responseData);
      }else{
        this.router.navigate(['/forgetPassword']);
        this.messageService.generateErrorMessage("Sorry its an invalid token id plz try again ! ");
        this.authStatusListener.next(false);
      }
    },error => {
      this.router.navigate(['/forgetPassword']);
      this.messageService.generateErrorMessage("Some Error occurred !! Plz check your connection ");
    });
  }
  updatePassword(data:any,email:string){
    this.httpClient.post<any>('https://dev.cloudmeetin.com/password/updatePassword',{password:data,email:email}).subscribe((responseData)=>{
      if(responseData){
        this.messageService.generateSuccessMessage("Your password updated successfully ! ");
      }else{
        this.messageService.generateErrorMessage("Sorry its an invalid email id plz try again ! ");
        this.authStatusListener.next(false);
      }
    },error => {
      this.messageService.generateErrorMessage("Could not send email!! Plz check your connection ");
    });
  }

}
