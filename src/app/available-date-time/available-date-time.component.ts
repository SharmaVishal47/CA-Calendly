import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../messagedialog/messagedialog.component';
import {AuthServiceLocal} from '../Auth/auth.service';

@Component({
  selector: 'app-available-date-time',
  templateUrl: './available-date-time.component.html',
  styleUrls: ['./available-date-time.component.css']
})
export class AvailableDateTimeComponent implements OnInit {

  form: FormGroup;
  dayFormArray: FormArray;
  userId;
  defaultStartTime:string;
  defaultEndTime:string;
  availableDays:[];
  item;
  email;
  chk1;chk2;chk3;chk4;chk5;chk6;chk7;

  constructor(private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private fb: FormBuilder,private dialog: MatDialog , private authService:AuthServiceLocal) {}
  ngOnInit() {
    this.email = this.authService.getUserEmaild();
    this.chk1 = <HTMLInputElement> document.getElementById("ch1");
    this.chk2 = <HTMLInputElement> document.getElementById("ch2");
    this.chk3 = <HTMLInputElement> document.getElementById("ch3");
    this.chk4 = <HTMLInputElement> document.getElementById("ch4");
    this.chk5 = <HTMLInputElement> document.getElementById("ch5");
    this.chk6 = <HTMLInputElement> document.getElementById("ch6");
    this.chk7 = <HTMLInputElement> document.getElementById("ch7");

    this.userId = this.authService.getUserId();
    this.form = new FormGroup({
      inTime: new FormControl(null,[Validators.required]),
      outTime: new FormControl(null,[Validators.required]),
      selectedOption: this.fb.array([],[Validators.required])
    });

    this.httpClient.post<{message: string,data: []}>('http://localhost:3000/user/getTimeAvailability',{'userId': this.userId}).subscribe(
      res =>{
        console.log("res===========",res);
        this.defaultStartTime = res.data['0'].startTime;
        this.defaultEndTime = res.data['0'].endTime;
        this.availableDays = res.data['0'].availableDays.toString().split(',');
        let availableDays = res.data['0'].availableDays.toString().split(',');
        const emailFormArray = <FormArray>this.form.controls.selectedOption;
        for(let item of availableDays){
          emailFormArray.push(new FormControl(item));
        }
        this.dayFormArray = emailFormArray;
        for(this.item of this.availableDays){
          if(this.item==0){
            this.chk1.checked=true;
          }
          if(this.item==1){
            this.chk2.checked=true;
          }
          if(this.item==2){
            this.chk3.checked=true;
          }
          if(this.item==3){
            this.chk4.checked=true;
          }
          if(this.item==4){
            this.chk5.checked=true;
          }
          if(this.item==5){
            this.chk6.checked=true;
          }
          if(this.item==6){
            this.chk7.checked=true;
          }
        }
        // this.router.navigate(['']);
      },err => {
        console.log("Error=========",err.message);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = err;
        this.dialog.open(MessagedialogComponent, dialogConfig);
      });
  }
  updateConfiguration() {
    this.form.value['userId'] = this.userId;
    console.log("Value=====",this.form.value);
    this.httpClient.post<any>('http://localhost:3000/user/updateUserConfiguration',this.form.value).subscribe((responseData)=>{
      console.log("responseData====",responseData);
      this.router.navigate(["dashboard/"+this.authService.getUserEmaild()]);
    },error => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
  }

  onChange(email: string, isChecked: boolean) {
    const emailFormArray = <FormArray>this.form.controls.selectedOption;
    if (isChecked) {
      emailFormArray.push(new FormControl(email));
    } else {
      let index = emailFormArray.controls.findIndex(x => x.value == email);
      emailFormArray.removeAt(index);
    }
    this.dayFormArray = emailFormArray;
  }

  setUpLater() {
    this.router.navigate(["dashboard/"+this.email]);
  }

}

