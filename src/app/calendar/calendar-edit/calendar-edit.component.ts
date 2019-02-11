import {Component, OnInit} from '@angular/core';
import { MatDialog,MatDialogConfig } from "@angular/material";
import {CalendarOptionComponent} from '../../calendar-option/calendar-option.component';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthService} from 'angular-6-social-login';
import {CalendareventComponent} from '../../calendar-event/calendarevent.component';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {SignUpService} from '../../Auth/sign-up.service';
@Component({
  selector: 'app-calendar-edit',
  templateUrl: './calendar-edit.component.html',
  styleUrls: ['./calendar-edit.component.css']
})
export class CalendarEditComponent implements OnInit {

  constructor(private dialog: MatDialog,private route: ActivatedRoute,private router:Router,private httpClient: HttpClient,public signUpService: SignUpService) { }
  email: string;
  calendarOption : [];
  event : string;
  checkCalendar = false;
  checkEvent = false;
  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.email = params['email'];
    });
    this.signUpService.getCalendarOptionListener().subscribe((responseData)=>{
      let arr = [];
      arr.push(1);
      let calMap = new Map();
      const dialogConfig = new MatDialogConfig();
      responseData.record.forEach(function(cal) {
        calMap.set(cal.id, cal.summary)
      });
      dialogConfig.data = calMap;
      let dialogRef = this.dialog.open(CalendarOptionComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(value => {
        if(value !== ''){
          this.calendarOption = value;
          this.checkCalendar = true;
        }
      });
    });
    this.signUpService.getCalendarEventsListener().subscribe((responseData)=>{
      const dialogConfig = new MatDialogConfig();
      let eventIdArray = [];
      eventIdArray.push(responseData.record[0].id);
      dialogConfig.data = eventIdArray;
      let dialogRef = this.dialog.open(CalendareventComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(value => {
        if(value !== ''){
          console.log("value====",value);
          this.event = value;
          this.checkEvent = true;
        }
      });
    });
  }

  openCalendarOption() {
    this.signUpService.getCalendarOptionList(this.email);
  }

  openCalendarEvent() {
    this.signUpService.getCalendarEventsList(this.email);
  }

  updateEventCalendar() {
    this.signUpService.updateCalendarEventOptions(this.event,this.calendarOption,this.email);
  }
}


/*  setUpLater() {
    this.router.navigate(["availability/"+this.email]);
  }*/

/* const dialogConfig = new MatDialogConfig();
let dummyData = ['Contacts','Holiday in India'];
dummyData.push(this.email)
dialogConfig.data = dummyData;
let dialogRef = this.dialog.open(CalendareventComponent, dialogConfig);
dialogRef.afterClosed().subscribe(value => {
if(value){
this.event = value;
}
});*/


/*openCalendarOption() {
  let arr = [];
  arr.push(1);
  const dialogConfig = new MatDialogConfig();
  let dummyData = ['Contacts','Holiday in India'];
  dummyData.push(this.email)
  dialogConfig.data = dummyData;
  let dialogRef = this.dialog.open(CalendarOptionComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(value => {
    if(value !== ''){
      this.calendarOption = value;
    }
  });
}*/
