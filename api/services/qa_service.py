def answer_question(profile: dict, question: str) -> dict:
    # Placeholder/compatibility response. In the future this will call an AI agent.
    example = "Basado en el perfil, Mirel tiene amplia experiencia en SIG, CRM y automatización."
    return {
        "question": question,
        "context_used": "profile",
        "note": "Aquí se integrará el agente IA.",
        "example_answer": example,
        # Standardized fields expected by the frontend
        "answer": example,
        "respuesta": example,
    }

