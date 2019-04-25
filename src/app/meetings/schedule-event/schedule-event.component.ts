import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MeetingService} from '../meeting.service';
import {AuthServiceLocal} from '../../Auth/auth.service';
import {MessageServiceService} from '../../Auth/message-service.service';

@Component({
  selector: 'app-schedule-event',
  templateUrl: './schedule-event.component.html',
  styleUrls: ['./schedule-event.component.css']
})
export class ScheduleEventComponent implements OnInit {
  isLoadingOne = false;
  name;
  email;
  phone;
  userName = '';
  meetingUserInfoForm: FormGroup;
  meetingTime = '';
  meetingDateTime = '';
  selectedStartTime ;
  userImagePreview;
  selectedEndTime;
  goToMeetingStartDateTime;
  selectedTimeZone = '';
  userTimeZone = '';
  _dateFormatEnd;
  meetingOptionList = [];
  meetingSelectedOption: string;
  checkMeetingOption = false;
  data;
  meetIngData;
  rescheduleRecords;
  btnValue: string = 'Schedule Event';
  rescheduleDetails;
  userStartTime;
  userEndTime;
  rescheduleBack;


  constructor( private messageService:MessageServiceService, private authServiceLocal: AuthServiceLocal,private fb: FormBuilder, private meetingService: MeetingService, private router: Router, private httpClient: HttpClient, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.meetingUserInfoForm = this.fb.group({
      fullName: [null, [Validators.required]],
      email: [null, [Validators.required]],
      phone: [null],
      description:[null],
      reasonOfRescheduling:[null],
    });
    this.meetingService.messageOff.subscribe(res=>{
      this.isLoadingOne = res;
    });
    if(this.authServiceLocal.getIsAuthenticated()){
      this.meetingService.removeHeader(false);
    }else{
      this.meetingService.removeHeader(true);
    }
    this.rescheduleBack = '/reschedule/'+localStorage.getItem('reschduleMeetingId');
    this.userImagePreview = localStorage.getItem("imagePreview");
    this.rescheduleRecords = this.meetingService.getRescheduleRecords();
    if(this.rescheduleRecords) {
      this.btnValue = 'Reschedule Event'
    }
    //this.meetingService.removeHeader(true);
    this.meetingService.checkMeetingPlatform();
    this.meetingService.meetingPlatform.subscribe(res => {
      if (res.data.length > 0) {
        if (res.data[0].go2meeting != null && res.data[0].go2meeting != "false") {
          this.checkMeetingOption = true;
          this.meetingOptionList.push('GoToMeeting');
          this.meetingSelectedOption = 'GoToMeeting';
        }
        if (res.data[0].salesforce) {
          this.checkMeetingOption = true;
          this.meetingOptionList.push('Salesforce');
          this.meetingSelectedOption = 'Salesforce';
        }
        if (res.data[0].zoom) {
          this.checkMeetingOption = true;
          this.meetingOptionList.push('Zoom');
          this.meetingSelectedOption = 'Zoom';
        }
      }
    }, error => {
      console.log('error====', error);
      this.messageService.generateErrorMessage(error)
    });


    this.userName = localStorage.getItem('fullName');
    this.meetingTime = localStorage.getItem('eventType').split('m')[0] + ' Minute Meeting';
    this.meetingDateTime = localStorage.getItem('selectedDate');
    this.selectedStartTime = Date.parse(localStorage.getItem('selectedStartTime'));
    this.userStartTime = Date.parse(localStorage.getItem('userStartTime'));
    this.selectedEndTime = Date.parse(localStorage.getItem('selectedEndTime'));
    this.userEndTime = Date.parse(localStorage.getItem('userEndTime'));
    this.selectedTimeZone = localStorage.getItem('selectedTimeZone');
    this.userTimeZone = localStorage.getItem('userTimeZone');

    if(this.rescheduleRecords){
      this.meetingUserInfoForm.patchValue({
        fullName: this.rescheduleRecords.schedulerName,
        email: this.rescheduleRecords.schedulerEmail,
        phone: this.rescheduleRecords.schedulerPhone
      });
    }
  }


