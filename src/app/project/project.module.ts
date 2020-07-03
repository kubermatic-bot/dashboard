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

import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {EditProjectComponent} from './edit-project/edit-project.component';
import {ProjectRoutingModule} from './project-routing.module';
import {ProjectComponent} from './project.component';

const components: any[] = [ProjectComponent, EditProjectComponent];

@NgModule({
  imports: [SharedModule, ProjectRoutingModule],
  declarations: [...components],
  exports: [...components],
  entryComponents: [EditProjectComponent],
})
export class ProjectModule {}
