# 📊 Monitoring — Prometheus + Grafana + Alertmanager

Real-time monitoring and alerting for the Subscription Tracker application.

## Architecture

```
App EC2
└── Node Exporter :9100  ─────────────→ Monitoring EC2
└── Backend /metrics :3000 ──────────→ ├── Prometheus :9090
                                        ├── Grafana :3000
                                        └── Alertmanager :9093
                                                ↓
                                        Email Alerts
```

## Components

| Tool | Port | Purpose |
|------|------|---------|
| Node Exporter | 9100 | System metrics (CPU, Memory, Disk) |
| Prometheus | 9090 | Metrics collection and storage |
| Grafana | 3000 | Dashboard visualization |
| Alertmanager | 9093 | Alert routing and notifications |

## Installation

### Node Exporter (App EC2)

```bash
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v1.8.1/node_exporter-1.8.1.linux-amd64.tar.gz
tar xvf node_exporter-1.8.1.linux-amd64.tar.gz
sudo mv node_exporter-1.8.1.linux-amd64/node_exporter /usr/local/bin/
sudo systemctl start node_exporter
sudo systemctl enable node_exporter
```

### Prometheus (Monitoring EC2)

```bash
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.53.0/prometheus-2.53.0.linux-amd64.tar.gz
tar xvf prometheus-2.53.0.linux-amd64.tar.gz
sudo mv prometheus-2.53.0.linux-amd64/prometheus /usr/local/bin/
```

### Grafana (Monitoring EC2)

```bash
sudo dnf install grafana -y
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

### Alertmanager (Monitoring EC2)

```bash
cd /tmp
wget https://github.com/prometheus/alertmanager/releases/download/v0.27.0/alertmanager-0.27.0.linux-amd64.tar.gz
tar xvf alertmanager-0.27.0.linux-amd64.tar.gz
sudo mv alertmanager-0.27.0.linux-amd64/alertmanager /usr/local/bin/
```

## Configuration

### prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert.rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['app-private-ip:9100']

  - job_name: 'backend-app'
    static_configs:
      - targets: ['app-private-ip:3000']
```

### alert.rules.yml

```yaml
groups:
  - name: app_alerts
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance down"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[2m])) * 100) > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
```

## Backend App Metrics (prom-client)

Added to `app.js`:

```javascript
import client from 'prom-client'

client.collectDefaultMetrics()

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.send(await client.register.metrics())
})
```

## Grafana Dashboard

1. Add Prometheus data source: `http://localhost:9090`
2. Import dashboard ID `1860` (Node Exporter Full)
3. View CPU, Memory, Disk, Network metrics

## Access URLs

```
Prometheus:   http://monitoring-ip:9090
Grafana:      http://monitoring-ip:3000  (admin/admin)
Alertmanager: http://monitoring-ip:9093
Node Exporter metrics: http://app-ip:9100/metrics
Backend metrics:       http://app-ip:3000/metrics
```

## Key Learnings

- Use private IP between servers in same VPC (faster + free)
- Port 9100 must be open in App EC2 security group
- `vm.max_map_count=262144` required for SonarQube (not monitoring)
- prom-client must be installed before importing in Node.js
- Use separate monitoring server for production-grade setup