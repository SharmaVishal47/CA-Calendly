import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { AuthService,GoogleLoginProvider} from 'angular-6-social-login';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {AuthServiceLocal} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoginInStatus = 2;
  email = '';
  loginForm1: FormGroup;
  param1;
  constructor( private socialAuthService: AuthService,private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private dialog: MatDialog,private authService:AuthServiceLocal) {}
  ngOnInit() {
    this.param1 = this.route.snapshot.queryParamMap.get('code');
    if(this.param1) {
      this.httpClient.post<{message: string,data: []}>('http://localhost:3000/googleCalendar/generateToken',{_token: this.param1 }).subscribe((responseData)=>{
        console.log("responseData====",responseData.data);
        this.router.navigate(["/login"]);
      },error => {
        console.log("error====",error);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = error;
        this.dialog.open(MessagedialogComponent, dialogConfig);
      });
      console.log(this.param1);
    }


    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required])
    });
    this.loginForm1 = new FormGroup({
      emailID: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
  }

//*****************Login By Google Authentication***********************/////
  public socialSignIn(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        console.log("userData====",userData);
        if(userData.email === this.email){
          this.httpClient.post<{message: string,data: []}>('http://localhost:3000/user/signinwithgoogle',userData).subscribe((responseData)=>{
            console.log("responseData====",responseData.data);
            this.router.navigate(["dashboard/"+this.email]);
          },error => {
            console.log("error====",error);
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = error;
            this.dialog.open(MessagedialogComponent, dialogConfig);
          });
        }else{
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = "Selected email is not authenticate.";
          this.dialog.open(MessagedialogComponent, dialogConfig);
        }
      }
    );
  }

  onSubmit() {
    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/user/checkuseremail',this.loginForm.value).subscribe((responseData)=>{
      console.log("responseData====",responseData.data);
      if(responseData.data.length>0){
        this.email = this.loginForm.value.email;
        this.isLoginInStatus = 1;
      }else{
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = "User not exists.";
        this.dialog.open(MessagedialogComponent, dialogConfig);
      }
    },error => {
      console.log("error====",error);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  //*************************Login by username and password************
  onSubmitWithPassword() {
    console.log(this.loginForm1.value);
    this.authService.loginUser(this.loginForm1.value);

    /*this.httpClient.post<{message: string,data: []}>('http://localhost:3000/user/checkemailpassword',this.loginForm1.value).subscribe((responseData)=>{
      console.log("responseData====",responseData.data);
      if(responseData.data.length>0){
        this.router.navigate(["dashboard/"+this.loginForm1.value.emailID]);
      }else{
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = "Invalid username/password.";
        this.dialog.open(MessagedialogComponent, dialogConfig);
      }
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });*/
  }

  onLogin() {
    this.isLoginInStatus = 2;
    this.loginForm1.patchValue({
      emailID: this.email
    });
  }
}
