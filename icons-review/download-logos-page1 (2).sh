#!/bin/bash
# Docker Hub Logo Downloader - Page 1

mkdir -p icons
cd icons

echo "Downloading tensorflow/tensorflow..."
curl -L "https://www.gravatar.com/avatar/12bb888b1d946b128037abc877e93bc7?s=40&r=g&d=404" -o "tensorflow/tensorflow.png"

echo "Downloading pytorch/pytorch..."
curl -L "https://www.gravatar.com/avatar/adbb6a6ef575033973b59b9f96348d34?s=40&r=g&d=404" -o "pytorch/pytorch.png"

# 3. langchain/langchain - No logo available

echo "Downloading ai/qwen3..."
curl -L "https://djeqr6to3dedg.cloudfront.net/repo-logos/ai/qwen3/live/logo-1746463132955.png" -o "ai/qwen3.png"

echo "Downloading arm32v7/redis..."
curl -L "https://www.gravatar.com/avatar/7510e100f7ebeca4a0b8c3c617349295?s=40&r=g&d=404" -o "arm32v7/redis.png"

echo "Downloading atlassian/confluence..."
curl -L "https://www.gravatar.com/avatar/14a1dfcf20cb05fbb75ea0a163d34acc?s=40&r=g&d=404" -o "atlassian/confluence.png"

echo "Downloading grafana/grafana..."
curl -L "https://www.gravatar.com/avatar/31cea69afa424609b2d83621b4d47f1d?s=40&r=g&d=404" -o "grafana/grafana.png"

echo "Downloading selenium/video..."
curl -L "https://www.gravatar.com/avatar/b2a8a002fd393d0cfd1158319054a026?s=40&r=g&d=404" -o "selenium/video.png"

echo "Downloading localstack/localstack-pro..."
curl -L "https://djeqr6to3dedg.cloudfront.net/repo-logos/localstack/localstack-pro/live/logo-1719665078450.png" -o "localstack/localstack-pro.png"

echo "Downloading Docker Labs K8s Toolkit..."
curl -L "https://desktop.docker.com/extensions/docker_labs-k8s-toolkit-extension/docker-extension-screenshots_s3_amazonaws_com/labs-k8s-toolkit/k8s.svg" -o "Docker Labs K8s Toolkit.svg"

echo "Done! Downloaded logos to icons/ directory"
