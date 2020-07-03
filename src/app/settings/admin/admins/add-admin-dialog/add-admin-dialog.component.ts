// Copyright 2020 The Kubermatic Kubernetes Platform contributors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';

import {NotificationService} from '../../../../core/services';
import {SettingsService} from '../../../../core/services/settings/settings.service';
import {Admin} from '../../../../shared/entity/member';

@Component({
  selector: 'km-add-admin-dialog',
  templateUrl: './add-admin-dialog.component.html',
})
export class AddAdminDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private readonly _settingsService: SettingsService,
    private readonly _matDialogRef: MatDialogRef<AddAdminDialogComponent>,
    private readonly _notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required]),
    });
  }

  add(): void {
    const adminEntity: Admin = {
      email: this.form.controls.email.value,
      isAdmin: true,
    };

    this._settingsService.setAdmin(adminEntity).subscribe(admin => {
      this._notificationService.success(
        `The <strong>${admin.name}</strong> user was successfully added to admin group`
      );
      this._matDialogRef.close(admin);
    });
  }
}
