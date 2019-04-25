import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../messagedialog/messagedialog.component';
import {DatePipe, formatDate} from '@angular/common';
import {AuthService} from 'angular-6-social-login';
import {MeetingRecord} from '../model/meeting-record';
import * as moment from 'moment-timezone';
import {NzMessageService} from 'ng-zorro-antd';
import {MessageServiceService} from '../Auth/message-service.service';
@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  meetingUID;

  access_token;
  expires_in;
  organizer_key;
  refresh_token;
  _meetingAuthUser: MeetingAuthUser[];
  _meetingAuthUserRecord = new Subject<MeetingAuthUser[]>();
  getTimePeriod = new Subject<any>();
  userLocalStorageData = new Subject<any>();
  meetingAvailableDay = new Subject<any>();
  authStatusListener = new Subject<boolean>();
  meetingPlatform = new Subject<any>();
  inetgrationGTMDetail = new Subject<any>();
  messageOff = new Subject<any>();
  expectedDay: string;
  expectedDate;
  timeArray = [];
  listTimeArray = [];
  timeZone: string;
  expectedTime;
  goToMeetingStartDateTime;
  goToMeetingEndDateTime;
  _dateFormatEnd;

  gtm_access_token: string;
  gtm_expires_in: string;
  gtm_organizer_key: string;
  gtm_refresh_token: string;
  meetIngData;
  data;
  isAuthicated: boolean = false;

  selectDate;

  jsonSlotArray =[];
  userSlotArray = [];
  availabileSlot = new Subject<any>();
  jsonSlotArrayTemp = [];
  constructor(
    private messageService:MessageServiceService,
    private httpClient: HttpClient,
    private router: Router,
    public datepipe: DatePipe,
    private dialog: MatDialog,
    private authService: AuthService,
    private message: NzMessageService
  ) {

  }
  /* Get go to meeting details from database*/
  gotoMeetingDetail(){
    this.httpClient.post<any>('https://dev.cloudmeetin.com/integration/getgotomeeting', {userId: localStorage.getItem('userId')}).subscribe(
      res => {
        this.inetgrationGTMDetail.next(res);
      },
      err => {
        console.log('AccessToken Error=========', err.message);
        this.showDialog(err.message);
      });
  }

// This method used to get authicated user Details for meeting schudule
  authUserRecord(data: { userId: string }) {
    this.httpClient.post<{ message: string, data: MeetingAuthUser[] }>
    ('https://dev.cloudmeetin.com/user/checkuser', data).subscribe((responseData) => {
      this._meetingAuthUser = responseData.data;
      this._meetingAuthUserRecord.next([...this._meetingAuthUser]);
    });
  }

  removeHeader(check: boolean) {
    console.log("Check ===>>", check);
    this.isAuthicated = check;
    this.authStatusListener.next(this.isAuthicated);
  }

