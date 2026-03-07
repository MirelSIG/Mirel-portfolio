def answer_question(profile: dict, question: str) -> dict:
    return {
        "question": question,
        "context_used": "profile",
        "note": "Aquí se integrará el agente IA.",
        "example_answer": "Basado en el perfil, Mirel tiene amplia experiencia en SIG, CRM y automatización."
    }

