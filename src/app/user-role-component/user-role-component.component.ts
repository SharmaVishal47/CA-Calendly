import {Component, OnInit} from '@angular/core';

import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {SignUpService} from '../Auth/sign-up.service';
@Component({
  selector: 'app-user-role-component',
  templateUrl: './user-role-component.component.html',
  styleUrls: ['./user-role-component.component.css']
})
export class UserRoleComponentComponent implements OnInit {
  calendarForm: FormGroup;
  selectedOption;
  email: string;
  data = ['Customer success + Account Management','Interview Scheduling','Sales Marketing','Leader + Entrepreneur','Education','Freelance + Consultant','Other'];
  constructor(private signUpService: SignUpService,private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private dialog: MatDialog) { }
  body;
  ngOnInit() {
    this.email =  this.signUpService.getAuthUserEmail();
    this.calendarForm = new FormGroup({
      role: new FormControl(null,[Validators.required])
    });
  }
  updateRole() {
    for (const i in this.calendarForm.controls) {
      this.calendarForm.controls[ i ].markAsDirty();
      this.calendarForm.controls[ i ].updateValueAndValidity();
    }
    this.calendarForm.value['email']=this.email;
    console.log("Body---->", this.calendarForm.value);
    this.signUpService.updateRoleOfUser(this.calendarForm.value);
  }
}




/*
import {Component, OnInit} from '@angular/core';

import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../messagedialog/messagedialog.component';
import {SignUpService} from '../Auth/sign-up.service';

@Component({
  selector: 'app-user-role-component',
  templateUrl: './user-role-component.component.html',
  styleUrls: ['./user-role-component.component.css']
})
export class UserRoleComponentComponent implements OnInit {
  calendarForm: FormGroup;
  selectedOption;
  email: string;
  data = ['Customer success + Account Management','Interview Scheduling','Sales Marketing','Leader + Entrepreneur','Education','Freelance + Consultant','Other'];
  constructor(private signUpService: SignUpService,private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private dialog: MatDialog) { }

  ngOnInit() {
    /!*this.route.params.subscribe((params: Params) => {
      this.email = params['email'];
    });*!/
    this.email =  this.signUpService.getAuthUserEmail();
    this.calendarForm = new FormGroup({
      role: new FormControl(null,[Validators.required])
    });
  }

  checkAnswer(item: string) {
    this.selectedOption = item;
  }

  updateRole() {
    let body =  {
      email: this.email,
      role: this.selectedOption
    };
    this.signUpService.updateRoleOfUser(body);
  }
}
*/
