import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthServiceLocal} from '../../Auth/auth.service';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.css']
})
export class AccountSettingComponent implements OnInit {
  settingForm: FormGroup;
  myLinkForm : FormGroup;
  profileForm : FormGroup;
  settings: boolean =true;
  mylink: boolean =false;
  profile: boolean =false;
  userId: string;
  imagePreview: any;
  image;
  notAvalable: string;
  notChose: boolean;
  choosed: boolean;
  imageSource: string;
  imageStatus : boolean = false;
  timeZone;
  email;

  constructor(private dialog: MatDialog,private httpClient: HttpClient,private authService:AuthServiceLocal,private router:Router){

  }

  ngOnInit() {
    this.email = this.authService.getUserEmaild();
    this.notChose=true;
    this.settingForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      welcome: new FormControl(null, [Validators.required]),
      language: new FormControl(null, [Validators.required]),
      dateFormat: new FormControl(null, [Validators.required]),
      timeFormat: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required])
      // Embed: new FormControl(null, [Validators.required]),
    });

    this.myLinkForm = new FormGroup( {
      userID: new FormControl(null, [Validators.required])
    });

    this.profileForm = new FormGroup( {
      'file' : new FormControl(null,[Validators.required]) ,
      'image' : new FormControl(null)
    });
    this.notAvalable = 'Please upload a valid image';
    this.userId = this.authService.getUserId();
    console.log('User id -->',this.userId);
    this.myLinkForm.patchValue({
      userID:this.userId
    });
    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/userData/userData',{'userId': this.userId}).subscribe(
      res =>{
        this.imageSource = res.data['0'].profilePic;
        this.imageStatus=true;
        console.log("Image Source --->", this.imageSource);
        console.log("res===========",res);
        this.settingForm.patchValue({
          country: res.data['0'].country,
          name: res.data['0'].fullName,
          welcome: res.data['0'].welcomeMessage,
          language: res.data['0'].language,
          dateFormat: res.data['0'].dateFormat,
          timeFormat: res.data['0'].timeFormat,
        });
        this.timeZone = res.data['0'].timeZone;
      },err => {
        console.log("Error=========",err.message);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = err;
        this.dialog.open(MessagedialogComponent, dialogConfig);
      });

  }

  submitForm() {
    let uid = this.settingForm.value;
    uid["userId"]=this.userId;
    uid["timeZone"]  =  this.timeZone;
    console.log('---->',uid);
    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/userData/addUserData',uid).subscribe((responseData)=>{
      console.log("settingForm responseData====",responseData.data);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = 'settingForm submitted';
      let dialogRef = this.dialog.open(MessagedialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(value => {
        this.router.navigate(["dashboard/"+this.email]);
      });
    },error => {
      console.log("error====",error);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  enableSetting() {
    this.settings=true;
    this.profile=false;
    this.mylink = false;
  }

  enableProfile() {
    this.profile = true;
    this.settings=false;
    this.mylink = false;
    console.log('-------------->',this.profile);
  }

  enableMylink() {
    this.mylink = true;
    this.profile = false;
    this.settings=false;
  }

  submitMyLinkForm() {
    console.log('===>',this.myLinkForm.value);
    let uid = this.myLinkForm.value;
    uid["id"]=this.userId;
    console.log('---->',uid);
    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/userData/updateLink',uid).subscribe((responseData)=>{
      console.log("updateLink responseData====",responseData.data);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = 'Link updated';
      let dialogRef = this.dialog.open(MessagedialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(value => {
        //this.router.navigate(['']);
      });
    },error => {
      console.log("error====",error);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  submitMyProfileForm() {
    console.log('Profile form--> ',this.profileForm.value);
    console.log('Image value--> ',this.image);

    let uid = this.profileForm.value;
    uid["id"] = this.userId;
    uid["image"] = this.image;
    const postData = new FormData();
    postData.append('userId',this.userId);
    postData.append('image',this.image);

    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/userData/updateProfile',postData).subscribe((responseData)=>{
      console.log("updateLink profile====",responseData);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = 'profile updated';
      let dialogRef = this.dialog.open(MessagedialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(value => {
        //this.router.navigate(['']);
      });
    },error => {
      console.log("error====",error);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  onImagePicked(imageEvent: Event) {
    if ((imageEvent.target as HTMLInputElement).files && (imageEvent.target as HTMLInputElement).files[0]) {
      this.choosed=true;
      this.notChose=false;
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent) => {
        this.imagePreview = (<FileReader>event.target).result;
        /*console.log("file ====",(imageEvent.target as HTMLInputElement).files[0]);*/
        this.image = (imageEvent.target as HTMLInputElement).files[0];
        this.imageStatus = true;
      };

      reader.readAsDataURL((imageEvent.target as HTMLInputElement).files[0]);
    }
  }


  /*onImagePicked(imageEvent: Event) {
      this.choosed=true;
      this.notChose=false;
    if ((imageEvent.target as HTMLInputElement).files && (imageEvent.target as HTMLInputElement).files[0]) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent) => {
        this.imagePreview = (<FileReader>event.target).result;
        console.log("file ====",(imageEvent.target as HTMLInputElement).files[0]);
        this.image = (imageEvent.target as HTMLInputElement).files[0];
        console.log('Image--->> ', this.image);
      };

      reader.readAsDataURL((imageEvent.target as HTMLInputElement).files[0]);
    }
  }*/
  onDeleteAccount() {
    if(confirm("Are you sure You want to delete ?")) {
      this.httpClient.post<{message: string,data: []}>('http://localhost:3000/userData/deleteProfile',{'id':this.userId}).subscribe((responseData)=>{
        console.log("updateLink profile====",responseData);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = 'profile deleted';
        let dialogRef = this.dialog.open(MessagedialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(value => {
          this.router.navigate(['']);
        });
      },error => {
        console.log("error====",error);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = error;
        this.dialog.open(MessagedialogComponent, dialogConfig);
      });
    }

  }
  changeTimezone(timezone) {
    this.timeZone = timezone;
  }
}
