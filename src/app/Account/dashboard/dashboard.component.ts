import { Component, OnInit } from '@angular/core';
import {AuthServiceLocal} from '../../Auth/auth.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {MessagedialogComponent} from '../../messagedialog/messagedialog.component';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  scheduling: true;
  count = 0;
  event: string;
  lengthOfEvent;
  responseData = [] ;
  fullName;
  indexSelect = 1;

  constructor(private authService: AuthServiceLocal,private router:Router,  private  httpClient: HttpClient, private dialog: MatDialog) { }

  ngOnInit() {
    this.fullName= this.authService.getFullName();
    this.httpClient.post<any>('http://localhost:3000/meeting/getMeetingRecord',{userId: this.authService.getUserId()}).subscribe((responseData)=>{
      console.log("responseData====",responseData);
      this.responseData =  responseData.data;
      this.lengthOfEvent = this.responseData.length;
    },error => {
      console.log("error====",error);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = error;
      this.dialog.open(MessagedialogComponent, dialogConfig);
    });
    this.count =3;
    this.event=" Meeting";
    if(this.authService.getUserId()){

    }else{
      this.router.navigate([""]);
    }
  }

  onSelectIndex(selectIndex: number) {
    this.indexSelect =  selectIndex + 1;
  }
}
