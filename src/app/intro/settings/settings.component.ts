import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Route, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {SignUpService} from '../../Auth/sign-up.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  email: string;
  validUserId = true;
  timeZone: string = "Asia/Kolkata";
  _userSelectTimeZone ;

  constructor(private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private dialog: MatDialog,private signUpService: SignUpService) { }

  ngOnInit() {
    this.form = new FormGroup({
      userId: new FormControl(null, [Validators.required])
    });
    this.route.params.subscribe((params: Params) => {
      this.email = params['email'];
    });
    this.signUpService.getExistingUserId().subscribe((responseData)=>{
      if (responseData.data.length>0){
        this.validUserId = false;
      }else{
        this.validUserId = true;
      }
    });
  }
  getUser(event){
    this.signUpService.checkUser(this.form.value);
  }

  onSubmit() {
    if(this.validUserId){
      if(this._userSelectTimeZone) {
        this.signUpService.updateTimeZoneUserId(this.email,this._userSelectTimeZone,this.form.value.userId);
      }else{
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = "Please Select Time Zone";
        this.dialog.open(MessagedialogComponent, dialogConfig);
      }
    }else{
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = "Please choose another UserId";
      this.dialog.open(MessagedialogComponent, dialogConfig);
    }
  }


  changeTimezone(selectTimeZone: string) {
    this._userSelectTimeZone  =  typeof selectTimeZone === 'string' && selectTimeZone.split('').length > 0 ? selectTimeZone : false;

  }
}