  onSubmit() {
    let curDate = new Date();
    curDate.setHours(0,0,0);
    this.isLoadingOne = true;
    for (const i in this.meetingUserInfoForm.controls) {
      this.meetingUserInfoForm.controls[i].markAsDirty();
    }
    let Meeting_owner = localStorage.getItem('fullName');
    if(this.authServiceLocal.getIsAuthenticated()){
      if(this.authServiceLocal.getUserId() == localStorage.getItem("userIdMeeting")){
        this.data = {
          userId: localStorage.getItem('userIdMeeting'),
          timeZone: localStorage.getItem('selectedTimeZone'),
          eventType: localStorage.getItem('eventType'),
          starttime: localStorage.getItem('userStartTime'),
          endtime: localStorage.getItem('userEndTime'),
          date: localStorage.getItem('selectedDate'),
          schedulerName: this.meetingUserInfoForm.value.fullName,
          schedulerEmail: this.meetingUserInfoForm.value.email,
          schedulerPhone: this.meetingUserInfoForm.value.phone,
          schedulerDescription: this.meetingUserInfoForm.value.description,
          reschedulerName: localStorage.getItem('fullName'),
          Meeting_owner: Meeting_owner,
          createdDate: curDate,
          userTimeZone : this.userTimeZone
        };
      }else{
        this.data = {
          userId: localStorage.getItem('userIdMeeting'),
          timeZone: localStorage.getItem('selectedTimeZone'),
          eventType: localStorage.getItem('eventType'),
          starttime: localStorage.getItem('userStartTime'),
          endtime: localStorage.getItem('userEndTime'),
          date: localStorage.getItem('selectedDate'),
          schedulerName: this.meetingUserInfoForm.value.fullName,
          schedulerEmail: this.meetingUserInfoForm.value.email,
          schedulerPhone: this.meetingUserInfoForm.value.phone,
          schedulerDescription: this.meetingUserInfoForm.value.description,
          reschedulerName: this.meetingUserInfoForm.value.fullName,
          Meeting_owner: Meeting_owner,
          createdDate: curDate,
          userTimeZone : this.userTimeZone
        };
      }
    }else{
      this.data = {
        userId: localStorage.getItem('userIdMeeting'),
        timeZone: localStorage.getItem('selectedTimeZone'),
        eventType: localStorage.getItem('eventType'),
        starttime: localStorage.getItem('userStartTime'),
        endtime: localStorage.getItem('userEndTime'),
        date: localStorage.getItem('selectedDate'),
        schedulerName: this.meetingUserInfoForm.value.fullName,
        schedulerEmail: this.meetingUserInfoForm.value.email,
        schedulerPhone: this.meetingUserInfoForm.value.phone,
        schedulerDescription: this.meetingUserInfoForm.value.description,
        reschedulerName: this.meetingUserInfoForm.value.fullName,
        Meeting_owner: Meeting_owner,
        createdDate: curDate,
        userTimeZone : this.userTimeZone
      };
    }

  console.log("this.userTimeZone======",this.userTimeZone);
    this.meetIngData = {
      'subject': this.meetingUserInfoForm.value.fullName,
      'starttime': new Date(this.userStartTime),
      'endtime': new Date(this.userEndTime),
      'passwordrequired': false,
      'conferencecallinfo': 'hybrid',
      'timezonekey': localStorage.getItem('selectedTimeZone'),
      'meetingtype': 'scheduled'
    };
    if(this.btnValue == 'Schedule Event') {
      if (this.checkMeetingOption) {
        console.log("_------------------data --- >> ", this.data);
        this.meetingService.getGoToMeeting(this.meetIngData, this.data);
      } else {
        console.log("call gtm meeting=================");
        this.meetingService.addMeetingToDatabase(this.meetIngData, this.data);
      }
    } else {
      /*this.data['reschedulerName'] = this.userName;*/
      this.data['rescheduleReason'] = this.meetingUserInfoForm.value.reasonOfRescheduling;
      this.data['eventId'] = localStorage.getItem("eventId");
      console.log('data-------------------->>', this.data);
      console.log('meetIngData-------------------->>', this.meetIngData);
      this.meetingService.rescheduleMeeting(this.data, this.meetIngData);
    }
  }
}
