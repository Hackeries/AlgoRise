# Kubernetes Deployment Configuration for Battle Arena

This directory contains Kubernetes manifests for deploying the AlgoRise Battle Arena system.

## Architecture

- **Web Application**: Next.js frontend and API (stateless, horizontally scalable)
- **WebSocket Server**: Real-time match communication (sticky sessions)
- **Matchmaking Worker**: Background process for finding matches
- **Submission Worker**: Code execution job processor
- **Redis**: In-memory cache and queue
- **PostgreSQL**: Persistent database (managed service recommended)

## Deployment Order

1. Apply namespace: `kubectl apply -f namespace.yaml`
2. Apply secrets: `kubectl apply -f secrets.yaml` (after configuring)
3. Apply Redis: `kubectl apply -f redis.yaml`
4. Apply services: `kubectl apply -f services/`
5. Apply workers: `kubectl apply -f workers/`
6. Apply ingress: `kubectl apply -f ingress.yaml`

## Scaling

- Web application: `kubectl scale deployment algorise-web --replicas=5`
- Submission workers: `kubectl scale deployment submission-worker --replicas=10`
- Matchmaking workers: `kubectl scale deployment matchmaking-worker --replicas=3`

## Monitoring

- Prometheus metrics exposed on `/metrics` endpoint
- Grafana dashboards in `dashboards/` directory
- Logs aggregated via ELK stack or cloud provider logging

## Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- PostgreSQL database (managed service recommended)
- Domain name with DNS configured
- SSL certificates (Let's Encrypt via cert-manager recommended)