// This method used to store the event records in local storage
  saveEvent(event: string, email: string, userId: string, Meeting_owner: string) {
    localStorage.setItem('eventType', event);
    localStorage.setItem('email', email);
    localStorage.setItem('userIdMeeting', userId);
    localStorage.setItem('fullName', Meeting_owner);
    this.router.navigate([userId + '/' + event]);
  }

  // This method used to store the event records in local storage
  saveRescheduleRecord(event: string, email: string, userId: string, Meeting_owner: string, eventID: string) {
    localStorage.setItem('eventType', event);
    localStorage.setItem('c_email', email);
    localStorage.setItem('email', localStorage.getItem("emailId"));
    localStorage.setItem('userId', userId);
    localStorage.setItem('fullName', Meeting_owner);
    localStorage.setItem('eventID', eventID);
    this.router.navigate([userId + '/' + event], {queryParams: {eid: eventID}});
  }

  // This method used to get the records from local storage
  getDataFromLocalStorage() {
    let data = {
      'eventType': localStorage.getItem('eventType'),
      'email': localStorage.getItem('email'),
      'userId': localStorage.getItem('userIdMeeting'),
      'fullName': localStorage.getItem('fullName')
    };
    // this.userLocalStorageData.next(data);
    return data;
  }

  //  This method used to get the available meeting day from database
  getMeetingAvailableDay(userId: string) {
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/getAvailableDays', {userId: userId}).subscribe(res => {
      this.meetingAvailableDay.next(res);
    });
  }

  getUserId() {
    return localStorage.getItem('userIdMeeting');
  }

  getUserEmail() {
    return localStorage.getItem('email');
  }

  getUserEmailId () {
    return localStorage.getItem('emailId');
  }

  deleteListTimeArray() {
    console.log("finally call");
    this.listTimeArray = [];
    this.timeArray = [];
    this.userSlotArray= [];
  }

  getDay(expectedDate: number) {
    switch (expectedDate) {
      case 0 :
        this.expectedDay = 'Sunday';
        break;
      case 1 :
        this.expectedDay = 'Monday';
        break;
      case 2 :
        this.expectedDay = 'Tuesday';
        break;
      case 3 :
        this.expectedDay = 'Wednesday';
        break;
      case 4 :
        this.expectedDay = 'Thursday';
        break;
      case 5 :
        this.expectedDay = 'Friday';
        break;
      case 6 :
        this.expectedDay = 'Saturday';
        break;
      default :
        this.router.navigate(['/']);
    }
    return this.expectedDay;
  }

  getSelectedDateAndTimeZone() {
    let data;
    let _selectedDate = typeof (localStorage.getItem('selectedDate')) === 'string' && localStorage.getItem('selectedDate')
      .split('').length > 0 ? localStorage.getItem('selectedDate') : false;
    let _timeZone = typeof (localStorage.getItem('timeZone')) === 'string' && localStorage.getItem('timeZone')
      .split('').length > 0 ? localStorage.getItem('timeZone') : false;
    let userEmail = typeof (localStorage.getItem('email')) === 'string' && localStorage.getItem('email')
      .split('').length > 0 ? localStorage.getItem('email') : false;
    if (_selectedDate && _timeZone && userEmail) {
      data = {
        'timezone': _timeZone,
        'selectedDate': _selectedDate,
        'userEmail': userEmail
      };
    } else {
      this.router.navigate(['/']);
    }
    return data;
  }

  userSelectTimePeriod(userEmail: string | boolean, expectedDate: any, timeZone: string) {
    this.expectedDate = expectedDate;
    this.timeZone = timeZone;
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/gettime', {email: userEmail})
      .subscribe((responseData) => {
        // this.getTimePeriod.next(responseData);
        this.httpClient.post<any>('https://dev.cloudmeetin.com/filter/meetingTime', {
          userId: this.getUserId(),
          meetingDate: this.expectedDate
        }).subscribe((responseDataByUserID) => {
          console.log('responseDataByUserId --  >  > > ', responseDataByUserID.data);
          if (responseDataByUserID.data.length > 0) {
            let userId = responseDataByUserID.data[0].userId;
            let meetingDate = responseDataByUserID.data[0].meetingDate;
            let meetingTimeList = responseDataByUserID.data[0].meetingTimeList;
            console.log('userId', userId + 'meetinDate ', meetingDate + 'meetingTimeList', meetingTimeList);
            let startTime = responseData.data[0].startTime.split(':');
            let endTime = responseData.data[0].endTime.split(':');
            let userEventType = typeof localStorage.getItem('eventType') === 'string' && localStorage.getItem('eventType').split('').length > 0
            && (localStorage.getItem('eventType') === '15min' || localStorage.getItem('eventType') === '30min') ? localStorage.getItem('eventType') : 0;
            // if date will be match in database
            if (userEventType) {
              for (let i = +startTime[0]; i <= endTime[0]; i++) {
                if (i == 0) {
                  this.timeArray.push(12 + ':00 AM');
                  this.timeArray.push(12 + ':30 AM');
                } else if (i < 12) {
                  this.timeArray.push(i + ':00 AM');
                  this.timeArray.push(i + ':30 AM');
                } else if (i == 12) {
                  this.timeArray.push(i + ':00 PM');
                  this.timeArray.push(i + ':30 PM');
                } else if (i > 12) {
                  let j = i - 12;
                  this.timeArray.push(j + ':00 PM');
                  this.timeArray.push(j + ':30 PM');
                }
              }
              this.timeArray.pop();

            } else {
              for (let i = +startTime[0]; i <= endTime[0]; i++) {
                if (i == 0) {
                  this.timeArray.push(12 + ':00 am');
                } else if (i < 12) {
                  this.timeArray.push(i + ':00 am');
                } else if (i == 12) {
                  this.timeArray.push(i + ':00 pm');
                } else if (i > 12) {
                  let j = i - 12;
                  this.timeArray.push(j + ':00 pm');
                }
              }
            }

            for (let item of this.timeArray) {
              let time = this.datepipe.transform(this.expectedDate, 'yyyy-MM-dd') + ' ' + item;
              let convertedTime = new Date(new Date(time)).toLocaleString('en-US', {timeZone: this.timeZone});
              let hours = new Date(convertedTime).toLocaleTimeString().split(':');
              console.log('hours====', hours[0].length, typeof hours[0]);
              let returnValue = typeof hours[0] === 'string' && hours[0].length == 1 ? '0' + new Date(convertedTime).toLocaleTimeString() : new Date(convertedTime).toLocaleTimeString();
              console.log('MeetingDate ---->>', meetingDate);
              if (meetingDate === this.expectedDate) {
                this.listTimeArray.push(returnValue);
                let splitMeetingList = meetingTimeList.split(',');
                console.log(splitMeetingList);
                for (let i = 0; i < splitMeetingList.length; i++) {
                  if (this.listTimeArray.indexOf(splitMeetingList[i]) > -1) {
                    this.listTimeArray.splice(this.listTimeArray.indexOf(meetingTimeList), splitMeetingList.length);
                    localStorage.setItem('UpdateQuery', String(true));
                    localStorage.setItem('meetingTimeList', meetingTimeList);
                  }
                }
              } else {
                this.listTimeArray.push(returnValue);
              }

            }
          } else {
            console.log('Else Part ------------>>>');
            let startTime = responseData.data[0].startTime.split(':');
            let endTime = responseData.data[0].endTime.split(':');
            let userEventType = typeof localStorage.getItem('eventType') === 'string' && localStorage.getItem('eventType').split('').length > 0
            && (localStorage.getItem('eventType') === '15min' || localStorage.getItem('eventType') === '30min') ? localStorage.getItem('eventType') : 0;
            // if date will be match in database
            if (userEventType) {
              for (let i = +startTime[0]; i <= endTime[0]; i++) {
                if (i == 0) {
                  this.timeArray.push(12 + ':00 AM');
                  this.timeArray.push(12 + ':30 AM');
                } else if (i < 12) {
                  this.timeArray.push(i + ':00 AM');
                  this.timeArray.push(i + ':30 AM');
                } else if (i == 12) {
                  this.timeArray.push(i + ':00 PM');
                  this.timeArray.push(i + ':30 PM');
                } else if (i > 12) {
                  let j = i - 12;
                  this.timeArray.push(j + ':00 PM');
                  this.timeArray.push(j + ':30 PM');
                }
              }
              this.timeArray.pop();
            } else {
              for (let i = +startTime[0]; i <= endTime[0]; i++) {
                if (i == 0) {
                  this.timeArray.push(12 + ':00 am');
                } else if (i < 12) {
                  this.timeArray.push(i + ':00 am');
                } else if (i == 12) {
                  this.timeArray.push(i + ':00 pm');
                } else if (i > 12) {
                  let j = i - 12;
                  this.timeArray.push(j + ':00 pm');
                }
              }
            }

            for (let item of this.timeArray) {
              let time = this.datepipe.transform(this.expectedDate, 'yyyy-MM-dd') + ' ' + item;
              let convertedTime = new Date(new Date(time)).toLocaleString('en-US', {timeZone: this.timeZone});
              let hours = new Date(convertedTime).toLocaleTimeString().split(':');
              console.log('hours====', hours[0].length, typeof hours[0]);
              let returnValue = typeof hours[0] === 'string' && hours[0].length == 1 ? '0' + new Date(convertedTime).toLocaleTimeString() : new Date(convertedTime).toLocaleTimeString();
              this.listTimeArray.push(returnValue);
            }
          }
          console.log("This List time Array", this.listTimeArray);
          this.getTimePeriod.next(this.listTimeArray);
        }, error => {
          console.log('error====', error);
          this.messageService.generateErrorMessage(error);
          /*const dialogConfig = new MatDialogConfig();
          dialogConfig.data = error;
          this.dialog.open(MessagedialogComponent, dialogConfig);*/
        });

      }, error => {
        console.log('error====', error);
        this.messageService.generateErrorMessage(error);
      /*  const dialogConfig = new MatDialogConfig();
        dialogConfig.data = error;
        this.dialog.open(MessagedialogComponent, dialogConfig);*/
      });
  }

  checkMeetingPlatform() {
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkMeetingPlatform', {userId: localStorage.getItem("userIdMeeting")}).subscribe(
      res => {
        this.meetingPlatform.next(res);
      }, error => {
        console.log("error====", error);
        this.messageService.generateErrorMessage("Something went gone wrong.");
        /*const dialogConfig = new MatDialogConfig();
        dialogConfig.data = error;
        this.dialog.open(MessagedialogComponent, dialogConfig);*/
      });
  }

  meetingStartTime() {
    let _selectedDate = localStorage.getItem('selectedDate');
    // @ts-ignore
    let _selectTime = localStorage.getItem('selectedTime');
    if (_selectTime.indexOf('a') > -1) {
      this.expectedTime = localStorage.getItem('selectedTime').split(' ');
    } else {
      this.expectedTime = localStorage.getItem('selectedTime').split(' ');
    }
    let date = new Date(_selectedDate);
    let _dateFormat = formatDate(date, 'yyyy-MM-dd', 'en-US');
    return this.goToMeetingStartDateTime = _dateFormat + 'T' + this.expectedTime[0] + 'Z';
  }

  meetingEndTime(_goToMeetingStartDateTime: Date) {
    let meetingRecords = this.getDataFromLocalStorage();
    let timePeriod = meetingRecords.eventType.split('m');
    let d = new Date(_goToMeetingStartDateTime);
    // @ts-ignore
    d.setMinutes( _goToMeetingStartDateTime.toString().split(":")[1] != '00' ? timePeriod[0] - 330 : timePeriod[0] - 300);
    this.goToMeetingEndDateTime = d;
    /*this._dateFormatEND = formatDate(this.goToMeetingEndDateTime, 'yyyy-MM-dd HH:mm:ss Z:', 'en-US');*/
    this._dateFormatEnd = formatDate(this.goToMeetingEndDateTime, 'yyyy-MM-ddThh:mm:ss', 'en-US');
    return this._dateFormatEnd + 'Z';
  }

  /* This function used for set the meeting time on timezone*/
  meetingTimeFormat(_startTime, _endTime, timeZone, callback) {
      /*let selectedDate = localStorage.getItem('selectedDate').split(' ')[2];
    if(_startTime && _endTime && timeZone) {
      console.log("StartTime is ", _startTime, ' endTime is ', _endTime, ' and Time Zone is ', timeZone);
      let newDate = new Date(_startTime);
      let hours =  newDate.getHours(); // => 9
      let minutes  = newDate.getMinutes(); // =>  30

      let sTime = moment(_startTime).tz(timeZone).utc().format().split('T') [0].split('-');
      let  _firstTime = moment(_startTime).tz(timeZone).format().split('T') [0].split('-');
      let startTime = sTime[0] + '-' + sTime[1] +'-' + selectedDate;
      let timeOffSet;
      let mainStartTime;

        if( typeof (moment(_startTime).tz(timeZone).format().split('+')[1]) == 'string' && moment(_startTime).tz(timeZone).format().split('+')[1] != 'undefined') {
          timeOffSet = moment(_startTime).tz(timeZone).format().split('+')[1];
          if(hours.toString().length == 1  && minutes.toString().length ==1 ) {
            mainStartTime = startTime + 'T0' + hours + ':' +  '0' +minutes + ':'+ '00' +'+' +timeOffSet;
          } else if(hours.toString().length == 1  && minutes.toString().length !=1 ) {
            mainStartTime = startTime + 'T0' + hours + ':' +  minutes + ':'+ '00' +'+' +timeOffSet;
          } else if(hours.toString().length != 1  && minutes.toString().length ==1 ) {
            mainStartTime = startTime + 'T' + hours + ':' +  '0'+minutes + ':'+ '00' +'+' +timeOffSet;
          } else {
            mainStartTime = startTime + 'T' + hours + ':' +minutes + ':'+ '00' +'+' +timeOffSet;
          }
        } else {
          timeOffSet =  moment(_startTime).tz(timeZone).format().split(':00-')[1];
          if(hours.toString().length == 1  && minutes.toString().length ==1 ) {
            mainStartTime = startTime + 'T0' + hours + ':' +  '0' +minutes + ':'+ '00' +'-' +timeOffSet;
          } else if(hours.toString().length == 1  && minutes.toString().length !=1 ) {
            mainStartTime = startTime + 'T0' + hours + ':' +  minutes + ':'+ '00' +'-' +timeOffSet;
          } else if(hours.toString().length != 1  && minutes.toString().length ==1 ) {
            mainStartTime = startTime + 'T' + hours + ':' +  '0'+minutes + ':'+ '00' +'-' +timeOffSet;
          } else {
            mainStartTime = startTime + 'T' + hours + ':' + minutes + ':'+ '00' +'-' +timeOffSet;
          }
        }
      let endNewDate = new Date(_endTime);
      let endHours =  endNewDate.getHours();
      let endMinutes  = endNewDate.getMinutes();
      let  eTime= moment(_endTime).tz(timeZone).utc().format().split('T') [0].split('-');
      let _timeDiff = moment(_endTime).tz(timeZone).format().split('T') [0].split('-');

      let dateDiff = parseInt(_timeDiff[2])- parseInt(_firstTime[2]);
      console.log("parseInt(selectedDate) + dateDiff",parseInt(selectedDate) + dateDiff);
      let changeDate = parseInt(selectedDate) + dateDiff;
      let mainTimeDiff = changeDate.toString().length == 1 ? '0'+changeDate.toString(): changeDate.toString();

       let endTime = eTime[0] + '-' + eTime[1] +'-' + mainTimeDiff;
      let endTimeOffSet;
      let mainEndTime;
      if( typeof (moment(_endTime).tz(timeZone).format().split('+')[1]) == 'string' && moment(_endTime).tz(timeZone).format().split('+')[1] != 'undefined') {
        endTimeOffSet = moment(_endTime).tz(timeZone).format().split('+')[1];
        if(endHours.toString().length == 1  && endMinutes.toString().length ==1 ) {
          mainEndTime = endTime + 'T0' + endHours + ':' +  '0' +endMinutes + ':'+ '00' +'+' +endTimeOffSet;
        } else if(endHours.toString().length == 1  && endMinutes.toString().length !=1 ) {
          mainEndTime = endTime + 'T0' + endHours + ':' +  endMinutes + ':'+ '00' +'+' +endTimeOffSet;
        } else if(endHours.toString().length != 1  && endMinutes.toString().length ==1 ) {
          mainEndTime = endTime + 'T' + endHours + ':' +  '0'+endMinutes + ':'+ '00' +'+' +endTimeOffSet;
        } else {
          mainEndTime = endTime + 'T' + endHours + ':' +endMinutes + ':'+ '00' +'+' +endTimeOffSet;
        }
      } else {
        endTimeOffSet =  moment(_endTime).tz(timeZone).format().split(':00-')[1];
        if(endHours.toString().length == 1  && endMinutes.toString().length ==1 ) {
          mainEndTime = endTime + 'T0' + endHours + ':' +  '0' +endMinutes + ':'+ '00' +'-' +endTimeOffSet;
        } else if(endHours.toString().length == 1  && endMinutes.toString().length !=1 ) {
          mainEndTime = endTime + 'T0' + endHours + ':' +  endMinutes + ':'+ '00' +'-' +endTimeOffSet;
        } else if(endHours.toString().length != 1  && endMinutes.toString().length ==1 ) {
          mainEndTime = endTime + 'T' + endHours + ':' +  '0'+endMinutes + ':'+ '00' +'-' +endTimeOffSet;
        } else {
          mainEndTime = endTime + 'T' + endHours + ':' + endMinutes + ':'+ '00' +'-' +endTimeOffSet;
        }
      }*/
      // console.log('Time --- ', moment(_startTime).tz(timeZone).utc().format(), moment(_endTime).tz(timeZone).format());
      console.log("======================================================================");
      console.log("startTime", _startTime ,  "endTime", _endTime);
     /* console.log('mainStartTime --- ', mainStartTime,' mainEndTime ', mainEndTime);*/
      callback(true,_startTime, _endTime);
     // callback(false, null, null)
    /*} else {
      callback(false, null, null)
    }*/
  };

  /*getGoToMeeting(meetIngData: any, data: any) {
    this.meetIngData = meetIngData;
    this.data = data;
    this.httpClient.post<any>('/integration/getgotomeeting', {userId: localStorage.getItem('userId')}).subscribe(
      res => {
        console.log('gtm detail=======', res);
        if (res.data.length > 0) {
          let client_id_client_secret64 = res.data[0].clientId_client_secret_64;
          let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + client_id_client_secret64
          });
          let optionsHeader = {
            headers: httpHeaders
          };
          this.httpClient.post<any>('https://api.getgo.com/oauth/v2/token?grant_type=password&username=' + res.data[0].emailId + '&password=' + res.data[0].password + '', {}, optionsHeader).subscribe(
            res => {
              this.gtm_access_token = res.access_token;
              console.log('this.access_token===', this.gtm_access_token);
              this.gtm_expires_in = res.expires_in;
              this.gtm_organizer_key = res.organizer_key;
              this.gtm_refresh_token = res.refresh_token;

              let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.gtm_access_token
              });

              let options = {
                headers: httpHeaders
              };
              this.meetingTimeFormat(this.meetIngData.starttime, this.meetIngData.endtime,this.meetIngData.timezonekey,
                (status, returnStartTime, returnEndTime) => {
                  if(status && returnStartTime && returnEndTime) {
                    this.meetIngData.starttime = returnStartTime;
                    this.meetIngData.endtime = returnEndTime;
                    console.log("Meeting Data -------------> ", this.meetIngData);
                    this.httpClient.post<any>('https://api.getgo.com/G2M/rest/meetings', this.meetIngData, options).subscribe(
                      res => {
                        console.log('MeetingResponse=========', res);

                        this.data['g2mMeetingId'] = res[0].meetingid;
                        this.data['g2mMeetingUrl'] = res[0].joinURL;
                        this.data['g2mMeetingCallNo'] = res[0].conferenceCallInfo;

                        this.meetIngData['g2mMeetingId'] = res[0].meetingid;
                        this.meetIngData['g2mMeetingUrl'] = res[0].joinURL;
                        this.meetIngData['g2mMeetingCallNo'] = res[0].conferenceCallInfo;
                        this.addMeetingToDatabaseWithGTM(this.meetIngData, this.data);
                      },
                      err => {
                        console.log('Meeting Error=========', err.message);
                        this.showDialog(err.message);
                      });
                  }
                });
            },
            err => {
              console.log('AccessToken Error=========', err.message);
              this.showDialog(err.message);
            });
        }
      });
  }*/

  getGoToMeeting(meetIngData: any, data: any) {
    this.meetIngData = meetIngData;
    this.data = data;
    this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/getAccessToken', {userId: data.userId}).subscribe(
      res => {
        console.log('gtm accessToken=======', res);
        this.gtm_access_token = res.data;
        let httpHeaders = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.gtm_access_token
        });

        let options = {
          headers: httpHeaders
        };
        this.meetingTimeFormat(this.meetIngData.starttime, this.meetIngData.endtime,this.meetIngData.timezonekey,
          (status, returnStartTime, returnEndTime) => {
            if(status && returnStartTime && returnEndTime) {
              this.meetIngData.starttime = returnStartTime;
              this.meetIngData.endtime = returnEndTime;
              console.log("Meeting Data -------------> ", this.meetIngData);
              this.httpClient.post<any>('https://api.getgo.com/G2M/rest/meetings', this.meetIngData, options).subscribe(
                res => {
                  console.log('MeetingResponse=========', res);

                  this.data['g2mMeetingId'] = res[0].meetingid;
                  this.data['g2mMeetingUrl'] = res[0].joinURL;
                  this.data['g2mMeetingCallNo'] = res[0].conferenceCallInfo;

                  this.meetIngData['g2mMeetingId'] = res[0].meetingid;
                  this.meetIngData['g2mMeetingUrl'] = res[0].joinURL;
                  this.meetIngData['g2mMeetingCallNo'] = res[0].conferenceCallInfo;
                  this.addMeetingToDatabaseWithGTM(this.meetIngData, this.data);
                },
                err => {
                  console.log('Meeting Error=========', err.message);
                  this.messageOff.next(false);
                  this.showDialog("Something went gone wrong.");
                });
              }
          });
      },error => {
        console.log('Meeting Error=========', error.message);
        this.messageOff.next(false);
        this.showDialog("Something went gone wrong.");
      });
  }

  addMeetingToDatabase(meetIngData: any, data: any) {
    let userName = localStorage.getItem('fullName');
    let timeZone = localStorage.getItem('selectedTimeZone');
    this.meetIngData = meetIngData;
    this.data = data;
    this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/addMeeting', this.data).subscribe((responseData) => {
      console.log('addMeeting====', responseData.data.insertId);
      let insertId = responseData.data.insertId;
      let currentEmail = localStorage.getItem('email');

      this.meetingTimeFormat(this.meetIngData.starttime, this.meetIngData.endtime,this.meetIngData.timezonekey,
        (status, returnStartTime, returnEndTime) => {
        if(status && returnStartTime && returnEndTime) {
          /*this.meetIngData.starttime = returnStartTime;
          this.meetIngData.endtime = returnEndTime;*/
          this.httpClient.post<any>('https://dev.cloudmeetin.com/user/insertevent', {
            data: data,
            meetIngData: this.meetIngData,
            email: currentEmail,
            eventType : data.eventType,
            inviteeEmail : data.schedulerEmail,
            userName : userName,
            timeZone : timeZone
          }).subscribe((responseData) => {
            console.log('Google Calendar integration======', responseData.message);
            console.log('Google Calendar integration======', responseData.data.id);
            this.insertEventIdInDatabase(responseData.data.id, insertId, (cb_one) => {
              if(cb_one == 200) {
                this.meetIngData['userTimeZone'] = this.data.userTimeZone;
                this.sendMeetingNotification(this.meetIngData, this.data.schedulerEmail, currentEmail, data.eventType, userName, (cb_two) => {
                  if(cb_two == 200) {
                    if (localStorage.getItem('UpdateQuery') === 'true') {
                      // if user select same date then run the update api
                      console.log('Update =====================================================');
                      let oldMeetingList = localStorage.getItem('meetingTimeList').toString();
                      let updateMeetingList = oldMeetingList.concat(',' + this.data.starttime);
                      this.appendMeetingTime(this.data, updateMeetingList, (cb_th) => {
                        if(cb_th == 200) {
                          this.meetingsConfirmation();
                        } else {
                          this.messageOff.next(false);
                          this.showDialog("Something went gone wrong.");
                        }
                      });
                    } else {
                      console.log('Insert =====================================================');
                      // if user select date as a first time
                      this.insertMeetingTime(this.data ,(cb)=>{
                        if(cb == 200) {
                          this.meetingsConfirmation();
                        } else {
                          this.messageOff.next(false);
                          this.showDialog("Something went gone wrong.");
                        }
                      });
                    }
                  } else {
                    this.messageOff.next(false);
                    this.showDialog("Something went gone wrong.");
                  }
                });
              } else {
                this.messageOff.next(false);
                this.showDialog("Something went gone wrong.");
              }
            });
          }, error => {
            console.log('error CAL ====', error);
            this.messageOff.next(false);
            this.showDialog("Something went gone wrong.");
          });
        } else {
          this.messageOff.next(false);
          this.showDialog("Something went gone wrong.");
        }
        });
    }, error => {
      console.log('error====', error);
      this.messageOff.next(false);
      this.showDialog("Something went gone wrong.");
    });
  }

  addMeetingToDatabaseWithGTM(meetIngData, data) {

    let userName = localStorage.getItem('fullName');
    let timeZone = localStorage.getItem('selectedTimeZone');
    this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/addMeetingWithGtm', this.data).subscribe((responseData) => {
      console.log('addMeeting====', responseData);
      let insertId = responseData.data.insertId;
      let currentEmail = localStorage.getItem('email');
      this.httpClient.post<any>('https://dev.cloudmeetin.com/user/insertevent', {
        data :  data,
        meetIngData: meetIngData,
        email: currentEmail,
        eventType : data.eventType,
        inviteeEmail : data.schedulerEmail,
        userName : userName,
        timeZone : timeZone
      }).subscribe((responseData) => {
        console.log('Google Calendar integration ======', responseData);

        this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/addEventID', {
          userID: this.getUserId(),
          eventId: responseData.data.id,
          insertId: insertId
        }).subscribe((response) => {
          console.log('Event Response --- >> ', response);
          console.log("meetingData=========>", meetIngData);
          console.log("clientEmail=========>", this.data.schedulerEmail);
          console.log("email=========>", currentEmail);
          this.meetIngData['userTimeZone'] = this.data.userTimeZone;
          this.httpClient.post<any>('https://dev.cloudmeetin.com/sendEmail/sendemail', {
            meetingData: meetIngData,
            clientEmail: this.data.schedulerEmail,
            email: currentEmail,
            userName : userName,
            eventType : data.eventType
          }).subscribe((responseData) => {
            console.log('Notification sent on gmail with GTM ======1', responseData);
            if (localStorage.getItem('UpdateQuery') === 'true') {
              // if user select same date then run the update api
              console.log('Update =====================================================');
              let oldMeetingList = localStorage.getItem('meetingTimeList').toString();
              let updateMeetingList = oldMeetingList.concat(',' + this.data.starttime);
              // console.log('',updateMeetingList);
              this.httpClient.post<any>('https://dev.cloudmeetin.com/filter/updateMeetingRecords', {
                userId: this.data.userId,
                meetingDate: this.data.date,
                meetingTimeList: updateMeetingList
              }).subscribe((responseDataUserUpdate) => {
                console.log('Meeting Data updated successfully  ========================>>>>>>', responseDataUserUpdate);
                this.meetingsConfirmation();
              }, error => {
                console.log('error CAL ====', error);
                this.messageOff.next(false);
                this.showDialog("Something went gone wrong.");
              });

            } else {
              // if user select date as a first time
              console.log('Insert =====================================================');
              this.httpClient.post<any>('https://dev.cloudmeetin.com/filter/insertMeetingRecords', {
                userId: this.data.userId,
                meetingDate: this.data.date,
                meetingTimeList: this.data.starttime
              }).subscribe((responseDataUser) => {
                console.log('Meeting Data saved successfully  ========================>>>>>>', responseDataUser);
                this.meetingsConfirmation();
              }, error => {
                console.log('error CAL ====', error);
                this.messageOff.next(false);
                this.showDialog("Something went gone wrong.");
              });
            }
          }, error => {
            console.log('error CAL ====', error);
            this.messageOff.next(false);
            this.showDialog("Something went gone wrong.");
          });
        });
      }, error => {
        console.log('error CAL ====', error);
        this.messageOff.next(false);
        this.showDialog("Something went gone wrong.");
      });
    }, error => {
      console.log('error====', error);
      this.messageOff.next(false);
      this.showDialog("Something went gone wrong.");
    });
  }

  /*This function used for insert event Id in Database Table*/
  insertEventIdInDatabase(eventId,insertId, callback) {
    this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/addEventID', {
      userID: this.getUserId(),
      eventId: eventId,
      insertId: insertId
    }).subscribe((response) => {
        console.log('Event Response --- >> ', response);
        callback(200)
      }, error => {
        callback(error);
      });
  }

  /* This function used to send the email */
