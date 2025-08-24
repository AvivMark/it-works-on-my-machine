# GitHub Actions Workflows

This project uses a modular workflow approach for better maintainability and parallel execution.

## Workflow Structure

### 🔧 **Core CI** (`ci-core.yaml`)

**Triggers:** PR, Push, Workflow Call, Manual

- **Build**: Install dependencies, smoke tests
- **Test**: Unit tests, coverage reporting, threshold enforcement
- **Lint**: Code linting with Super-Linter
- **Helm Lint**: Validates Helm chart syntax

### 🚀 **Release** (`release.yaml`)

**Triggers:** Push to `main` branch

- **Semantic Release**: Automated versioning and changelog
- **Calls Docker & Helm**: Directly calls downstream workflows with version
- **Parallel Execution**: Docker and Helm operations run simultaneously

### 🐳 **Docker** (`docker.yaml`)

**Triggers:** Workflow call from release, Manual

- **Dynamic Image Building**: Uses package.json name for image tags
- **Multi-tag Strategy**: version, SHA, latest
- **GHCR Publishing**: Pushes to GitHub Container Registry

### ⚓ **Helm** (`helm.yaml`)

**Triggers:** Workflow call from release, Manual

- **Chart Updates**: Bumps version in Chart.yaml and values.yaml
- **Dynamic Packaging**: Uses project name from package.json
- **Chart Publishing**: Pushes to OCI registry (GHCR)

### 🚀 **Deploy & Test** (`deploy.yaml`)

**Triggers:** Workflow call from release, Manual

- **Kind Testing**: Deploys Helm chart to local Kubernetes cluster
- **Health Checks**: Verifies application health endpoints
- **Load Testing**: Basic performance validation
- **Environment Deployment**: Deploys to staging/production with approvals

## Workflow Flow

```mermaid
graph TD
    A[PR Created] --> B[CI Core]
    
    D[Push to main] --> E[Release]
    E --> F[Docker Build]
    E --> G[Helm Update]
    F --> H[Deploy & Test]
    G --> H
    H --> I{Kind Tests Pass?}
    I -->|Yes| J[Deploy to Staging]
    I -->|No| K[Deployment Failed]
    J --> L{Manual Approval?}
    L -->|Yes| M[Deploy to Production]
    L -->|No| N[Stay in Staging]
    
    O[Manual Trigger] --> B
    O --> F
    O --> G
    O --> H
```

## Benefits

- ✅ **Modular**: Each workflow has a single responsibility
- ✅ **Parallel**: Docker and Helm operations run concurrently
- ✅ **Reusable**: Workflows can be triggered manually or by dispatch
- ✅ **Dynamic**: All project names and paths are auto-detected
- ✅ **Maintainable**: Easier to debug and modify individual components
- ✅ **Efficient**: Only runs necessary jobs based on trigger

## Manual Execution

You can manually trigger workflows from the GitHub Actions tab:

- **CI Core**: Test your code changes
- **Docker**: Build and push container images  
- **Helm**: Update and publish Helm charts
- **Deploy & Test**: Test deployment in Kind cluster and deploy to environments
- **Test Complete Flow**: Run the entire pipeline end-to-end with a custom version

## Local Testing

For local development and testing:

```bash
# Test Helm chart deployment in Kind cluster
./scripts/test-kind-deployment.sh [version]

# Example:
./scripts/test-kind-deployment.sh 1.0.0-test
```

## Configuration

All workflows use dynamic configuration from:
- `package.json` - Project name and version
- `GITHUB_REPOSITORY` - Repository owner and name
- Environment variables for Node.js version and coverage thresholds
