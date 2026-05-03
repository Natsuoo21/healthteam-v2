#!/usr/bin/env python3
"""
HealthTeam Health Check — Hermes Agent Skill Helper

Quick check if HealthTeam is running and list profiles.
Usage:
  python3 healthcheck.py --url URL
"""

import argparse
import json
import sys
import urllib.request
import urllib.error


def main():
    parser = argparse.ArgumentParser(description="HealthTeam Health Check")
    parser.add_argument("--url", required=True, help="Base URL do HealthTeam")
    args = parser.parse_args()

    base = args.url.rstrip("/")

    # Check connectivity
    try:
        req = urllib.request.Request(f"{base}/api/profiles", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.URLError as e:
        print(json.dumps({
            "status": "offline",
            "error": str(e.reason),
            "url": base,
        }, ensure_ascii=False))
        sys.exit(1)

    profiles = data.get("profiles", {})
    profile_list = []
    for pid, pdata in profiles.items():
        stack = pdata.get("trainingStack")
        profile_list.append({
            "id": pid,
            "name": pdata.get("name", "?"),
            "goal": stack.get("goal") if stack else None,
            "primary": stack.get("primary") if stack else None,
            "hasStack": stack is not None,
        })

    print(json.dumps({
        "status": "online",
        "url": base,
        "profileCount": len(profile_list),
        "profiles": profile_list,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
