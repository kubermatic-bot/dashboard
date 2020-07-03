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

import {merge, Observable, of, onErrorResumeNext} from 'rxjs';
import {catchError, filter, switchMap} from 'rxjs/operators';

import {DatacenterService, PresetsService} from '../../../core/services';
import {Datacenter} from '../../../shared/entity/datacenter';
import {NodeProvider} from '../../../shared/model/NodeProviderConstants';
import {ClusterService} from '../../../wizard-new/service/cluster';
import {NodeDataMode} from '../../config';
import {NodeDataService} from '../service';
import {OpenstackFlavor, OpenstackAvailabilityZone} from '../../../shared/entity/provider/openstack';

export class NodeDataOpenstackProvider {
  constructor(
    private readonly _nodeDataService: NodeDataService,
    private readonly _clusterService: ClusterService,
    private readonly _presetService: PresetsService,
    private readonly _datacenterService: DatacenterService
  ) {}

  set tags(tags: object) {
    delete this._nodeDataService.nodeData.spec.cloud.openstack.tags;
    this._nodeDataService.nodeData.spec.cloud.openstack.tags = tags;
  }

  flavors(onError: () => void = undefined, onLoadingCb: () => void = null): Observable<OpenstackFlavor[]> {
    // TODO: support dialog mode
    switch (this._nodeDataService.mode) {
      case NodeDataMode.Wizard:
        return merge(this._clusterService.clusterChanges, this._nodeDataService.nodeDataChanges)
          .pipe(filter(_ => this._clusterService.provider === NodeProvider.OPENSTACK))
          .pipe(
            switchMap(_ =>
              this._presetService
                .provider(NodeProvider.OPENSTACK)
                .domain(this._clusterService.cluster.spec.cloud.openstack.domain)
                .username(this._clusterService.cluster.spec.cloud.openstack.username)
                .password(this._clusterService.cluster.spec.cloud.openstack.password)
                .tenant(this._clusterService.cluster.spec.cloud.openstack.tenant)
                .tenantID(this._clusterService.cluster.spec.cloud.openstack.tenantID)
                .datacenter(this._clusterService.cluster.spec.cloud.dc)
                .credential(this._presetService.preset)
                .flavors(onLoadingCb)
                .pipe(
                  catchError(_ => {
                    if (onError) {
                      onError();
                    }

                    return onErrorResumeNext(of([]));
                  })
                )
            )
          );
    }
  }

  dc(): Observable<Datacenter> {
    switch (this._nodeDataService.mode) {
      case NodeDataMode.Wizard:
        return merge(this._nodeDataService.operatingSystemChanges, this._clusterService.datacenterChanges)
          .pipe(filter(_ => this._clusterService.provider === NodeProvider.OPENSTACK))
          .pipe(switchMap(_ => this._datacenterService.getDatacenter(this._clusterService.cluster.spec.cloud.dc)));
    }
  }

  availabilityZones(
    onError: () => void = undefined,
    onLoadingCb: () => void = null
  ): Observable<OpenstackAvailabilityZone[]> {
    // TODO: support dialog mode
    switch (this._nodeDataService.mode) {
      case NodeDataMode.Wizard:
        return merge(this._clusterService.clusterChanges, this._nodeDataService.nodeDataChanges)
          .pipe(filter(_ => this._clusterService.provider === NodeProvider.OPENSTACK))
          .pipe(
            switchMap(_ =>
              this._presetService
                .provider(NodeProvider.OPENSTACK)
                .domain(this._clusterService.cluster.spec.cloud.openstack.domain)
                .username(this._clusterService.cluster.spec.cloud.openstack.username)
                .password(this._clusterService.cluster.spec.cloud.openstack.password)
                .tenant(this._clusterService.cluster.spec.cloud.openstack.tenant)
                .tenantID(this._clusterService.cluster.spec.cloud.openstack.tenantID)
                .datacenter(this._clusterService.cluster.spec.cloud.dc)
                .credential(this._presetService.preset)
                .availabilityZones(onLoadingCb)
                .pipe(
                  catchError(_ => {
                    if (onError) {
                      onError();
                    }

                    return onErrorResumeNext(of([]));
                  })
                )
            )
          );
    }
  }
}
