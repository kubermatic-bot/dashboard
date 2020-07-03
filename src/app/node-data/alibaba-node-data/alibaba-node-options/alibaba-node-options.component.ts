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
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {WizardService} from '../../../core/services';
import {NodeDataService} from '../../../core/services/node-data/node-data.service';
import {NodeData, NodeProviderData} from '../../../shared/model/NodeSpecChange';

@Component({
  selector: 'km-alibaba-node-options',
  templateUrl: './alibaba-node-options.component.html',
})
export class AlibabaNodeOptionsComponent implements OnInit, OnDestroy {
  @Input() nodeData: NodeData;

  hideOptional = true;
  private _unsubscribe: Subject<any> = new Subject();

  constructor(private readonly _nodeDataService: NodeDataService, private readonly _wizardService: WizardService) {}

  ngOnInit(): void {
    this._wizardService.clusterSettingsFormViewChanged$.pipe(takeUntil(this._unsubscribe)).subscribe(data => {
      this.hideOptional = data.hideOptional;
    });

    this._nodeDataService.changeNodeProviderData(this.getNodeProviderData());
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  getNodeProviderData(): NodeProviderData {
    return {
      spec: {
        alibaba: {
          instanceType: this.nodeData.spec.cloud.alibaba.instanceType,
          diskSize: this.nodeData.spec.cloud.alibaba.diskSize,
          diskType: this.nodeData.spec.cloud.alibaba.diskType,
          vSwitchID: this.nodeData.spec.cloud.alibaba.vSwitchID,
          internetMaxBandwidthOut: this.nodeData.spec.cloud.alibaba.internetMaxBandwidthOut,
          zoneID: this.nodeData.spec.cloud.alibaba.zoneID,
          labels: this.nodeData.spec.cloud.alibaba.labels,
        },
      },
      valid: this.nodeData.valid,
    };
  }
}
