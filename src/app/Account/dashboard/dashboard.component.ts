import { Component, OnInit } from '@angular/core';
import {AuthServiceLocal} from '../../Auth/auth.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {MeetingService} from '../../meetings/meeting.service';
// @ts-ignore
import endOfMonth from 'date-fns/end_of_month';
// @ts-ignore
import startOfMonth from 'date-fns/start_of_month';
// @ts-ignore
import endOfWeek from 'date-fns/end_of_week';
// @ts-ignore
import startOfWeek from 'date-fns/start_of_week';
import {DialogcancelmessageComponent} from '../dialogcancelmessage/dialogcancelmessage.component';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import {DashboardService} from '../dashboard.service';
import {EventService} from '../../Events/event.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInLeft} from 'ng-animate';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('slideInLeft', [transition('* => *', useAnimation(slideInLeft, {
      // Set the duration to 5seconds and delay to 2seconds
      params: { timing: 0.7, delay: 0 }
    }))])
  ],
})
export class DashboardComponent implements OnInit {

  /* Dialog Functionality*/
  allChecked = true;
  indeterminate = false;
  checkOptionsOne = [];

  allCheckedEvent = true;
  indeterminateEvent = false;
  checkOptionsOneEvent = [
    { label: 'Active Events', value: 'active', checked: true },
    { label: 'Canceled Event ', value: 'cancel', checked: true }
  ];
  /*end*/
  copyLink = '';

