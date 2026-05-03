#!/usr/bin/env python3
"""
HealthTeam Deliberation Script — Hermes Agent Skill Helper

Triggers a full Round Table deliberation via SSE and outputs the final protocol.
Usage:
  python3 deliberate.py --url URL --profile-id ID --profile-name NAME --topic TOPIC [options]
"""

import argparse
import json
import sys
import urllib.request
import urllib.error


def create_deliberation(base_url: str, profile_id: str, topic: str) -> str | None:
    """Create a deliberation record and return its ID."""
    data = json.dumps({"profileId": profile_id, "topic": topic}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/deliberations",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            return body.get("id")
    except urllib.error.URLError as e:
        print(f"[ERRO] Falha ao criar deliberacao: {e}", file=sys.stderr)
        return None


def run_deliberation(
    base_url: str,
    profile_id: str,
    profile_name: str,
    topic: str,
    deliberation_id: str | None,
    stack: dict,
    model: str = "gpt-4o",
) -> dict:
    """Stream the deliberation SSE and collect all phase outputs."""
    payload = {
        "topic": topic,
        "profileId": profile_id,
        "profileName": profile_name,
        "stack": stack,
        "deliberationId": deliberation_id,
        "model": model,
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{base_url}/api/round-table-deliberate",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    result = {"coach": "", "nutri": "", "endo": "", "synthesis": "", "error": None}

    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            buffer = ""
            while True:
                chunk = resp.read(4096)
                if not chunk:
                    break
                buffer += chunk.decode("utf-8", errors="replace")

                while "\n\n" in buffer:
                    line, buffer = buffer.split("\n\n", 1)
                    if not line.startswith("data: "):
                        continue
                    try:
                        event = json.loads(line[6:])
                    except json.JSONDecodeError:
                        continue

                    phase = event.get("phase", "")
                    status = event.get("status", "")

                    if phase == "coach" and status == "thinking":
                        print("[Mesa Redonda] Coach Mike analisando...", file=sys.stderr)
                    elif phase == "coach" and status == "done":
                        result["coach"] = event.get("content", "")
                        print("[Mesa Redonda] Coach Mike concluiu.", file=sys.stderr)
                    elif phase == "nutri" and status == "done":
                        result["nutri"] = event.get("content", "")
                        print("[Mesa Redonda] Dra. Sarah concluiu.", file=sys.stderr)
                    elif phase == "endo" and status == "thinking":
                        print("[Mesa Redonda] Dr. Evans analisando...", file=sys.stderr)
                    elif phase == "endo" and status == "done":
                        result["endo"] = event.get("content", "")
                        print("[Mesa Redonda] Dr. Evans concluiu.", file=sys.stderr)
                    elif phase == "synthesis":
                        if event.get("chunk"):
                            result["synthesis"] += event["chunk"]
                    elif phase == "done":
                        print("[Mesa Redonda] Protocolo completo!", file=sys.stderr)
                    elif phase == "error":
                        result["error"] = event.get("message", "Erro desconhecido")
                        print(f"[ERRO] {result['error']}", file=sys.stderr)

    except urllib.error.HTTPError as e:
        if e.code == 429:
            body = json.loads(e.read().decode())
            retry = body.get("retryAfterMs", 30000) / 1000
            result["error"] = f"Rate limit atingido. Tente novamente em {retry:.0f}s."
            print(f"[ERRO] {result['error']}", file=sys.stderr)
        else:
            result["error"] = f"HTTP {e.code}: {e.reason}"
            print(f"[ERRO] {result['error']}", file=sys.stderr)
    except urllib.error.URLError as e:
        result["error"] = f"Falha de conexao: {e.reason}"
        print(f"[ERRO] {result['error']}", file=sys.stderr)

    return result


def main():
    parser = argparse.ArgumentParser(description="HealthTeam Round Table Deliberation")
    parser.add_argument("--url", required=True, help="Base URL do HealthTeam")
    parser.add_argument("--profile-id", required=True, help="ID do perfil")
    parser.add_argument("--profile-name", required=True, help="Nome do atleta")
    parser.add_argument("--topic", required=True, help="Topico da deliberacao")
    parser.add_argument("--goal", default="hypertrophy", help="Objetivo: hypertrophy|conditioning|recomp")
    parser.add_argument("--primary", default="Musculacao", help="Modalidade principal")
    parser.add_argument("--secondary", default="", help="Modalidade secundaria")
    parser.add_argument("--height", type=float, default=175, help="Altura em cm")
    parser.add_argument("--weight", type=float, default=80, help="Peso em kg")
    parser.add_argument("--conditions", default="", help="Condicoes de saude")
    parser.add_argument("--training-context", default="", help="Contexto de treino")
    parser.add_argument("--model", default="gpt-4o", help="Modelo LLM")
    parser.add_argument("--deliberation-id", default=None, help="ID de deliberacao existente")
    parser.add_argument("--json", action="store_true", help="Saida em JSON")
    args = parser.parse_args()

    stack = {
        "goal": args.goal,
        "primary": args.primary,
        "secondary": args.secondary or "Nenhum",
        "height": args.height,
        "weight": args.weight,
        "conditions": args.conditions,
        "trainingContext": args.training_context,
    }

    # Create deliberation record if not provided
    delib_id = args.deliberation_id
    if not delib_id:
        delib_id = create_deliberation(args.url, args.profile_id, args.topic)

    # Run the full deliberation
    result = run_deliberation(
        base_url=args.url,
        profile_id=args.profile_id,
        profile_name=args.profile_name,
        topic=args.topic,
        deliberation_id=delib_id,
        stack=stack,
        model=args.model,
    )

    if result["error"]:
        if args.json:
            print(json.dumps({"error": result["error"]}, ensure_ascii=False))
        else:
            print(f"\nErro: {result['error']}")
        sys.exit(1)

    if args.json:
        print(json.dumps({
            "deliberationId": delib_id,
            "coach": result["coach"],
            "nutri": result["nutri"],
            "endo": result["endo"],
            "synthesis": result["synthesis"],
        }, ensure_ascii=False, indent=2))
    else:
        print("\n" + "=" * 60)
        print("PROTOCOLO INTEGRADO — HEALTHTEAM MESA REDONDA")
        print("=" * 60)
        if delib_id:
            print(f"Deliberacao ID: {delib_id}")
        print()
        print(result["synthesis"])
        print()
        print("-" * 60)
        print("Blocos individuais dos especialistas disponiveis via --json")
        print("-" * 60)


if __name__ == "__main__":
    main()
