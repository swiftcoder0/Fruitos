import os

def template_explanation(decision_result: dict) -> str:
    """Non-LLM fallback — ALWAYS works, zero external dependencies."""
    rec = decision_result.get("recommendation")
    actions = decision_result.get("actions", {})
    safety = decision_result.get("safety_check", {})

    if not rec:
        return "No feasible action found — every option failed the safety check."

    lines = [
        f"✅ **Recommended: {rec['action'].upper()}**",
        f"   Net value: ₹{rec['net_value']:,.0f} | Waste: {rec['waste_kg']} kg",
        "",
        "📊 **All actions evaluated:**"
    ]

    feasible = {k: v for k, v in actions.items() if v.get("feasible")}
    infeasible = {k: v for k, v in actions.items() if not v.get("feasible")}

    for name, data in feasible.items():
        lines.append(f"   • {name.upper()}: ₹{data['net_value']:,.0f} net, {data['waste_kg']}kg waste")

    if infeasible:
        lines.append("")
        lines.append("❌ **Rejected (unsafe/infeasible):**")
        for name, data in infeasible.items():
            lines.append(f"   • {name.upper()}: {data.get('reason', 'No reason given')}")

    if not safety.get("is_safe", True):
        lines.append("")
        lines.append(f"⚠️ **Safety note:** {safety.get('reason', '')}")

    return "\n".join(lines)


def gemini_explanation(decision_result: dict, model: str = "gemini-2.0-flash") -> str:
    """
    Uses the google.genai package to rephrase the ALREADY-COMPUTED decision.
    Never decides — only narrates. Falls back to template on ANY failure.
    """
    print("🔍 GEMINI: Attempting to use Gemini (google.genai)...")

    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"🔍 GEMINI: API Key found: {bool(api_key)}")

    if not api_key:
        print("🔍 GEMINI: No API key, using template")
        return template_explanation(decision_result)

    try:
        from google import genai
        from google.genai import types

        print("🔍 GEMINI: Imported google.genai successfully")

        client = genai.Client(api_key=api_key)
        print("🔍 GEMINI: Client created")

        rec = decision_result.get("recommendation")
        actions = decision_result.get("actions", {})
        safety = decision_result.get("safety_check", {})

        actions_summary = "\n".join(
            f"- {name}: " + (
                f"net value ₹{a['net_value']:,.0f}, waste {a['waste_kg']}kg"
                if a.get("feasible") else f"REJECTED — {a['reason']}"
            )
            for name, a in actions.items()
        )

        prompt = (
            "A deterministic decision engine has ALREADY chosen an action for a "
            "produce batch. Do not change, question, or re-derive the decision. "
            "Explain it in 2-3 plain sentences for a warehouse manager who has "
            "never seen these numbers before.\n\n"
            f"Chosen action: {rec['action']}\n"
            f"All evaluated options:\n{actions_summary}\n"
            f"Safety check: {safety.get('reason', 'n/a')}\n"
        )

        print("🔍 GEMINI: Sending prompt...")

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=200,
                http_options=types.HttpOptions(timeout=8000),   # <-- the actual fix
            )
        )

        print(f"🔍 GEMINI: Response received: {bool(response.text)}")

        if response.text:
            return response.text.strip()
        else:
            print("🔍 GEMINI: Empty response, using template")
            return template_explanation(decision_result)

    except Exception as e:
        print(f"🔍 GEMINI: ERROR: {e}")
        import traceback
        traceback.print_exc()
        return template_explanation(decision_result)