  recordExists = false;
  userCheck= false;
  teamCheck = false;
  size = 'large';
  eventForm: FormGroup;
  scheduling: true;
  count = 0;
  event: string;
  lengthOfEvent;
  responseData = [] ;
  fullName;
  indexSelect = 0;
  ranges1 = { 'Today': [ new Date(), new Date() ], 'This Week': [ startOfWeek(new Date()), endOfWeek(new Date()) ], 'This Month': [ startOfMonth(new Date()), endOfMonth(new Date()) ] };
  cancelMessage= '';
  userName = '';
  allEvent: string = 'false';
  cancelledEvent = 'false';
  tabStatus: number = 1;
  showCard=true;
  EventTypeSlotDashboard = [];
  EventTypeSlotDashboardForShow = [];
  meetingListMap : Map<any,any>;
  meetingListMapSorted : Map<string,any>;
  updateEmail: FormGroup;
  displaySize = 0;
  totalSize = 0;
  userId = null;
  dateFrom = null ;
  dateTo = null ;
  showReset = false;
  dateRange = null;
  validateDatePicker: FormGroup;
  eventListTypeCheck = false;
  isSpinning = true;
  constructor(
    private authService: AuthServiceLocal,
    private router:Router,
    private httpClient: HttpClient,
    private dialog: MatDialog,
    private meetingService: MeetingService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.validateDatePicker = this.fb.group({
      dateRange: [this.dateRange]
    });
    this.meetingService.removeHeader(false);
    this.userId = this.authService.getUserId();
    this.httpClient.post<any>('https://dev.cloudmeetin.com/events/getevents', {userId :this.authService.getUserId()}).subscribe(
      response => {
        console.log("Response Event Data --- > ", response);
        if(response.data.length > 0){
          this.eventListTypeCheck = true;
          this.EventTypeSlotDashboard = response.data;
          for(let i = 0;i<response.data.length;i++){
            let item = {
              label: response.data[i].name,
              value: response.data[i].name,
              checked: true
            };
            this.checkOptionsOne.push(item);
          }
          if(response.data.length<=3) {
            this.EventTypeSlotDashboardForShow = response.data;
          }else{
            this.EventTypeSlotDashboardForShow = response.data;
            this.EventTypeSlotDashboardForShow.splice(3);
          }
        }
      },
      err => {

      });

    this.updateEmail = this.fb.group({
      email: [ null, [ Validators.required ] ]
    })
    this.eventForm = new FormGroup({
      allEvent: new FormControl(null, [Validators.required]),
      CancelledEvent: new FormControl(null, [Validators.required])
    });
    this.fullName= this.authService.getFullName();
    this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/getMeetingRecord',{userId: this.authService.getUserId()}).subscribe((responseData)=>{
      console.log("responseData====",responseData);
      this.isSpinning = false;
      this.responseData = responseData.data;
      this.lengthOfEvent = this.responseData.length;
      if(this.responseData.length > 0){
        this.recordExists = true;
        this.responseData.sort((a,b) => Date.parse(a.meetingDate) - Date.parse(b.meetingDate));

        let set = new Set();
        for(let i=0;i<this.responseData.length;i++){
          let date = new Date(this.responseData[i].meetingDate);
          date.setHours(0,0,0,0);
          set.add(date);
        }

        set.forEach(value => {
          console.log("value===",value);
        });

        type Product = any;
        this.meetingListMap = new Map<string, Product[]>();

        for(let item of Array.from(set)){
          let myArrayMeeting = [];
          for(let i=0;i<this.responseData.length;i++){
            let date = new Date(this.responseData[i].meetingDate);
            date.setHours(0,0,0,0);
            if(Date.parse(item) === Date.parse(date.toString())){
              if(i == 0){
                this.responseData[i]["activeStatus"] = true;
              }else{
                this.responseData[i]["activeStatus"] = false;
              }
              this.responseData[i]["showCard"] = true;
              myArrayMeeting.push(this.responseData[i]);
            }
          }
          this.meetingListMap.set(Date.parse(item),myArrayMeeting);
        }

        this.meetingListMapSorted = this.meetingListMap;

        this.meetingListMap.forEach((val, key) => {
          for(let i=0;i<this.meetingListMap.get(key).length;i++){
            this.totalSize = this.totalSize+1;
          }
        });
        this.displaySize = this.totalSize;
      }else{
        this.recordExists = false;
      }
      this.getUserList();
      this.getTeamList();
    },error => {
      this.getUserList();
      this.getTeamList();
    });
    this.count =3;
    this.event=" Meeting";
    if(this.authService.getUserId()){

    }else{
      this.router.navigate([""]);
    }
  }

  resetFilter(){
    this.validateDatePicker.reset();
    this.meetingListMapSorted = this.meetingListMap;
    this.displaySize = this.totalSize;
    this.dateFrom = null;
    this.dateTo = null;
    this.showReset = false;
    this.allCheckedEvent = true;
    this.indeterminateEvent = false;
    this.checkOptionsOneEvent = [
      { label: 'Active Events', value: 'active', checked: true },
      { label: 'Canceled Event ', value: 'cancel', checked: true }
    ];
    this.allChecked = true;
    this.indeterminate = false;
    this.checkOptionsOne = [];
    this.httpClient.post<any>('https://dev.cloudmeetin.com/events/getevents', {userId :this.authService.getUserId()}).subscribe(
      response => {
        console.log("Response Event Data --- > ", response);
        if(response.data.length > 0){
          this.eventListTypeCheck = true;
          this.EventTypeSlotDashboard = response.data;
          for(let i = 0;i<response.data.length;i++){
            let item = {
              label: response.data[i].name,
              value: response.data[i].name,
              checked: true
            };
            this.checkOptionsOne.push(item);
          }
          if(response.data.length<=3) {
            this.EventTypeSlotDashboardForShow = response.data;
          }else{
            this.EventTypeSlotDashboardForShow = response.data;
            this.EventTypeSlotDashboardForShow.splice(3);
          }
        }
      },
      err => {

      });
  }

  onChange(result: Date[]): void {
    console.log("start Date===",result);
    if(result != null){
      if(result.length>0){
        this.dateFrom = new Date(result[ 0 ]);
        this.dateFrom.setHours(0,0,0);

        this.dateTo = new Date(result[ 1 ]);
        this.dateTo.setHours(23,59,59);

        this.filterByActive();
      }else{
        this.resetFilter();
      }
    }
  }

  filterByEvent() {
    this.filterByActive();
  }

  filterByActive() {
    this.showReset = true;
    if(this.dateFrom != null && this.dateTo != null){
      if(this.checkOptionsOne.length>0){
        this.meetingListMapSorted = new Map<any, any>();
        if(this.checkOptionsOneEvent[0].checked && this.checkOptionsOneEvent[1].checked){
          this.meetingListMapSorted = new Map<any, any>();
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i< val.length;i++){
              for(let j=0;j<this.checkOptionsOne.length;j++){
                if(this.checkOptionsOne[j].label === val[i].eventType && this.checkOptionsOne[j].checked){
                  let dateFrom = new Date(this.dateFrom.toString());
                  dateFrom.setHours(0,0,0,0);

                  let dateTo = new Date(this.dateTo.toString());
                  dateTo.setHours(0,0,0,0);

                  if(key >= Date.parse(dateFrom.toString()) && key <= Date.parse(dateTo.toString())){
                    myArrayMeeting.push(val[i]);
                  }
                }
              }
            }
            if(myArrayMeeting.length > 0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
          this.displaySize = 0;
          this.meetingListMapSorted.forEach((val, key) => {
            for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
              this.displaySize = this.displaySize+1;
            }
          });
          return;
        }
        this.meetingListMapSorted = new Map<any, any>();
        if(this.checkOptionsOneEvent[1].checked){
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<val.length;i++){
              for(let j=0;j<this.checkOptionsOne.length;j++){
                if(this.checkOptionsOne[j].label === val[i].eventType && this.checkOptionsOne[j].checked){
                  if(this.meetingListMap.get(key)[i].cancel == 'true'){
                    if(key >= Date.parse(this.dateFrom.toString()) && key <= Date.parse(this.dateTo.toString())){
                      myArrayMeeting.push(val[i]);
                    }
                    /*myArrayMeeting.push(this.meetingListMap.get(key)[i]);*/
                  }
                }
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        if(this.checkOptionsOneEvent[0].checked){
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<val.length;i++){
              for(let j=0;j<this.checkOptionsOne.length;j++){
                if(this.checkOptionsOne[j].label === val[i].eventType && this.checkOptionsOne[j].checked){
                  if(this.meetingListMap.get(key)[i].cancel != 'true'){
                    if(key >= Date.parse(this.dateFrom.toString()) && key <= Date.parse(this.dateTo.toString())){
                      myArrayMeeting.push(val[i]);
                    }
                    /* myArrayMeeting.push(this.meetingListMap.get(key)[i]);*/
                  }
                }
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        this.displaySize = 0;
        this.meetingListMapSorted.forEach((val, key) => {
          for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
            this.displaySize = this.displaySize+1;
          }
        });

      }else{
        this.meetingListMapSorted = new Map<any, any>();
        if(this.checkOptionsOneEvent[0].checked && this.checkOptionsOneEvent[1].checked){
          this.meetingListMapSorted = this.meetingListMap;
          this.displaySize = 0;
          this.meetingListMapSorted.forEach((val, key) => {
            for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
              this.displaySize = this.displaySize+1;
            }
          });
          return;
        }
        if(this.checkOptionsOneEvent[0].checked){
          //active events
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<this.meetingListMap.get(key).length;i++){
              if(this.meetingListMap.get(key)[i].cancel != 'true'){
                myArrayMeeting.push(this.meetingListMap.get(key)[i]);
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        if(this.checkOptionsOneEvent[1].checked){
          //cancel events
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<this.meetingListMap.get(key).length;i++){
              if(this.meetingListMap.get(key)[i].cancel == 'true'){
                myArrayMeeting.push(this.meetingListMap.get(key)[i]);
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        this.displaySize = 0;
        this.meetingListMapSorted.forEach((val, key) => {
          for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
            this.displaySize = this.displaySize+1;
          }
        });
      }
    }else{
      if(this.checkOptionsOne.length>0){
        this.meetingListMapSorted = new Map<any, any>();
        if(this.checkOptionsOneEvent[0].checked && this.checkOptionsOneEvent[1].checked){
          this.meetingListMapSorted = new Map<any, any>();
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i< val.length;i++){
              for(let j=0;j<this.checkOptionsOne.length;j++){
                if(this.checkOptionsOne[j].label === val[i].eventType && this.checkOptionsOne[j].checked){
                  myArrayMeeting.push(val[i]);
                }
              }
            }
            if(myArrayMeeting.length > 0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
          this.displaySize = 0;
          this.meetingListMapSorted.forEach((val, key) => {
            for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
              this.displaySize = this.displaySize+1;
            }
          });
          return;
        }
        this.meetingListMapSorted = new Map<any, any>();
        if(this.checkOptionsOneEvent[1].checked){
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<val.length;i++){
              for(let j=0;j<this.checkOptionsOne.length;j++){
                if(this.checkOptionsOne[j].label === val[i].eventType && this.checkOptionsOne[j].checked){
                  if(this.meetingListMap.get(key)[i].cancel == 'true'){
                    myArrayMeeting.push(this.meetingListMap.get(key)[i]);
                  }
                }
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        if(this.checkOptionsOneEvent[0].checked){
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<val.length;i++){
              for(let j=0;j<this.checkOptionsOne.length;j++){
                if(this.checkOptionsOne[j].label === val[i].eventType && this.checkOptionsOne[j].checked){
                  if(this.meetingListMap.get(key)[i].cancel != 'true'){
                    myArrayMeeting.push(this.meetingListMap.get(key)[i]);
                  }
                }
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }

        this.displaySize = 0;
        this.meetingListMapSorted.forEach((val, key) => {
          for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
            this.displaySize = this.displaySize+1;
          }
        });
      }else{
        this.meetingListMapSorted = new Map<any, any>();
        if(this.checkOptionsOneEvent[0].checked && this.checkOptionsOneEvent[1].checked){
          this.meetingListMapSorted = this.meetingListMap;
          this.displaySize = 0;
          this.meetingListMapSorted.forEach((val, key) => {
            for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
              this.displaySize = this.displaySize+1;
            }
          });
          return;
        }
        if(this.checkOptionsOneEvent[0].checked){
        //active events
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<this.meetingListMap.get(key).length;i++){
              if(this.meetingListMap.get(key)[i].cancel != 'true'){
                myArrayMeeting.push(this.meetingListMap.get(key)[i]);
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        if(this.checkOptionsOneEvent[1].checked){
        //cancel events
          this.meetingListMap.forEach((val, key) => {
            let myArrayMeeting = [];
            for(let i=0;i<this.meetingListMap.get(key).length;i++){
              if(this.meetingListMap.get(key)[i].cancel == 'true'){
                myArrayMeeting.push(this.meetingListMap.get(key)[i]);
              }
            }
            if(myArrayMeeting.length>0){
              this.meetingListMapSorted.set(key,myArrayMeeting);
            }
          });
        }
        this.displaySize = 0;
        this.meetingListMapSorted.forEach((val, key) => {
          for(let i=0;i<this.meetingListMapSorted.get(key).length;i++){
            this.displaySize = this.displaySize+1;
          }
        });
      }
    }
  }

  getUserList(){
    this.httpClient.post<{message: string,data: []}>('https://dev.cloudmeetin.com/usertable/getuserlist',{'userId': this.authService.getUserId()}).subscribe(res =>{
      console.log("res getuserlist=========",res);
      if(res.data.length > 0){
        this.userCheck = true;
      }
    },err => {

    });
  }
  getTeamList(){
    this.httpClient.post<{message: string,data: []}>('https://dev.cloudmeetin.com/team/getteamlist',{'userId': this.authService.getUserId()}).subscribe(res =>{
      console.log("getteamlist=========",res);
      if(res.data.length > 0){
        this.teamCheck = true;
      }
    },err => {
      console.log("getteamlist err=========",err);
    });
  }

  onSelectIndex(selectIndex: number) {
    this.indexSelect = selectIndex + 1;
  }
  onCancelMeeting(meetingDetail: any,key: string,index: any) {
    console.log("Event Id---",meetingDetail);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = meetingDetail;
    let dialogRef = this.dialog.open(DialogcancelmessageComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if(value !== undefined){
        if(value !== "false"){
          this.cancelMessage = value;
          meetingDetail["cancelMessage"] = value;
          /*meetingDetail["cancelBy"] = this.authService.getUserId();*/
          meetingDetail["cancelBy"] = this.authService.getFullName();
          meetingDetail['invitee'] = meetingDetail.schedulerName;
          meetingDetail.eventType = meetingDetail.eventType.split('m')[0];
          this.meetingService.cancelMeetingSchedule(meetingDetail);
          this.afterCancelMeeting(key,index,meetingDetail);
        }
      }
    });
  }
  afterCancelMeeting(key:string,index: string,meetingDetail: any){
    this.meetingListMapSorted.get(key)[index]["cancel"] = "true";
    this.meetingListMapSorted.get(key)[index]["cancelMessage"] = meetingDetail.cancelMessage;
    this.meetingListMapSorted.get(key)[index]["cancelBy"] = meetingDetail.cancelBy;
    this.userName = this.authService.getUserId();
  }

  onRescheduleMeeting(data: any) {
    this.router.navigate(['reschedule/'+data.meetingId]);
  }

  submit() {
    console.log("Return check box value", this.eventForm.value);
    if(this.eventForm.value.allEvent) {
      this.allEvent = 'true';
    } else {
      this.allEvent = 'false';
    }
  }

  editEvent(id: string,index: number) {
    console.log("Id===",id);
    console.log("index===",index);
    this.eventService.onEditEventMain(id, index);
  }

  copyEvent(event_link: string) {
    this.copyLink = 'https://dev.cloudmeetin.com/'+this.userId+"/"+event_link;
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.copyLink ;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.message.create('success', `Copied`);
  }

  emailEvent(event_link: string) {
    console.log("emailEvent===",event_link);
  }



  /*Dialog*/
  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.checkOptionsOne = this.checkOptionsOne.map(item => {
        return {
          ...item,
          checked: true
        };
      });
    } else {
      this.checkOptionsOne = this.checkOptionsOne.map(item => {
        return {
          ...item,
          checked: false
        };
      });
    }
  }

  updateSingleChecked(): void {
    if (this.checkOptionsOne.every(item => item.checked === false)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.checkOptionsOne.every(item => item.checked === true)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  updateEventSingleChecked(): void {
    if (this.checkOptionsOneEvent.every(item => item.checked === false)) {
      this.allCheckedEvent = false;
      this.indeterminateEvent = false;
    } else if (this.checkOptionsOneEvent.every(item => item.checked === true)) {
      this.allCheckedEvent = true;
      this.indeterminateEvent = false;
    } else {
      this.indeterminateEvent = true;
    }
  }
  /*end*/

  /*Dialog*/
  updateEventAllChecked(): void {
    this.indeterminateEvent = false;
    if (this.allCheckedEvent) {
      this.checkOptionsOneEvent = this.checkOptionsOneEvent.map(item => {
        return {
          ...item,
          checked: true
        };
      });
    } else {
      this.checkOptionsOneEvent = this.checkOptionsOneEvent.map(item => {
        return {
          ...item,
          checked: false
        };
      });
    }
  }

  visibleContent(keyValue: string,index: number) {
    if(this.meetingListMapSorted.get(keyValue)[index]["cancel"] !== "true"){
      this.meetingListMapSorted.get(keyValue)[index].showCard = false;
    }
  }

  inVisibleContent(keyValue: string,index: any) {
    this.meetingListMapSorted.get(keyValue)[index].showCard = true;
  }

  updateContent(keyValue: string,index: number, data: any) {
    this.meetingListMapSorted.get(keyValue)[index].showCard = true;
    this.meetingListMapSorted.get(keyValue)[index].schedulerEmail = this.updateEmail.value.email;
    this.dashboardService.updateMeetingEmail(data);
  }


}
