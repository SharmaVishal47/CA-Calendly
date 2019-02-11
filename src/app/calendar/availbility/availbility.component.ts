import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {SignUpService} from '../../Auth/sign-up.service';

@Component({
  selector: 'app-availbility',
  templateUrl: './availbility.component.html',
  styleUrls: ['./availbility.component.css']
})
export class AvailbilityComponent implements OnInit {
  form: FormGroup;
  dayFormArray: FormArray;
  email: string;
  defaultStartTime = "00:00";
  defaultEndTime = "05:00";
  constructor(private signUpService: SignUpService,private router:Router,private httpClient: HttpClient,private route: ActivatedRoute,private fb: FormBuilder,private dialog: MatDialog) {}
  ngOnInit() {
    this.form = new FormGroup({
      inTime: new FormControl(null,[Validators.required]),
      outTime: new FormControl(null,[Validators.required]),
      selectedOption: this.fb.array([],[Validators.required])
    });
    this.route.params.subscribe((params: Params) => {
      this.email = params['email'];
    });
  }

  updateConfiguration() {
    this.form.value['email'] = this.email;
    this.signUpService.updateAvailabilityConfiguration(this.form.value);
  }

  onChange(email: string, isChecked: boolean) {
    const emailFormArray = <FormArray>this.form.controls.selectedOption;
    if (isChecked) {
      emailFormArray.push(new FormControl(email));
    } else {
      let index = emailFormArray.controls.findIndex(x => x.value == email)
      emailFormArray.removeAt(index);
    }
    this.dayFormArray = emailFormArray;
  }
}
