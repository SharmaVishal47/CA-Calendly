import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../messagedialog/messagedialog.component';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  private checkEmail = new Subject<{data: String,message: String}>();
  private checkUserId = new Subject<{data: [],message: String}>();
  private generateTokenSubject = new Subject<any>();
  private getCalendarOption = new Subject<any>();
  private getCalendarEvents = new Subject<any>();
  constructor(private httpClient: HttpClient,private router: Router,private dialog: MatDialog) { }

  getCheckEmailListener(){
    return this.checkEmail.asObservable();
  }

  getCalendarEventsListener(){
    return this.getCalendarEvents.asObservable();
  }

  getCalendarOptionListener(){
    return this.getCalendarOption.asObservable();
  }

  getGenerateTokenListener(){
    return this.generateTokenSubject.asObservable();
  }
  getExistingUserId(){
    return this.checkUserId.asObservable();
  }

  updateRoleOfUser(formData){
    this.httpClient.post<any>('http://localhost:3000/user/updateRole',formData).subscribe((responseData)=>{
      localStorage.removeItem("emailSignUp");
      this.router.navigate([""]);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  updateAvailabilityConfiguration(formData){
    this.httpClient.post<any>('http://localhost:3000/user/updateConfiguration',formData).subscribe((responseData)=>{
      this.router.navigate(["userRole/"+formData.email]);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public updateCalendarEventOptions(event,calendarOptions,email){
    let data =  {
      eventType: event,
      calnedarOption : calendarOptions,
      email : email
    };
    this.httpClient.post<any>('http://localhost:3000/user/updateCalendarEvent',data).subscribe((responseData)=>{
      this.router.navigate(["availability/"+email]);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public getCalendarEventsList(email: string){
    this.httpClient.post<any>('http://localhost:3000/user/getcalendarlist',{email: email}).subscribe( (responseData)=>{
      this.getCalendarEvents.next(responseData);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public getCalendarOptionList(email: string){
    this.httpClient.post<any>('http://localhost:3000/user/getcalendarlist',{email: email}).subscribe( (responseData)=>{
      this.getCalendarOption.next(responseData);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public updateTimeZoneUserId(email,timeZone,userId){
    this.httpClient.post<any>('http://localhost:3000/user/updateUser',{email: email,timeZone: timeZone,userId: userId}).subscribe((responseData)=>{
      this.router.navigate(["calendar/"+email]);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public generateToken(token: string,emailId: string){
    this.httpClient.post<any>('http://localhost:3000/googleCalendar/generateToken',{_token: token, email: emailId}).subscribe((responseData)=>{
      this.generateTokenSubject.next(responseData);
    }, error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public generateGmailAuthUrl() {
    this.httpClient.get<any>('http://localhost:3000/googleCalendar/signupcal').subscribe((responseData) => {
      window.location.href = responseData.url;
    }, error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public checkUserEmail(signUpData){
    this.httpClient.post<any>('http://localhost:3000/user/checkuseremail',signUpData).subscribe((responseData)=>{
      this.checkEmail.next(responseData);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public updateUserProfile(profileData){
    this.httpClient.post<any>('http://localhost:3000/user/updateUserProfile',profileData).subscribe((responseData)=>{
      this.router.navigate(["settings/"+profileData.emailID]);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = JSON.stringify(error);
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  public checkUser(formData){
    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/user/checkuser',formData).subscribe((responseData)=>{
      this.checkUserId.next(responseData);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }
}