/*  sendMeetingNotification(meetIngData, schedulerEmail, currentEmail, callback) {
    console.log("meetIngData", meetIngData);
    console.log("schedulerEmail", schedulerEmail);
    console.log("currentEmail", currentEmail);
    this.httpClient.post<any>('/sendEmail/sendemail', {
      meetingData: meetIngData,
      clientEmail: schedulerEmail,
      email: currentEmail
    }).subscribe((responseData) => {
      console.log('Notification sent on gmail with GTM ======', responseData);
      callback(200);
    }, error => {
      console.log('error CAL ====', error);
      callback(error);
    });
  }*/


  sendMeetingNotification(meetIngData, schedulerEmail, currentEmail, eventType, userName, callback) {
    console.log("meetIngData", meetIngData);
    console.log("schedulerEmail", schedulerEmail);
    console.log("currentEmail", currentEmail);
    this.httpClient.post<any>('https://dev.cloudmeetin.com/sendEmail/sendemail', {
      meetingData: meetIngData,
      clientEmail: schedulerEmail,
      email: currentEmail,
      userName : userName,
      eventType : eventType
    }).subscribe((responseData) => {
      console.log('Notification sent on gmail with GTM ======', responseData);
      callback(200);
    }, error => {
      console.log('error CAL ====', error);
      callback(error);
    });
  }

  /*This function used for insert the meeting time list in database's table */
  insertMeetingTime(data, callback) {
    // if user select date as a first time
    console.log('Insert =====================================================');
    this.httpClient.post<any>('https://dev.cloudmeetin.com/filter/insertMeetingRecords', {
      userId: data.userId,
      meetingDate: data.date,
      meetingTimeList: data.starttime
    }).subscribe((responseDataUser) => {
      console.log('Meeting Data saved successfully  ========================>>>>>>', responseDataUser);
      callback(200);
    }, error => {
      console.log('error CAL ====', error);
      callback(error);
    });
  }

  /*This function used for append the meeting time list in database's table */
  appendMeetingTime(data, updateMeetingList, callback) {
    this.httpClient.post<any>('https://dev.cloudmeetin.com/filter/updateMeetingRecords', {
      userId: data.userId,
      meetingDate: data.date,
      meetingTimeList: updateMeetingList
    }).subscribe((responseDataUserUpdate) => {
      console.log('Meeting Data updated successfully  ========================>>>>>>', responseDataUserUpdate);
      callback(200);
    }, error => {
      console.log('error CAL ====', error);
      callback(error);
    });
  }

 /* /!*Cancel meeting function*!/
  cancelMeetingSchedule(meetingDetail: any) {
    this.httpClient.post<any>('/user/delete',{email: this.getUserEmailId(), meetingDetail: meetingDetail}).subscribe(
      res =>{
        console.log("Remove calendar event --- >> ",res);
        if(meetingDetail.g2mMeetingId){
          this.deleteGTMRecord(meetingDetail);
        }
      },error => {
        this.showDialog(error);
      });
  }

  /!* Meeting record delete from the GTM*!/
  deleteGTMRecord(meetingDetail: any){
    let userId = meetingDetail.userId;
    this.httpClient.post<any>('/integration/getgotomeeting',{userId: userId}).subscribe(
      res =>{
        let gtmDetail = res.data;
        if(gtmDetail.length > 0) {
          let client_id_client_secret64 = res.data[0].clientId_client_secret_64;
          let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic '+client_id_client_secret64
          });
          let optionsHeader = {
            headers: httpHeaders
          };
          this.httpClient.post<any>('https://api.getgo.com/oauth/v2/token?grant_type=password&username='+res.data[0].emailId+'&password='+res.data[0].password+'',{}, optionsHeader).subscribe(
            res => {
              this.gtm_access_token = res.access_token;
              console.log('this.access_token===', this.gtm_access_token);
              this.gtm_expires_in = res.expires_in;
              this.gtm_organizer_key = res.organizer_key;
              this.gtm_refresh_token = res.refresh_token;

              let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.gtm_access_token
              });
              let options = {
                headers: httpHeaders
              };
              this.httpClient.delete<any>('https://api.getgo.com/G2M/rest/meetings/'+meetingDetail.g2mMeetingId,options).subscribe(
                res =>{
                  console.log("delete Response=========",res);
                },
                err => {
                  console.log("delete Error=========",err.message);
                });
            },
            err => {
              console.log('AccessToken Error=========', err.message);
            });
        }
      },error => {
        console.log("error====",error);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = error;
        this.dialog.open(MessagedialogComponent, dialogConfig);
      });
  }*/

  /*Cancel meeting function*/
  cancelMeetingSchedule(meetingDetail: any) {
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/delete',{email: this.getUserEmailId(), meetingDetail: meetingDetail}).subscribe(
      res =>{
        console.log("Remove calendar event --- >> ",res);
        if(meetingDetail.g2mMeetingId){
          this.deleteGTMRecord(meetingDetail);
        }
      },error => {
        this.showDialog(error);
      });
  }

  cancelMeetingScheduleByClient(meetingDetail: any, meetingId) {
    this.httpClient.post<any>('https://dev.cloudmeetin.com/user/deletebymeetingid',{meetingId	: meetingId	, meetingDetail: meetingDetail}).subscribe(
      res =>{
        meetingDetail['subject'] = meetingDetail.invitee;
        this.sendMeetingNotification(meetingDetail, meetingDetail.schedulerEmail, meetingDetail.calendarID,
          meetingDetail.eventType, meetingDetail.userName, (responseStatus) => {
            if(responseStatus == 200) {
              this.message.create('success', `cancel email sent`);
            }
          });
        console.log("Remove calendar event --- >> ",res);
        if(meetingDetail.g2mMeetingId){
          this.deleteGTMRecord(meetingDetail);
        }
      },error => {
        this.showDialog(error);
      });
  }

  /* Meeting record delete from the GTM*/
  deleteGTMRecord(meetingDetail: any){
    let userId = meetingDetail.userId;
    this.httpClient.post<any>('https://dev.cloudmeetin.com/integration/getgotomeeting',{userId: userId}).subscribe(
      res =>{
        let gtmDetail = res.data;
        if(gtmDetail.length > 0) {
          let access_token = res.data[0].access_token;
          let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
          });
          let options = {
            headers: httpHeaders
          };
          this.httpClient.delete<any>('https://api.getgo.com/G2M/rest/meetings/'+meetingDetail.g2mMeetingId,options).subscribe(
            res =>{
              console.log("delete Response=========",res);
            },
            err => {
              console.log("delete Error=========",err.message);
            });
        }
      },error => {
        console.log("error====",error);
        this.messageService.generateErrorMessage(error);
       /* const dialogConfig = new MatDialogConfig();
        dialogConfig.data = error;
        this.dialog.open(MessagedialogComponent, dialogConfig);*/
      });
  }

  // Get the Reschedule Records from local storage
  getRescheduleRecords() {
    return JSON.parse(localStorage.getItem("rescheduleRecord"));
  }

  /* Reschedule meetings records main function  [Completed]*/
  rescheduleMeeting(data: any, meetingData: any) {
    let currentEmail = localStorage.getItem('email');
    let userEmail = localStorage.getItem('email');
    let cEventId = localStorage.getItem('eventId');
    data['rescheduleRecord'] = localStorage.getItem('rescheduleRecord');
    // Add meeting record in database
    this.httpClient.post<any>('https://dev.cloudmeetin.com/meeting/rescheduleMeeting', data).subscribe((responseDataUserUpdate) => {
      console.log('Meeting Data Reschdule successfully  ========================>>>>>>', responseDataUserUpdate);
      let meetId = responseDataUserUpdate.meetingUniqueId;
      console.log('meetId new  ========================>>>>>>', meetId);
      data['newMeetingId'] = meetId;
      // This function use for get the go to meeting credentials from the database table
      this.httpClient.post("https://dev.cloudmeetin.com/integration/gotoMeetingCredentials", {userId: this.getUserId()}).subscribe((res: { message: string, data: any }) => {
        console.log("---------------Go To Meeting Credentials Response ---------->", res.data);
        if (res.data.length > 0) {
              let jsonData = res.data[0];
              this.access_token = jsonData.access_token;
              this.expires_in = jsonData.expires_in;
              this.organizer_key = jsonData.organizer_key;
              this.refresh_token = jsonData.refresh_token;
              let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + this.access_token
              });
              let options = {
                headers: httpHeaders
              };
              let g2meetingId = JSON.parse(localStorage.getItem('rescheduleRecord')).g2mMeetingId;
              console.log('g2meetingId ----------- >> ', g2meetingId);
              if(g2meetingId !== null && g2meetingId !== undefined){
                this.httpClient.put('https://api.getgo.com/G2M/rest/meetings/' + g2meetingId + '', meetingData, options)
                  .subscribe(
                    res => {
                      console.log('Meeting response for GTM R --------------- >> ', res);
                      /*Called the onUpdateEventInCalendar function to update the meeting event by Google calendar*/

                      this.onUpdateEventInCalendar(userEmail, cEventId, data,meetingData, (cb) => {
                        if (cb == 200) {
                          /*Called the sendMeetingNotification function to send the meeting notification by email*/
                          let userName = localStorage.getItem('fullName');
                          meetingData['rescheduleRecord'] = JSON.parse(data.rescheduleRecord);
                          meetingData['rescheduleReason'] = data.rescheduleReason;
                          meetingData['reschedulerName'] = data.reschedulerName;
                          meetingData['userTimeZone'] = data.userTimeZone;
                          console.log("data.userTimeZone=========",data.userTimeZone);
                          this.sendMeetingNotification(meetingData, data.schedulerEmail, currentEmail,data.eventType,userName, (status) => {
                            if (status == 200) {
                              this.meetingsConfirmation();
                            } else {
                              /* Called the meetingsConfirmation function*/
                              this.messageOff.next(false);
                              this.showDialog("Something went gone wrong.");
                            }
                          });
                        } else {
                          this.messageOff.next(false);
                          this.showDialog("Something went gone wrong.");
                        }
                      });
                    },
                    err => {
                      this.messageOff.next(false);
                      this.showDialog("Something went gone wrong.");
                    }
                  );
              }else{
                /*meetingData['newMeetingId'] = meetId;*/
                this.onUpdateEventInCalendar(userEmail, cEventId, data, meetingData,(cb) => {
                  if (cb == 200) {
                    let userName = localStorage.getItem('fullName');
                    meetingData['rescheduleRecord'] = JSON.parse(data.rescheduleRecord);
                    meetingData['rescheduleReason'] = data.rescheduleReason;
                    meetingData['reschedulerName'] = data.reschedulerName;
                    meetingData['userTimeZone'] = data.userTimeZone;
                    console.log("data.userTimeZone=========",data.userTimeZone);
                    this.sendMeetingNotification(meetingData, data.schedulerEmail, currentEmail,data.eventType,userName, (status) => {
                      if (status == 200) {
                        this.meetingsConfirmation();
                        /*if (oldMeetingList) {
                          this.appendMeetingTime(data, updateMeetingList, (_status) => {
                            if (_status == 200) {

                              this.meetingsConfirmation();
                            } else {
                              this.showDialog('Internal Server Error');
                            }
                          });
                        } else {
                          this.insertMeetingTime(data, (statusRecord) => {
                            if (statusRecord == 200) {
                              /!* Called the meetingsConfirmation function*!/
                              this.meetingsConfirmation();
                            } else {
                              this.showDialog('Internal Server Error');
                            }
                          });
                        }*/
                      } else {
                        /* Called the meetingsConfirmation function*/
                        this.messageOff.next(false);
                        this.showDialog("Something went gone wrong.");
                      }
                    });
                  } else {
                    this.messageOff.next(false);
                    this.showDialog("Something went gone wrong.");
                  }
                });
              }

        } else {
          console.log("DAta========================",data);
          console.log("userEmail========================",userEmail);
          console.log("cEventId========================",cEventId);
          console.log("This part will run then. when GTM is not connect");
          /*This part will run then when in GTM is not connect*/
          /*Called the onUpdateEventInCalendar function to update the meeting event by Google calendar*/
          this.onUpdateEventInCalendar(userEmail, cEventId, data, meetingData,(cb) => {
            if (cb == 200) {
              /*Called the sendMeetingNotification function to send the meeting notification by email*/
              let userName = localStorage.getItem('fullName');
              meetingData['rescheduleRecord'] = JSON.parse(data.rescheduleRecord);
              meetingData['rescheduleReason'] = data.rescheduleReason;
              meetingData['reschedulerName'] = data.reschedulerName;
              meetingData['userTimeZone'] = data.userTimeZone;
              console.log("data.userTimeZone=========",data.userTimeZone);
              this.sendMeetingNotification(meetingData, data.schedulerEmail, currentEmail,data.eventType,userName, (status) => {
                if (status == 200) {
                 /* this.appendMeetingTime(data, updateMeetingList, (_status) => {
                    if (_status == 200) {
                      /!* Called the meetingsConfirmation function*!/
                      this.meetingsConfirmation();
                    } else {
                      this.showDialog('Internal Server Error');
                    }
                  });*/
                  this.meetingsConfirmation();
                } else {
                  this.messageOff.next(false);
                  this.showDialog("Something went gone wrong.");
                }
              });
            } else {
              this.messageOff.next(false);
              this.showDialog("Something went gone wrong.");
            }
          });
        }
      }, error => {
        console.log('error CAL ====', error);
        this.messageOff.next(false);
        this.showDialog("Something went gone wrong.");
      });
    }, error => {
      console.log('error CAL ====', error);
      this.messageOff.next(false);
      this.showDialog("Something went gone wrong.");
    });
  }

  /*This function used to update event in Google calendar*/
  onUpdateEventInCalendar(email, eventId, meetingData,gtmData, callback) {
    // It used for update the meeting record in Google calendar
    this.httpClient.post("https://dev.cloudmeetin.com/user/eventUpdate", {
      email: email,
      eventId: eventId,
      meetIngData: meetingData,
      gtmData: gtmData
    }).subscribe((gotoMeetingUpdateResponse) => {
      console.log("Response of Update meeting time from Google calendar -- > ", gotoMeetingUpdateResponse);
      callback(200);
    }, error => {
      console.log('error CAL ====', error);
      callback(error);
    });
  }

  /* This function used to show the error message*/
  showDialog(errorMessage: string) {
    this.messageService.generateErrorMessage(errorMessage);
   /* const dialogConfig = new MatDialogConfig();
    dialogConfig.data = errorMessage;
    this.dialog.open(MessagedialogComponent, dialogConfig);*/
  }

  /*This function used for show the confirmation page and remove the meeting's local storage data*/
  meetingsConfirmation() {
    this.router.navigate(['confirmedMeeting']);
  }


  getCalendarEventSlot(eventType: number,dateValue: string) {
    console.log("eventType===========", eventType);
    console.log("dateValue============", dateValue);
    this.userSlotArray = [];
    this.jsonSlotArrayTemp = [];
    this.selectDate = new Date(dateValue);
    let startTime = this.setHours(6, 0);
    let endTime = this.setHours(24,0);
    console.log("startTime", startTime);
    console.log("endTime", endTime);
    console.log("selectDate====",this.selectDate);
    /*userSlotArray.push({startTime: startTime, endTime: endTime});*/
    let count = 0;
    if(this.getUserEmail())  {
      this.httpClient.post<any>('https://dev.cloudmeetin.com/user/gettime', {email: this.getUserEmail()}).subscribe((responseData) => {
        let startTime = responseData.data[0].startTime.split(':');
        let endTime = responseData.data[0].endTime.split(':');
        console.log("startTime-- > ", startTime);
        console.log("endTime-- > ", endTime);
        for(let i = +startTime[0]; i<endTime[0]; i++) {
          if(eventType == 60) {
            count % 2 == 0 ? this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 60)}) : this.userSlotArray.push({startTime: this.setHours(i-1, 60), endTime: this.setHours(i, 60)})
          }  else if(eventType === 30) {
            if(count % 2 == 0) {
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 30)})
            } else {
              this.userSlotArray.push({startTime: this.setHours(i-1, 30), endTime: this.setHours(i, 0)});
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 30)});
              this.userSlotArray.push({startTime: this.setHours(i, 30), endTime: this.setHours(i+1, 0)});
            }
          } else if(eventType == 15) {
            if(count % 2 == 0) {
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 15)});
            } else {
              this.userSlotArray.push({startTime: this.setHours(i-1, 15), endTime: this.setHours(i-1, 30)});
              this.userSlotArray.push({startTime: this.setHours(i-1, 30), endTime: this.setHours(i-1, 45)});
              this.userSlotArray.push({startTime: this.setHours(i-1, 45), endTime: this.setHours(i, 0)});
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 15)});
              this.userSlotArray.push({startTime: this.setHours(i, 15), endTime: this.setHours(i, 30)});
              this.userSlotArray.push({startTime: this.setHours(i, 30), endTime: this.setHours(i, 45)});
              this.userSlotArray.push({startTime: this.setHours(i, 45), endTime: this.setHours(i+1, 0)});
            }
          }
          count++;
        }

        console.log("This ", this.userSlotArray);

        let email = this.getUserEmail();
        console.log("email=============",email);
        if(email != null && email != undefined){
          this.jsonSlotArray = [];
          if(this.userSlotArray != null){
            for(let i =0 ; i< this.userSlotArray.length;i++) {
              if(this.userSlotArray[i].startTime != null && this.userSlotArray[i].startTime != undefined && this.userSlotArray[i].endTime != null && this.userSlotArray[i].endTime != undefined ){
                this.httpClient.post<any>('https://dev.cloudmeetin.com/user/getcalendareventslot',
                  {
                    email: email,
                    timeMax: new Date(this.userSlotArray[i].endTime),
                    timeMin: new Date(this.userSlotArray[i].startTime)
                  }).subscribe((response) => {
                  if(response != null){
                    console.log("Response -- >", response);
                    if(response.length > 0) {
                    } else {
                      this.jsonSlotArray.push({startTime: new Date(this.userSlotArray[i].startTime) , endTime: new Date(this.userSlotArray[i].endTime)})
                      console.log("MAin a", this.jsonSlotArray);

                      /* this.availabileSlot.next(this.jsonSlotArray);*/
                    }

                    if( i== this.userSlotArray.length-1) {
                      this.jsonSlotArray.sort((a,b) => a.startTime - b.startTime);
                      this.jsonSlotArrayTemp = this.jsonSlotArray;
                      this.availabileSlot.next(this.jsonSlotArray);
                    }
                    console.log("this.jsonSlotArrayTemp.length=====",this.jsonSlotArrayTemp.length);
                    console.log("this.jsonSlotArray.length=====",this.jsonSlotArray.length);
                    if(this.jsonSlotArrayTemp.length > 0 && this.jsonSlotArray.length >= this.jsonSlotArrayTemp.length){
                      this.availabileSlot.next(this.jsonSlotArray);
                    }
                  }
                });
              }
            }
          }
        }
      });
    } else {
      this.showDialog("Undefined user id");
    }
    /*console.log("eventType===========", eventType);
    console.log("dateValue============", dateValue);
    this.userSlotArray = [];
    this.jsonSlotArrayTemp = [];
    this.selectDate = new Date(dateValue);
    let startTime = this.setHours(6, 0);
    let endTime = this.setHours(24,0);
    console.log("startTime", startTime);
    console.log("endTime", endTime);
    console.log("selectDate====",this.selectDate);
    /!*userSlotArray.push({startTime: startTime, endTime: endTime});*!/
    let count = 0;
    if(this.getUserEmail())  {
      this.httpClient.post<any>('/user/gettime', {email: this.getUserEmail()}).subscribe((responseData) => {
        let startTime = responseData.data[0].startTime.split(':');
        let endTime = responseData.data[0].endTime.split(':');
        console.log("startTime-- > ", startTime);
        console.log("endTime-- > ", endTime);
        for(let i = +startTime[0]; i<endTime[0]; i++) {
          if(eventType == 60) {
            count % 2 == 0 ? this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 60)}) : this.userSlotArray.push({startTime: this.setHours(i-1, 60), endTime: this.setHours(i, 60)})
          }  else if(eventType === 30) {
            if(count % 2 == 0) {
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 30)})
            } else {
              this.userSlotArray.push({startTime: this.setHours(i-1, 30), endTime: this.setHours(i, 0)});
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 30)});
              this.userSlotArray.push({startTime: this.setHours(i, 30), endTime: this.setHours(i+1, 0)});
            }
          } else if(eventType == 15) {
            if(count % 2 == 0) {
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 15)});
            } else {
              this.userSlotArray.push({startTime: this.setHours(i-1, 15), endTime: this.setHours(i-1, 30)});
              this.userSlotArray.push({startTime: this.setHours(i-1, 30), endTime: this.setHours(i-1, 45)});
              this.userSlotArray.push({startTime: this.setHours(i-1, 45), endTime: this.setHours(i, 0)});
              this.userSlotArray.push({startTime: this.setHours(i, 0), endTime: this.setHours(i, 15)});
              this.userSlotArray.push({startTime: this.setHours(i, 15), endTime: this.setHours(i, 30)});
              this.userSlotArray.push({startTime: this.setHours(i, 30), endTime: this.setHours(i, 45)});
              this.userSlotArray.push({startTime: this.setHours(i, 45), endTime: this.setHours(i+1, 0)});
            }
          }
          count++;
        }

        console.log("This ", this.userSlotArray);

        let email = this.getUserEmail();
        if(email != null && email != undefined){
          this.jsonSlotArray = [];
          if(this.userSlotArray != null){
            for(let i =0 ; i< this.userSlotArray.length;i++) {
              if(this.userSlotArray[i].startTime != null && this.userSlotArray[i].startTime != undefined && this.userSlotArray[i].endTime != null && this.userSlotArray[i].endTime != undefined ){
                this.httpClient.post<any>('/user/getcalendareventslot',
                  {
                    email: email,
                    timeMax: new Date(this.userSlotArray[i].endTime),
                    timeMin: new Date(this.userSlotArray[i].startTime)
                  }).subscribe((response) => {
                  if(response != null){
                    console.log("Response -- >", response);
                    if(response.length > 0) {
                    } else {
                      this.jsonSlotArray.push({startTime: new Date(this.userSlotArray[i].startTime) , endTime: new Date(this.userSlotArray[i].endTime)})
                      console.log("MAin a", this.jsonSlotArray);

                      /!* this.availabileSlot.next(this.jsonSlotArray);*!/
                    }

                    if( i== this.userSlotArray.length-1) {
                      this.jsonSlotArray.sort((a,b) => a.startTime - b.startTime);
                      this.jsonSlotArrayTemp = this.jsonSlotArray;
                      this.availabileSlot.next(this.jsonSlotArray);
                    }
                    console.log("this.jsonSlotArrayTemp.length=====",this.jsonSlotArrayTemp.length);
                    console.log("this.jsonSlotArray.length=====",this.jsonSlotArray.length);
                    if(this.jsonSlotArrayTemp.length > 0 && this.jsonSlotArray.length >= this.jsonSlotArrayTemp.length){
                      this.availabileSlot.next(this.jsonSlotArray);
                    }
                  }
                });
              }
            }
          }
        }
      });
    } else {
      this.showDialog("Undefined user id");
    }*/
  }

  setHours (time:number, minutes: number) {
    let now = new Date();
    now.setDate(now.getDate());
    now.setFullYear(this.selectDate.getFullYear(),this.selectDate.getMonth(),this.selectDate.getDate());
    now.setHours(time);
    now.setMinutes(minutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
// @ts-ignore
// return now;
    return Date.parse(now);
  }


  setMeetingUID(meetingUniqueId: any) {
    if(meetingUniqueId) {
      this.meetingUID = meetingUniqueId;
    } else  {
      this.showDialog("Invalid Id")
    }

  }
  getMeetingUID () {
    return this.meetingUID;
  }

  getMeetingRecords(meetingUID: any) {
    if(meetingUID) {
      return this.httpClient.get<any>('https://dev.cloudmeetin.com/meeting/getmeetingrecords' + meetingUID);
    } else {
      this.showDialog("Invalid Id")
    }
  }
  getUserRecords(userId: any) {
    if(userId) {
      return this.httpClient.post<any>('https://dev.cloudmeetin.com/user/checkuser', {userId: userId});
    } else {
      this.showDialog("Invalid Id")
    }
  }

}
