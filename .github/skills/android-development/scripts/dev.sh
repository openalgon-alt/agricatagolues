#!/bin/bash
# Android Development Quick Commands
# Place in project root: ./scripts/dev.sh
# Usage: chmod +x scripts/dev.sh && ./scripts/dev.sh clean

case "$1" in
  clean)
    echo "🧹 Cleaning project..."
    ./gradlew clean
    ;;
  
  debug)
    echo "🔨 Building debug APK..."
    ./gradlew assembleDebug
    echo "✅ Debug APK: app/build/outputs/apk/debug/"
    ;;
  
  release)
    echo "🎉 Building release bundle..."
    ./gradlew bundleRelease
    echo "✅ Bundle: app/build/outputs/bundle/release/"
    ;;
  
  test)
    echo "🧪 Running unit tests..."
    ./gradlew test --continue
    ;;
  
  test-ui)
    echo "📱 Running UI tests..."
    ./gradlew connectedAndroidTest
    ;;
  
  lint)
    echo "🔍 Running lint analysis..."
    ./gradlew lint
    echo "📊 Report: app/build/reports/lint-results.html"
    ;;
  
  profile)
    echo "⚡ Building with profiling..."
    ./gradlew :app:profileReleaseApk
    ;;
  
  analyze)
    echo "📦 Analyzing APK size..."
    ./gradlew analyzeReleaseBundle
    ;;
  
  install)
    echo "📲 Installing debug app..."
    ./gradlew installDebug
    ;;
  
  *)
    echo "Android Dev Commands:"
    echo "  ./scripts/dev.sh clean       - Clean build"
    echo "  ./scripts/dev.sh debug       - Build debug APK"
    echo "  ./scripts/dev.sh release     - Build release bundle"
    echo "  ./scripts/dev.sh test        - Run unit tests"
    echo "  ./scripts/dev.sh test-ui     - Run UI tests"
    echo "  ./scripts/dev.sh lint        - Run lint analysis"
    echo "  ./scripts/dev.sh profile     - Build for profiling"
    echo "  ./scripts/dev.sh analyze     - Analyze bundle size"
    echo "  ./scripts/dev.sh install     - Install debug build"
    ;;
esac
