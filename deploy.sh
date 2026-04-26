#!/bin/bash
docker run -d \
  --name healthteam-web \
  --restart unless-stopped \
  -p 3005:3000 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDP5vul_j7AWV2ul2iuFtsge5KJ0HVqIUg \
  -e DATABASE_URL=file:/app/data/dev.db \
  -e NODE_ENV=production \
  -v /DATA/healthteam-data:/app/data \
  ghcr.io/natsuoo21/healthteam-v2:main
