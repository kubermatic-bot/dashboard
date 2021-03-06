import {fakeDigitaloceanCluster} from '../../../testing/fake-data/cluster.fake';
import {fakeHealth, fakeHealthFailed, fakeHealthProvisioning} from '../../../testing/fake-data/health.fake';

import {ClusterHealthStatus, HealthStatusCss} from './cluster-health-status';
import {HealthStatusColor, HealthStatusMessage} from './health-status';

describe('ClusterHealthStatus', () => {
  const cluster = fakeDigitaloceanCluster();
  const health = fakeHealth();
  const healthProvisioning = fakeHealthProvisioning();
  const healthFailed = fakeHealthFailed();

  it('should return correct status for clusters', () => {
    expect(ClusterHealthStatus.getHealthStatus(cluster, health)).toEqual(
      new ClusterHealthStatus(HealthStatusMessage.Running, HealthStatusColor.Green, HealthStatusCss.Running)
    );
    expect(ClusterHealthStatus.getHealthStatus(cluster, healthProvisioning)).toEqual(
      new ClusterHealthStatus(HealthStatusMessage.Provisioning, HealthStatusColor.Orange, HealthStatusCss.Provisioning)
    );
  });

  it('should return if cluster is running', () => {
    expect(ClusterHealthStatus.isClusterAPIRunning(cluster, health)).toBeTruthy();
    expect(ClusterHealthStatus.isClusterAPIRunning(cluster, healthFailed)).toBeFalsy();
  });
});
