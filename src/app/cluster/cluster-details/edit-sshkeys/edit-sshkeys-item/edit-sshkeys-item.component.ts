import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {AppConfigService} from '../../../../app-config.service';
import {UserService} from '../../../../core/services';
import {ClusterEntity} from '../../../../shared/entity/ClusterEntity';
import {DataCenterEntity} from '../../../../shared/entity/DatacenterEntity';
import {SSHKeyEntity} from '../../../../shared/entity/SSHKeyEntity';
import {UserGroupConfig} from '../../../../shared/model/Config';
import {EditSSHKeyDeleteConfirmationComponent} from '../edit-sshkey-delete-confirmation/edit-sshkey-delete-confirmation.component';

@Component({
  selector: 'kubermatic-edit-sshkeys-item',
  templateUrl: './edit-sshkeys-item.component.html',
  styleUrls: ['./edit-sshkeys-item.component.scss'],
})

export class EditSSHKeysItemComponent implements OnInit {
  @Input() index: number;
  @Input() sshKey: SSHKeyEntity;
  @Input() projectID: string;
  @Input() cluster: ClusterEntity;
  @Input() datacenter: DataCenterEntity;
  userGroup: string;
  userGroupConfig: UserGroupConfig;

  constructor(public dialog: MatDialog, private userService: UserService, private appConfigService: AppConfigService) {}

  ngOnInit(): void {
    this.userGroupConfig = this.appConfigService.getUserGroupConfig();
    this.userService.currentUserGroup(this.projectID).subscribe((group) => {
      this.userGroup = group;
    });
  }

  getSshKeyItemClass(): string {
    if (this.index % 2 !== 0) {
      return 'odd';
    }
  }

  deleteSshKey(): void {
    const modal = this.dialog.open(EditSSHKeyDeleteConfirmationComponent);
    modal.componentInstance.projectID = this.projectID;
    modal.componentInstance.cluster = this.cluster;
    modal.componentInstance.datacenter = this.datacenter;
    modal.componentInstance.sshKey = this.sshKey;
    const sub = modal.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }
}