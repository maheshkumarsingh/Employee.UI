import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, Pipe } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, AsyncPipe, NgFor, FormsModule, ReactiveFormsModule, CommonModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Employee.UI';
  http = inject(HttpClient);
  hra = 0;
  grossSalary = 0;
  dearnessAllowance = 0;
  conveyanceAllowance = 0;
  pt = 0;
  totalSalary = 0;

  employeeForm = new FormGroup({
    employeeName: new FormControl<string>(''),
    dateOfBirth: new FormControl<string>(''),
    gender: new FormControl<string>(''),
    department: new FormControl<string>(''),
    designation: new FormControl<string>(''),
    basicSalary: new FormControl<number>(0),
  });

  employees$ = this.getAllEmployees();

  private getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('https://localhost:7070/api/Employee');
  }
  public editEmployee(id: number) {
    console.log(id);
  }
  public deleteEmployee(id: number) {
    console.log(id);
    this.http.delete(`https://localhost:7070/api/Employee/${id}`)
      .subscribe({
        next: data => {
          console.log(data);
          alert('Employee deleted successfully');
          this.employees$ = this.getAllEmployees();
        }
      });
  }
  onFormSubmit() {
    console.log(this.employeeForm.value);
    const addEmployeeRequest = {
      employeeName: this.employeeForm.value.employeeName,
      dateOfBirth: this.employeeForm.value.dateOfBirth,
      gender: this.employeeForm.value.gender,
      department: this.employeeForm.value.department,
      designation: this.employeeForm.value.designation,
      basicSalary: this.employeeForm.value.basicSalary
    }

    this.http.post('https://localhost:7070/api/Employee', addEmployeeRequest)
      .subscribe(
        {
          next: data => {
            console.log(data);
            this.employees$ = this.getAllEmployees();
            this.employeeForm.reset();
          }
        }
      );
  }
  calculatedAllowances()
  {
    if(this.employeeForm.value.basicSalary!=0 && this.employeeForm.value.basicSalary!=null)
    {
      this.dearnessAllowance = this.employeeForm.value.basicSalary * 40 / 100;
      this.conveyanceAllowance = this.dearnessAllowance * 10 / 100;
      if(this.conveyanceAllowance < 250)
      {
        this.conveyanceAllowance = 250;
      }
      this.hra = this.employeeForm.value.basicSalary * 25 / 100;
      if(this.hra < 1500)
      {
        this.hra = 1500;
      }
      this.grossSalary = this.employeeForm.value.basicSalary + this.dearnessAllowance + this.conveyanceAllowance + this.hra;
      if(this.grossSalary <= 3000)
      {
        this.pt = 100;
      }
      else if(this.grossSalary > 3000 && this.grossSalary <= 6000)
      {
        this.pt = 150;
      }
      else
      {
        this.pt = 200;
      }
      this.totalSalary = this.employeeForm.value.basicSalary + this.dearnessAllowance + this.conveyanceAllowance + this.hra - this.pt;
    }
  }
}

/*
Formula:
Earnings:
DearnessAllowance = BasicSalary * 40%
ConveyanceAllowance = DearnessAllowance * 10% or 250 (which ever is lower)
HouseRentAllowance = BasicSalary * 25%	or 1500 (which ever is higher)

GrossSalary = BasicSalary + DearnessAllowance + ConveyanceAllowance + HouseRentAllowance (Do not display Gross Salary)

Deductions:
PT = (GrossSalary<=3000 then 100, GrossSalary>3000 and GrossSalary<=6000 then 150 else 200)
TotalSalary = BasicSalary + DearnessAllowance + ConveyanceAllowance + HouseRentAllowance - PT

Note: Do not add more fields to the above table. Use the above formula and calculate on the fly the values for 
  DearnessAllowance, ConveyanceAllowance , etc. and just display the complete record with entered data as well as the calculated data.
*/
