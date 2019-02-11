import {Component, OnInit} from '@angular/core';
import {AuthService, GoogleLoginProvider} from 'angular-6-social-login';
import {FormControl, FormGroup, MaxLengthValidator, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Route, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {SignUpService} from '../sign-up.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signUp: FormGroup;
  isSignInStatus = 0;
  email = '';
  param1;
  _emailID ;
  signUpForm: FormGroup;
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  constructor( private socialAuthService: AuthService,private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private dialog: MatDialog,private signUpService: SignUpService) {}
  ngOnInit() {
    this.param1 = this.route.snapshot.queryParamMap.get('code');
    if (this.param1) {
      this._emailID = localStorage.getItem('emailSignUp');
      this.email = localStorage.getItem('emailSignUp');
      this.signUpService.getGenerateTokenListener().subscribe((responseData)=>{
        console.log("responseData token====",responseData);
        this.OnCreateAccount();
      });
      this.signUpService.generateToken(this.param1,this._emailID);
    }
    this.signUp = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.pattern(this.emailPattern)])
    });
    this.signUpForm = new FormGroup({
      emailID: new FormControl(null, [Validators.required, Validators.pattern(this.emailPattern)]),
      fullName: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
    this.route.params.subscribe((params: Params) => {
      this.email =  params['email'];
      this.signUp.patchValue({email: this.email});
    });
    this.route.params.subscribe((params: Params) => {
      let _emailId=  localStorage.getItem('emailSignUp');
      this.signUpForm.patchValue(
        {emailID: _emailId});
    });
  }

  public socialSignIn(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        if(this.email === userData.email){
          console.log(socialPlatform + ' sign in data : ' , userData);
          localStorage.setItem('emailSignUp', userData.email);
          this.signUpForm.patchValue({
            emailID: userData.email
          });
          this.signUpService.generateGmailAuthUrl();
        }else{
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = "Unauthorized access,Email does not match!";
          this.dialog.open(MessagedialogComponent, dialogConfig);
          this.isSignInStatus = 0;
        }
      }
    );
  }
  onSubmit() {
    this.signUpService.checkUserEmail(this.signUp.value);
    this.signUpService.getCheckEmailListener().subscribe((responseData: {data: String,message: String})=>{
      if(responseData.data.length>0){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = "Email already exists.";
        this.dialog.open(MessagedialogComponent, dialogConfig);
      }else{
        this.email = this.signUp.value.email;
        this.isSignInStatus = 1;
      }
    });
  }

  onSubmitProfile() {
    this.isSignInStatus = 2;
    this.signUpService.updateUserProfile(this.signUpForm.value)
  }

  OnCreateAccount() {
    this.isSignInStatus = 2;
    this.signUpForm.patchValue({
      emailID: this._emailID
    });
  }
}
