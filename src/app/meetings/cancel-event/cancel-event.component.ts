import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MeetingService} from '../meeting.service';
import {ActivatedRoute, Router} from '@angular/router';


@Component({
  selector: 'app-cancel-event',
  templateUrl: './cancel-event.component.html',
  styleUrls: ['./cancel-event.component.css']
})
export class CancelEventComponent implements OnInit {

  cancelForm: FormGroup;
  btnValue: string = 'Cancel Event';
  cancelMeetingUniqueId ;
  cancelMeetingResponse;
  cancelData;
  userRecords;
  cancelStatus: boolean = false;
  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.cancelForm = this.fb.group({
      reason: [null, [Validators.required]]
    });
    this.route.params.subscribe(params => {
      this.cancelMeetingUniqueId = params['id'];
      console.log(' cancelMeetingUniqueId--->', this.cancelMeetingUniqueId);
      this.meetingService.setMeetingUID(this.cancelMeetingUniqueId);
      this.meetingService.getMeetingRecords(this.cancelMeetingUniqueId).subscribe((response) => {
        console.log('cancel meeting records -- > ', response.data[0]);
        if(response.data[0] !== undefined) {
          if(response.data[0].cancel === "true") {
            this.router.navigate(['error']);

          } else {
            this.meetingService.getUserRecords(response.data[0].userId).subscribe((responseUserRecords) => {
              console.log("responseUserRecords", responseUserRecords.data[0]);
              this.userRecords = responseUserRecords.data[0];
              this.cancelMeetingResponse = response.data[0];
              this.meetingService.removeHeader(true);
            });
          }
        } else {
          this.router.navigate(['error']);
        }

      })
    });
  }


  onSubmit() {
    for (const i in this.cancelForm.controls) {
      this.cancelForm.controls[i].markAsDirty();
    }
    this.cancelData = {
      cancelMessage: this.cancelForm.value.reason,
      userName: this.userRecords.fullName,
      cancelBy: this.cancelMeetingResponse.schedulerName,
      invitee: this.cancelMeetingResponse.schedulerName,
      starttime: this.cancelMeetingResponse.meetingTime,
      endtime: this.cancelMeetingResponse.meetingEndTime,
      timezonekey: this.cancelMeetingResponse.timeZone,
      schedulerEmail:this.cancelMeetingResponse.schedulerEmail,
      eventId: this.cancelMeetingResponse.eventID,
      calendarID: this.userRecords.calendarEvent,
      tokenPath: this.userRecords.token_path,
      userId: this.cancelMeetingResponse.userId,
      g2mMeetingId: this.cancelMeetingResponse.g2mMeetingId,
      eventType: this.cancelMeetingResponse.eventType.split('m')[0],
      userTimeZone : this.userRecords.timeZone
    };
    this.meetingService.cancelMeetingScheduleByClient(this.cancelData, this.cancelMeetingUniqueId);
    this.cancelStatus = true;
  }
}
