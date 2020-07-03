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

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {merge, Subject} from 'rxjs';
import {distinctUntilChanged, take, takeUntil} from 'rxjs/operators';
import {WizardService} from '../../../../../core/services';
import {Cluster} from '../../../../../shared/entity/cluster';
import {ClusterProviderSettingsForm} from '../../../../../shared/model/ClusterForm';
import {NodeProvider} from '../../../../../shared/model/NodeProviderConstants';
import {
  OpenstackNetwork,
  OpenstackSecurityGroup,
  OpenstackSubnet,
} from '../../../../../shared/entity/provider/openstack';

@Component({
  selector: 'km-openstack-provider-options',
  templateUrl: './openstack-provider-options.component.html',
})
export class OpenstackProviderOptionsComponent implements OnInit, OnDestroy {
  @Input() cluster: Cluster;

  hideOptional = true;
  form: FormGroup;
  subnetIds: OpenstackSubnet[] = [];
  networks: OpenstackNetwork[] = [];
  securityGroups: OpenstackSecurityGroup[] = [];

  private _selectedPreset: string;
  private _loadingSubnetIds = false;
  private _loadingOptionalSettings = false;
  private _unsubscribe = new Subject<void>();

  constructor(private readonly _wizardService: WizardService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      securityGroup: new FormControl({value: '', disabled: true}),
      network: new FormControl({value: '', disabled: true}),
      subnetId: new FormControl({value: '', disabled: true}),
    });

    if (this._hasRequiredCredentials()) {
      this._loadOptionalSettings();
    }
    this._wizardService.changeClusterProviderSettings(
      this._clusterProviderSettingsForm(this._hasRequiredCredentials())
    );

    merge(
      this.form.controls.network.valueChanges,
      this.form.controls.subnetId.valueChanges,
      this.form.controls.securityGroup.valueChanges
    )
      .pipe(distinctUntilChanged())
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => {
        this._wizardService.changeClusterProviderSettings(
          this._clusterProviderSettingsForm(this._hasRequiredCredentials())
        );
      });

    this.form.controls.network.valueChanges
      .pipe(distinctUntilChanged())
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => {
        if (this._isNetworkSelected()) {
          this._loadSubnetIds();
        } else {
          this._resetControls(this.form.controls.subnetId);
        }
      });

    this._wizardService.onCustomPresetSelect.pipe(takeUntil(this._unsubscribe)).subscribe(newCredentials => {
      this._selectedPreset = newCredentials;
      if (newCredentials) {
        this.form.disable();
        this._wizardService.changeClusterProviderSettings(
          this._clusterProviderSettingsForm(this._hasRequiredCredentials())
        );
        return;
      }

      if (this._hasRequiredCredentials()) {
        this.form.enable();
      }
    });

    this._wizardService.clusterProviderSettingsFormChanges$.pipe(takeUntil(this._unsubscribe)).subscribe(data => {
      this.cluster.spec.cloud.openstack = data.cloudSpec.openstack;
      if (this._hasRequiredCredentials()) {
        this._loadOptionalSettings();
      }
    });

    this._wizardService.clusterSettingsFormViewChanged$.pipe(takeUntil(this._unsubscribe)).subscribe(data => {
      this.hideOptional = data.hideOptional;
    });
  }

  showHint(field: string): boolean {
    switch (field) {
      case 'subnetId':
        return (
          !this._loadingSubnetIds &&
          (!this._hasRequiredCredentials() || this.form.controls.network.value === '') &&
          !this._selectedPreset
        );
      case 'optionalSettings':
        return !this._loadingOptionalSettings && !this._hasRequiredCredentials();
      default:
        return false;
    }
  }

  getNetworkFormState(): string {
    if (!this._loadingOptionalSettings && !this._hasRequiredCredentials()) {
      return 'Network';
    } else if (this._loadingOptionalSettings && !this._selectedPreset) {
      return 'Loading Networks...';
    }
    return this.networks.length === 0 && !this._selectedPreset ? 'No Networks available' : 'Network';
  }

  getSecurityGroupFormState(): string {
    if (!this._loadingOptionalSettings && !this._hasRequiredCredentials()) {
      return 'Security Group';
    } else if (this._loadingOptionalSettings && !this._selectedPreset) {
      return 'Loading Security Groups...';
    }

    return this.securityGroups.length === 0 && !this._selectedPreset
      ? 'No Security Groups available'
      : 'Security Group';
  }

  getSubnetIDFormState(): string {
    if (!this._loadingSubnetIds && (!this._hasRequiredCredentials() || this.form.controls.network.value === '')) {
      return 'Subnet ID';
    } else if (this._loadingSubnetIds && !this._selectedPreset) {
      return 'Loading Subnet IDs...';
    } else if (this.form.controls.network.value !== '' && this.subnetIds.length === 0 && !this._selectedPreset) {
      return 'No Subnet IDs available';
    }
    return 'Subnet ID';
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  private _loadOptionalSettings(): void {
    this._loadingOptionalSettings = true;
    this._wizardService
      .provider(NodeProvider.OPENSTACK)
      .username(this.cluster.spec.cloud.openstack.username)
      .password(this.cluster.spec.cloud.openstack.password)
      .tenant(this.cluster.spec.cloud.openstack.tenant)
      .tenantID(this.cluster.spec.cloud.openstack.tenantID)
      .domain(this.cluster.spec.cloud.openstack.domain)
      .datacenter(this.cluster.spec.cloud.dc)
      .networks()
      .pipe(take(1))
      .subscribe(
        (networks: OpenstackNetwork[]) => {
          this.networks = networks
            .filter(network => network.external !== true)
            .sort((a, b) => a.name.localeCompare(b.name));

          this._enableNetwork(this.networks.length !== 0);
          this._loadingOptionalSettings = false;
        },
        () => {
          this._loadingOptionalSettings = false;
          this._resetControls(this.form.controls.network);
        },
        () => {
          this._loadingOptionalSettings = false;
        }
      );

    this._wizardService
      .provider(NodeProvider.OPENSTACK)
      .username(this.cluster.spec.cloud.openstack.username)
      .password(this.cluster.spec.cloud.openstack.password)
      .tenant(this.cluster.spec.cloud.openstack.tenant)
      .tenantID(this.cluster.spec.cloud.openstack.tenantID)
      .domain(this.cluster.spec.cloud.openstack.domain)
      .datacenter(this.cluster.spec.cloud.dc)
      .securityGroups()
      .pipe(take(1))
      .subscribe(
        securityGroups => {
          this.securityGroups = securityGroups.sort((a, b) => a.name.localeCompare(b.name));

          this._enableSecurityGroup(this.securityGroups.length !== 0);
          this._loadingOptionalSettings = false;
        },
        () => {
          this._loadingOptionalSettings = false;
          this._resetControls(this.form.controls.securityGroup);
        },
        () => {
          this._loadingOptionalSettings = false;
        }
      );
  }

  private _loadSubnetIds(): void {
    this._loadingSubnetIds = true;
    this._wizardService
      .provider(NodeProvider.OPENSTACK)
      .username(this.cluster.spec.cloud.openstack.username)
      .password(this.cluster.spec.cloud.openstack.password)
      .tenant(this.cluster.spec.cloud.openstack.tenant)
      .tenantID(this.cluster.spec.cloud.openstack.tenantID)
      .domain(this.cluster.spec.cloud.openstack.domain)
      .datacenter(this.cluster.spec.cloud.dc)
      .subnets(this.form.controls.network.value)
      .pipe(take(1))
      .subscribe(
        subnets => {
          this.subnetIds = subnets.sort((a, b) => a.name.localeCompare(b.name));

          if (this.subnetIds.length === 0) {
            this.form.controls.subnetId.setValue('');
          }

          this._enableSubnetID(this.subnetIds.length !== 0);
          this._loadingSubnetIds = false;
        },
        () => {
          this._loadingSubnetIds = false;
          this._resetControls(this.form.controls.subnetId);
        },
        () => {
          this._loadingSubnetIds = false;
        }
      );
  }

  private _resetControls(...controls: AbstractControl[]): void {
    for (const control of controls) {
      if (control.enabled) {
        control.disable();
        control.setValue('');
      }
    }
  }

  private _enableNetwork(enable: boolean): void {
    this._enableControl(enable, this.form.controls.network);
  }

  private _enableSecurityGroup(enable: boolean): void {
    this._enableControl(enable, this.form.controls.securityGroup);
  }

  private _enableSubnetID(enable: boolean): void {
    this._enableControl(enable, this.form.controls.subnetId);
  }

  private _enableControl(enable: boolean, control: AbstractControl): void {
    if (enable && control.disabled) {
      control.enable();
    } else if (!enable && control.enabled) {
      control.disable();
    }
  }

  private _hasRequiredCredentials(): boolean {
    return (
      (this.cluster.spec.cloud.openstack.username !== '' &&
        this.cluster.spec.cloud.openstack.password !== '' &&
        this.cluster.spec.cloud.openstack.domain !== '' &&
        (this.cluster.spec.cloud.openstack.tenant !== '' || this.cluster.spec.cloud.openstack.tenantID !== '')) ||
      !!this._selectedPreset
    );
  }

  private _isNetworkSelected(): boolean {
    return this.form.controls.network.value.toString().length > 0;
  }

  private _clusterProviderSettingsForm(isValid: boolean): ClusterProviderSettingsForm {
    return {
      cloudSpec: {
        openstack: {
          tenant: this.cluster.spec.cloud.openstack.tenant,
          tenantID: this.cluster.spec.cloud.openstack.tenantID,
          domain: this.cluster.spec.cloud.openstack.domain,
          username: this.cluster.spec.cloud.openstack.username,
          password: this.cluster.spec.cloud.openstack.password,
          floatingIpPool: this.cluster.spec.cloud.openstack.floatingIpPool,
          securityGroups: this.form.controls.securityGroup.value,
          network: this.form.controls.network.value,
          subnetID: this.form.controls.subnetId.value,
        },
        dc: this.cluster.spec.cloud.dc,
      },
      valid: isValid,
    };
  }
}
