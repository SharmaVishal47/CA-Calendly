import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {DateAdapter, MatDatepicker, MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {MeetingService} from '../meeting.service';
import 'rxjs-compat/add/operator/filter';
import {AuthServiceLocal} from '../../Auth/auth.service';
import * as moment from 'moment-timezone';
import {DatePipe, formatDate} from '@angular/common';
import {Subscription} from 'rxjs';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';

import {NgxUiLoaderService} from 'ngx-ui-loader';
import {NgxUiLoaderDemoService} from '../ngx-ui-loader-demo.service';
import {MessageServiceService} from '../../Auth/message-service.service';

@Component({
  selector: 'app-metting',
  templateUrl: './metting.component.html',
  styleUrls: ['./metting.component.css']
})

export class MettingComponent<D> implements OnInit {

  maxDate;
  checkUTC;
  isSpinning: boolean = true;
  eventId: string;
  Meeting_owner;
  meeting_time;
  select_day = 'Select Day ';
  /*selectDate: any;*/
  timeZone: string;
  userTimeZone: string;
  selectedTimeZone: string;
  myFilter;
  userId: string;
  startDate = new Date();
  checkReschedule = false;
  minDate: D = this._dateAdapter.today();
  selected: D = this._dateAdapter.today();
  userTimeSlot = [];
  findId: boolean=false;
  singleValue="India, Sri Lanka Time (8:13pm)";
  size = 'default';
  availableSlot = [];
  availableSlotTemp = [];
  selectedCardIndex;
  meetingType;
  availableDays;
  confirmBoxSlot = false;
  private subscriptions: Array<Subscription> = [];
  selectedTimeSlot = {
    startTime: 1554337800000,
    endTime: 1554337800000
  };

  constructor(private messageService:MessageServiceService,private ngxLoader: NgxUiLoaderService,public demoService: NgxUiLoaderDemoService,private modalService: NzModalService,private _dateAdapter: DateAdapter<D>,private meetingService: MeetingService, private router: Router, private route: ActivatedRoute, private httpClient: HttpClient, private dialog: MatDialog,private authService: AuthServiceLocal) {
  }

  ngOnInit() {
    let curDate = new Date();
    this.maxDate = new Date(curDate.setMonth(curDate.getMonth()+2));

    this.meetingService.removeHeader(true);
    this.userId = this.meetingService.getUserId();

    this.meetingService.getDataFromLocalStorage();
    let newSubs = this.route.params.subscribe((params: Params) => {
      this.meetingType  = params['selectTime'];
      this.meeting_time = params['selectTime'];
      switch (this.meeting_time) {
        case '15min' :
          return this.meeting_time = '15 Minute Meeting';
        case '30min' :
          return this.meeting_time = '30 Minute Meeting';
        case '60min' :
          return this.meeting_time = '60 Minute Meeting';
        default :
          this.router.navigate(['/']);
      }
    });
    this.subscriptions.push(newSubs);
    this.meetingType = +this.meeting_time.toString().split(' M')[0];
    console.log("meetingType=========",this.meetingType);


    /*const newSubs1 = this.meetingService.availabileSlot.subscribe((availableSlot)=> {
      if(availableSlot != null){
        availableSlot.splice(0,1);
        this.availableSlot = [];
        this.availableSlotTemp = [];

        this.availableSlot = availableSlot;
        this.availableSlotTemp = availableSlot;

        let tempSlot = this.availableSlotTemp;
       this. isSpinning =false;

        /!*let slotForFilter = tempSlot.filter(item => Date.parse(item.startTime) >= Date.parse(new Date().toString()));
        tempSlot = slotForFilter;*!/

        console.log("before  availableSlot1===================",this.availableSlot);
        /!*console.log("filter availableSlot===================",tempSlot);*!/
        this.availableSlot = [];
        tempSlot.forEach(item => {
          let dateStart = new Date(new Date(item.startTime)).toLocaleString('en-US', {timeZone: this.selectedTimeZone});
          let dateEnd = new Date(new Date(item.endTime)).toLocaleString('en-US', {timeZone: this.selectedTimeZone});
          let data = {
            startTime:dateStart,
            endTime:dateEnd
          };
          this.availableSlot.push(data);
        });


        this.availableSlot.sort((a,b) => Date.parse(a.startTime) - Date.parse(b.startTime));


        console.log("this.availableSlot==========", this.availableSlot);

        if(this.availableSlot.length == 0){
          let curdate = new Date(this.selected.toString());
          beginning: while(true) {
            curdate.setDate(curdate.getDate() + 1);
            let curweekDay = curdate.getDay().toString();
            if(this.availableDays.indexOf(curweekDay)>-1){
              this.selected = this._dateAdapter.createDate(curdate.getFullYear(),curdate.getMonth(),curdate.getDate());
              this. isSpinning = true;
              this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
              break;
            }else{
              continue beginning;
            }
          }
        }
      }
      this.ngxLoader.stopLoader('loader-01');
    });*/
    /* This one change */
    const newSubs1 = this.meetingService.availabileSlot.subscribe((availableSlot)=> {
      console.log("Getting Available slot===========",availableSlot);
      if(availableSlot != null){
       /* availableSlot.splice(0,1);*/
        this.availableSlot = [];
        this.availableSlotTemp = [];

        this.availableSlot = availableSlot;
        this.availableSlotTemp = availableSlot;

        let tempSlot = this.availableSlotTemp;

        let currentTime = new Date();
        currentTime.setHours(currentTime.getHours()+4);

        let userCurrentTime = new Date(currentTime).toLocaleString('en-US', {timeZone: this.userTimeZone});
        console.log("userCurrentTime================",userCurrentTime);

        let slotForFilter = tempSlot.filter(item => Date.parse(item.startTime) >= Date.parse(userCurrentTime));
        tempSlot = slotForFilter;
        console.log("slotForFilter================",tempSlot);
        tempSlot.sort((a,b) => Date.parse(a.startTime) - Date.parse(b.startTime));
        this.userTimeSlot = tempSlot;

        console.log("before availableSlot1===================",this.availableSlot);
        console.log("before convert availableSlot1===================",this.userTimeSlot);
        /*console.log("filter availableSlot===================",tempSlot);*/
        this.availableSlot = [];
        tempSlot.forEach(item => {
          let dateStart = new Date(new Date(item.startTime)).toLocaleString('en-US', {timeZone: this.selectedTimeZone});
          let dateEnd = new Date(new Date(item.endTime)).toLocaleString('en-US', {timeZone: this.selectedTimeZone});
          let data = {
            startTime:dateStart,
            endTime:dateEnd
          };
          this.availableSlot.push(data);
        });


        //this.availableSlot.sort((a,b) => Date.parse(a.startTime) - Date.parse(b.startTime));


        console.log("this.availableSlot==========", this.availableSlot);

        if(this.availableSlot.length == 0){
          let curdate = new Date(this.selected.toString());
          beginning: while(true) {
            curdate.setDate(curdate.getDate() + 1);
            let curweekDay = curdate.getDay().toString();
            if(this.availableDays.indexOf(curweekDay)>-1){
              this.selected = this._dateAdapter.createDate(curdate.getFullYear(),curdate.getMonth(),curdate.getDate());
              this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
              break;
            }else{
              continue beginning;
            }
          }
        }else{
          this. isSpinning = false;
        }
      }else{
        this. isSpinning = false;
      }
    });
    this.subscriptions.push(newSubs1);


    // Get the query params from the url
    this.route.queryParams
      .filter(params => params.eid)
      .subscribe(params => {
        console.log(params);
        this.eventId = params.eid;
        if(this.eventId) {
          this.checkReschedule = true;
          this.select_day = 'Select a Day to Reschedule';
        }
        console.log('Get event id from url -->', this.eventId);
      });

    this.Meeting_owner = typeof (localStorage.getItem('fullName')) === 'string' && localStorage.getItem('fullName').split('').length > 0
      ? localStorage.getItem('fullName') :  this.router.navigate(['/']);

    this.meetingService.getMeetingAvailableDay(this.userId);
    const newSubs3 = this.meetingService.meetingAvailableDay.subscribe((res: any) => {
      console.log(res.data);
      if (res.data.length > 0) {
        this.timeZone = res.data[0].timeZone;
        this.selectedTimeZone = res.data[0].timeZone;
        this.userTimeZone = res.data[0].timeZone;

        this.startDate = new Date(new Date().toLocaleString('en-US', {timeZone: this.timeZone}));
        if (res.data[0].availableDays) {
          this.availableDays = res.data[0].availableDays.split(',');
          if (this.availableDays.length > 0) {
            let todayDate = new Date();
            let weekDay = todayDate.getDay().toString();

            if(this.availableDays.indexOf(weekDay)>-1){
              console.log("weekDay if=============",weekDay);
              this.ngxLoader.startLoader('loader-01');
              this. isSpinning =true;
              this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
            }else{
              console.log("weekDay else=============",weekDay);

              let curdate = new Date();
              beginning: while(true) {
                curdate.setDate(curdate.getDate() + 1);
                let curweekDay = curdate.getDay().toString();
                if(this.availableDays.indexOf(curweekDay)>-1){
                  this.selected = this._dateAdapter.createDate(curdate.getFullYear(),curdate.getMonth(),curdate.getDate());
                  this.ngxLoader.startLoader('loader-01');
                  this. isSpinning = true;
                  this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
                  break;
                }else{
                  continue beginning;
                }
              }
            }
            this.myFilter = (d: Date): boolean => {
              let day = d.getDay();
              if (this.availableDays.indexOf(day.toString()) > -1) {
                let day = this.availableDays.indexOf(d.getDay());
                return day !== this.availableDays[day];
              }
            };
          } else {
            this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
            this.myFilter = (d: Date): boolean => {
              const day = d.getDay();
              return day !== 0 && day !== 1 && day !== 2 && day !== 3 && day !== 4 && day !== 5 && day !== 6;
            };
          }
        } else {
          this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
          this.myFilter = (d: Date): boolean => {
            const day = d.getDay();
            return day !== 0 && day !== 1 && day !== 2 && day !== 3 && day !== 4 && day !== 5 && day !== 6;
          };
        }
      }
    }, error => {
      console.log('error====', error);
      this.messageService.generateErrorMessage(error);
    });
    this.subscriptions.push(newSubs3);
  }

  select(value: D) {
    console.log("DAte=====",value);
    this.selected = value;
    this.ngxLoader.startLoader('loader-01');
    this. isSpinning = true;
    this.meetingService.getCalendarEventSlot(this.meetingType,this.selected.toString());
  }


  onCardClick(selectedTimeSlot: any,index: number){
    this.selectedTimeSlot = selectedTimeSlot;
    this.selectedCardIndex = index;
    console.log("user time=====",this.userTimeSlot[index]);
    console.log("selected time time=====",selectedTimeSlot);
    this.checkUTC= moment(selectedTimeSlot.startTime).tz(this.selectedTimeZone ).format();
    this.confirmBoxSlot =  true;
  }



  changeTimezone(timezone) {
    this.selectedTimeZone = timezone;
    let tempSlot = this.availableSlotTemp;

    let currentTime = new Date();
    currentTime.setHours(currentTime.getHours()+4);

    let userCurrentTime = new Date(currentTime).toLocaleString('en-US', {timeZone: this.userTimeZone});
    console.log("userCurrentTime================",userCurrentTime);

    let slotForFilter = tempSlot.filter(item => Date.parse(item.startTime) >= Date.parse(userCurrentTime));
    console.log("slotForFilter===================",slotForFilter);
    tempSlot = slotForFilter;
    tempSlot.sort((a,b) => Date.parse(a.startTime) - Date.parse(b.startTime));

    this.userTimeSlot = tempSlot;

    console.log("before timeZone availableSlot===================",this.availableSlotTemp);
    console.log("before userTimeSlot availableSlot===================",this.userTimeSlot);
    /*console.log("filter availableSlot===================",tempSlot);*/
    this.availableSlot = [];
    tempSlot.forEach(item => {
      if(item.startTime != null && item.startTime != undefined && item.endTime != null && item.endTime != undefined ){
        let dateStart = new Date(new Date(item.startTime)).toLocaleString('en-US', {timeZone: timezone});
        let dateEnd = new Date(new Date(item.endTime)).toLocaleString('en-US', {timeZone: timezone});
        let data = {
          startTime:dateStart,
          endTime:dateEnd
        };
        this.availableSlot.push(data);
      }
    });

    //this.availableSlot.sort((a,b) => Date.parse(a.startTime) - Date.parse(b.startTime));
    console.log("after timeZone availableSlot===================",this.availableSlot);

  }
  /* This one change*/
  /*changeTimezone(timezone) {
    this.selectedTimeZone = timezone;
    let tempSlot = this.availableSlotTemp;

    /!*let slotForFilter = tempSlot.filter(item => Date.parse(item.startTime) >= Date.parse(new Date().toString()));
    tempSlot = slotForFilter;*!/


    console.log("before timeZone availableSlot===================",this.availableSlotTemp);
    /!*console.log("filter availableSlot===================",tempSlot);*!/
    this.availableSlot = [];
    tempSlot.forEach(item => {
      let dateStart = new Date(new Date(item.startTime)).toLocaleString('en-US', {timeZone: timezone});
      let dateEnd = new Date(new Date(item.endTime)).toLocaleString('en-US', {timeZone: timezone});
      let data = {
        startTime:dateStart,
        endTime:dateEnd
      };
      this.availableSlot.push(data);
    });

    this.availableSlot.sort((a,b) => Date.parse(a.startTime) - Date.parse(b.startTime));
    console.log("timeZone availableSlot===================",this.availableSlot);

  }*/

  ngOnDestroy() {
    this.meetingService.deleteListTimeArray();
    console.log("Call on destroy");
    for (const subs of this.subscriptions) {
      subs.unsubscribe();
    }
  }

  closePopup() {
    this.confirmBoxSlot =  false;
  }

  confirmMeeting() {
    console.log("Selected=============",this.selectedTimeSlot);
    let date = new Date(this.selected.toString());
    date.setHours(0,0,0);
    localStorage.setItem('selectedDate', date.toString());
    localStorage.setItem('userTimeZone', this.userTimeZone);
    localStorage.setItem('selectedTimeZone', this.selectedTimeZone);
    localStorage.setItem('selectedStartTime', ""+this.selectedTimeSlot.startTime);
    localStorage.setItem('selectedEndTime', ""+this.selectedTimeSlot.endTime);
    localStorage.setItem('userStartTime', ""+this.userTimeSlot[this.selectedCardIndex].startTime);
    localStorage.setItem('userEndTime', ""+this.userTimeSlot[this.selectedCardIndex].endTime);
    /*let expectedDay = new Date(this.selected.toString()).getDay();*/
    /*this.router.navigate([expectedDay], {relativeTo: this.route, queryParamsHandling: 'merge'});*/
    this.confirmBoxSlot =  false;
    this.router.navigate(['schedulingPage'], {relativeTo: this.route});
  }
}

