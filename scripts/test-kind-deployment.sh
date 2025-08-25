#!/bin/bash
# Local Kind testing script
# This script mimics what the GitHub Actions workflow does for local testing

set -euo pipefail

PROJECT_NAME=$(node -p "require('./package.json').name")
VERSION=${1:-"latest"}
CLUSTER_NAME="local-test-cluster"

echo "🚀 Testing Helm chart deployment for $PROJECT_NAME:$VERSION in Kind"

# Check if Kind is installed
if ! command -v kind &> /dev/null; then
    echo "❌ Kind is not installed. Please install it from: https://kind.sigs.k8s.io/docs/user/quick-start/"
    exit 1
fi

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install it from: https://helm.sh/docs/intro/install/"
    exit 1
fi

# Create Kind cluster if it doesn't exist
if ! kind get clusters | grep -q "$CLUSTER_NAME"; then
    echo "📦 Creating Kind cluster: $CLUSTER_NAME"
    kind create cluster --name "$CLUSTER_NAME"
else
    echo "✅ Using existing Kind cluster: $CLUSTER_NAME"
fi

# Set kubectl context
kubectl config use-context "kind-$CLUSTER_NAME"

echo "🔍 Verifying cluster connection..."
kubectl cluster-info --context "kind-$CLUSTER_NAME"

# Build and load Docker image if we have a Dockerfile
if [ -f "Dockerfile" ]; then
    echo "🐳 Building Docker image locally..."
    IMAGE_NAME="$PROJECT_NAME:$VERSION"
    docker build -t "$IMAGE_NAME" .
    
    echo "📥 Loading image into Kind cluster..."
    kind load docker-image "$IMAGE_NAME" --name "$CLUSTER_NAME"
else
    echo "ℹ️  No Dockerfile found, skipping image build"
fi

# Update Helm values for local testing
CHART_DIR="charts/$PROJECT_NAME"
if [ -d "$CHART_DIR" ]; then
    echo "⚙️  Updating Helm values for local testing..."
    
    # Backup original values
    cp "$CHART_DIR/values.yaml" "$CHART_DIR/values.yaml.backup"
    
    # Update for local testing
    yq -i ".image.tag = \"$VERSION\"" "$CHART_DIR/values.yaml"
    yq -i ".image.pullPolicy = \"Never\"" "$CHART_DIR/values.yaml"
    
    echo "🔍 Linting Helm chart..."
    helm lint "$CHART_DIR"
    
    echo "🧪 Testing Helm template..."
    helm template test-release "$CHART_DIR" --dry-run > /dev/null
    
    echo "🚀 Installing Helm chart..."
    helm install test-release "$CHART_DIR" --wait --timeout=300s
    
    echo "📋 Checking deployment status..."
    kubectl get all -l app.kubernetes.io/instance=test-release
    
    echo "🏥 Running health checks..."
    
    # Get service details
    SERVICE_NAME=$(kubectl get svc -l app.kubernetes.io/instance=test-release -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_NAME" ]; then
        SERVICE_PORT=$(kubectl get svc "$SERVICE_NAME" -o jsonpath='{.spec.ports[0].port}')
        echo "🔗 Service: $SERVICE_NAME:$SERVICE_PORT"
        
        # Port forward and test
        kubectl port-forward "svc/$SERVICE_NAME" 8080:$SERVICE_PORT &
        PF_PID=$!
        
        sleep 5
        
        # Test health endpoint
        if curl -f http://localhost:8080/health 2>/dev/null; then
            echo "✅ Health check passed!"
        else
            echo "⚠️  Health check failed (this might be expected if /health endpoint doesn't exist)"
        fi
        
        # Cleanup port forward
        kill $PF_PID 2>/dev/null || true
    fi
    
    # Run Helm tests if they exist
    echo "🧪 Running Helm tests..."
    if helm test test-release --timeout=180s; then
        echo "✅ Helm tests passed!"
    else
        echo "⚠️  Helm tests failed or not configured"
    fi
    
    # Restore original values
    mv "$CHART_DIR/values.yaml.backup" "$CHART_DIR/values.yaml"
    
    echo ""
    echo "🎉 Local testing completed!"
    echo ""
    echo "To cleanup:"
    echo "  helm uninstall test-release"
    echo "  kind delete cluster --name $CLUSTER_NAME"
    echo ""
    echo "To keep testing:"
    echo "  kubectl get pods"
    echo "  kubectl logs -l app.kubernetes.io/instance=test-release"
    echo "  kubectl port-forward svc/$SERVICE_NAME 8080:$SERVICE_PORT"
    
else
    echo "❌ Helm chart directory not found: $CHART_DIR"
    exit 1
fi
