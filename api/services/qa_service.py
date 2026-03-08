import json
import os

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

def answer_question_with_ollama(profile: dict, question: str) -> dict:
    """
    Usa Ollama para generar respuestas más naturales y contextuales.
    """
    q = question.lower()
    is_english = any(w in q for w in ['what', 'who', 'where', 'when', 'how', 'tell', 'describe'])
    lang = 'en' if is_english else 'es'
    
    # Construir contexto completo del perfil
    personal_info = profile.get('personal_info', {})
    skills_tech = profile.get('skills', {}).get('technical', {}).get(lang, [])
    skills_soft = profile.get('skills', {}).get('skills', {}).get(lang, [])
    education = profile.get('education', [])
    certifications = profile.get('certifications', [])
    experience = profile.get('experience', [])
    summary_lines = profile.get('summary', {}).get(lang, [])
    
    # Crear prompt contextual
    system_prompt = f"""Eres un asistente de IA que proporciona información sobre Mirel Volcán Calderón, una profesional que ha migrado al desarrollo de software.

INFORMACIÓN CLAVE:
- Nombre: {personal_info.get('full_name', 'Mirel Marsoli Volcán Calderón')}
- Ubicación: {personal_info.get('location', {}).get('city', '')}, {personal_info.get('location', {}).get('country', '')}
- Email: {personal_info.get('email', '')}

RESUMEN:
{' '.join(summary_lines)}

HABILIDADES TÉCNICAS:
{', '.join(skills_tech)}

HABILIDADES BLANDAS:
{', '.join(skills_soft)}

CERTIFICACIONES:
{', '.join([c.get('name', '') for c in certifications])}

EDUCACIÓN:
{' - '.join([f"{e.get('degree_es' if lang == 'es' else 'degree_en', '')} en {e.get('institution', '')}" for e in education])}

EXPERIENCIA PROFESIONAL:
"""
    
    for exp in experience:
        role_key = 'role_es' if lang == 'es' else 'role_en'
        resp_key = 'responsibilities_es' if lang == 'es' else 'responsibilities_en'
        system_prompt += f"\n• {exp.get('company', '')} - {exp.get(role_key, '')} ({exp.get('period', '')})"
        system_prompt += f"\n  {'; '.join(exp.get(resp_key, [])[:2])}"
    
    system_prompt += f"""

INSTRUCCIONES:
- Responde en {'español' if lang == 'es' else 'inglés'}
- Sé conciso pero informativo
- Enfatiza cómo su experiencia diversa aporta valor único al desarrollo de software
- Usa un tono profesional pero cercano
- Si no tienes información específica, indica qué puedes responder
- No inventes información que no esté en el contexto
"""
    
    try:
        # Configurar host de Ollama (para Docker o local)
        ollama_host = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
        
        response = ollama.chat(
            model='llama3.2:3b',  # Modelo ligero y rápido
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': question}
            ],
            options={
                'timeout': 30  # 30 segundos timeout
            }
        )
        
        answer = response['message']['content']
        
        return {
            "question": question,
            "answer": answer,
            "respuesta": answer,
            "context_used": ["ollama_llm"],
            "language_detected": lang,
            "model": "ollama_llama3.2"
        }
    except Exception as e:
        # Si Ollama falla, usar fallback
        print(f"Ollama error: {e}. Using keyword fallback.")
        return None


def answer_question(profile: dict, question: str) -> dict:
    """
    Analiza la pregunta y retorna una respuesta relevante.
    Intenta usar Ollama primero, luego fallback a sistema de keywords.
    """
    # Intentar usar Ollama si está disponible
    if OLLAMA_AVAILABLE:
        ollama_response = answer_question_with_ollama(profile, question)
        if ollama_response:
            return ollama_response
    
    # Fallback: sistema de keywords original
    q = question.lower()
    
    # Detectar idioma
    is_english = any(w in q for w in ['what', 'who', 'where', 'when', 'how', 'tell', 'describe'])
    lang = 'en' if is_english else 'es'
    
    # Extraer datos del perfil
    personal_info = profile.get('personal_info', {})
    skills_tech = profile.get('skills', {}).get('technical', {}).get(lang, [])
    skills_soft = profile.get('skills', {}).get('skills', {}).get(lang, [])
    education = profile.get('education', [])
    certifications = profile.get('certifications', [])
    experience = profile.get('experience', [])
    summary_lines = profile.get('summary', {}).get(lang, [])
    
    answer = ""
    context_used = []
    
    # Patrones de preguntas (orden: más específico a más general)
    
    # Salesforce
    if 'salesforce' in q or 'service cloud' in q:
        sf_skills = [s for s in skills_tech if 'salesforce' in s.lower()]
        answer = f"Mirel {'tiene certificaciones' if lang == 'es' else 'holds certifications'}: {', '.join(sf_skills)}. {'Ha aplicado este conocimiento en automatización de procesos y diseño de soluciones CRM' if lang == 'es' else 'She has applied this knowledge in process automation and CRM solution design'}."
        context_used.append('salesforce')
    
    # CRM
    elif 'crm' in q:
        crm_skills = [s for s in skills_tech if any(w in s.lower() for w in ['salesforce', 'odoo'])]
        answer = f"Mirel {'tiene experiencia en CRM con' if lang == 'es' else 'has CRM experience with'}: {', '.join(crm_skills)}."
        context_used.append('crm')
    
    # Odoo/ERP
    elif 'odoo' in q or 'erp' in q:
        odoo_exp = [e for e in experience if 'odoo' in str(e.get('tags', [])).lower()]
        if odoo_exp:
            exp = odoo_exp[0]
            resp_key = 'responsibilities_es' if lang == 'es' else 'responsibilities_en'
            resp = '; '.join(exp.get(resp_key, [])[:2])
            answer = f"Mirel {'trabajó con Odoo en' if lang == 'es' else 'worked with Odoo at'} {exp.get('company', '')} ({exp.get('period', '')}). {resp}"
        else:
            odoo_skills = [s for s in skills_tech if 'odoo' in s.lower()]
            answer = f"Mirel {'tiene experiencia en Odoo' if lang == 'es' else 'has Odoo experience'}: {', '.join(odoo_skills) if odoo_skills else ('desarrollo de módulos' if lang == 'es' else 'module development')}."
        context_used.append('odoo')
    
    # Certificaciones
    elif any(w in q for w in ['certifica', 'credential', 'certif', 'acredit']):
        if certifications:
            cert_names = [c.get('name', '') for c in certifications]
            cert_list = ', '.join(cert_names)
            answer = f"Mirel {'tiene las siguientes certificaciones' if lang == 'es' else 'holds the following certifications'}: {cert_list}."
        else:
            answer = "Información de certificaciones no disponible." if lang == 'es' else "Certifications information not available."
        context_used.append('certifications')
    
    # Educación/Formación (solo educación formal, sin certificaciones)
    elif any(w in q for w in ['educa', 'estudi', 'stud', 'titulo', 'degree', 'forma', 'training', 'bootcamp', 'escuela', 'universidad', 'univ', 'aprend']):
        if education:
            edu = education[0]
            degree = edu.get('degree_es' if lang == 'es' else 'degree_en', '')
            institution = edu.get('institution', '')
            period = edu.get('period', '')
            focus = ', '.join(edu.get('focus_es' if lang == 'es' else 'focus_en', []))
            
            answer = f"{'Actualmente cursa' if lang == 'es' else 'Currently enrolled in'} {degree} {'en' if lang == 'es' else 'at'} {institution} ({period})"
            if focus:
                answer += f", {'enfocado en' if lang == 'es' else 'focused on'} {focus}."
            else:
                answer += "."
        else:
            answer = "Información de educación no disponible." if lang == 'es' else "Education information not available."
        context_used.append('education')
    
    # SIG/GIS
    elif any(w in q for w in ['sig', 'gis', 'qgis', 'arcgis', 'geoespacial', 'geospatial', 'mapa']):
        gis_skills = [s for s in skills_tech if any(w in s.lower() for w in ['sig', 'gis', 'qgis', 'arcgis', 'webmapping'])]
        answer = f"Mirel {'tiene experiencia en SIG' if lang == 'es' else 'has GIS experience'}: {', '.join(gis_skills)}. {'Ha trabajado en análisis espacial y mapeo ambiental' if lang == 'es' else 'She has worked on spatial analysis and environmental mapping'}."
        context_used.append('gis')
    
    # Python/Programación
    elif any(w in q for w in ['python', 'program', 'codigo', 'code', 'lenguaje', 'c ', ' r ']):
        prog_skills = [s for s in skills_tech if any(w in s.lower() for w in ['python', 'c', 'git', 'r'])]
        answer = f"Mirel {'tiene experiencia en programación' if lang == 'es' else 'has programming experience'}: {', '.join(prog_skills)}. {'Ha trabajado en análisis de datos y automatización' if lang == 'es' else 'She has worked on data analysis and automation'}."
        context_used.append('programming')
    
    # Experiencia ambiental/sostenibilidad
    elif any(w in q for w in ['ambient', 'environment', 'sostenib', 'sustain', 'clima', 'climate', 'verde', 'green', 'conserv', 'ecolog']):
        env_exp = [e for e in experience if any(w in str(e).lower() for w in ['usfs', 'usaid', 'intec', 'hidro', 'itree', 'clima', 'verde'])]
        if env_exp:
            answer = f"Mirel {'tiene amplia experiencia en proyectos ambientales' if lang == 'es' else 'has extensive experience in environmental projects'}:\n\n"
            for exp in env_exp[:3]:
                company = exp.get('company', '')
                role_key = 'role_es' if lang == 'es' else 'role_en'
                role = exp.get(role_key, '')
                period = exp.get('period', '')
                resp_key = 'responsibilities_es' if lang == 'es' else 'responsibilities_en'
                resp = exp.get(resp_key, [])
                answer += f"• {company} - {role} ({period}): {resp[0] if resp else ''}\n"
            answer += f"\n{'Esta experiencia incluye gestión de datos climáticos, modelado de infraestructura verde urbana, valoración económica ambiental y coordinación de proyectos de conservación.' if lang == 'es' else 'This experience includes climate data management, urban green infrastructure modeling, environmental economic valuation and conservation project coordination.'}"
        else:
            answer = f"Mirel {'ha trabajado en proyectos ambientales con enfoque en tecnología, análisis de datos y gestión de proyectos' if lang == 'es' else 'has worked on environmental projects focusing on technology, data analysis and project management'}."
        context_used.append('environmental')
    
    # Cooperación internacional/USAID/Proyectos internacionales
    elif any(w in q for w in ['internacion', 'usaid', 'usfs', 'cooperaci', 'cooperation', 'internacional']):
        intl_exp = [e for e in experience if any(w in e.get('company', '').lower() for w in ['usfs', 'usaid', 'intec'])]
        if intl_exp:
            answer = f"Mirel {'tiene experiencia en cooperación internacional' if lang == 'es' else 'has international cooperation experience'}:\n\n"
            for exp in intl_exp:
                company = exp.get('company', '')
                role_key = 'role_es' if lang == 'es' else 'role_en'
                role = exp.get(role_key, '')
                period = exp.get('period', '')
                location = exp.get('location', '')
                resp_key = 'responsibilities_es' if lang == 'es' else 'responsibilities_en'
                resp = exp.get(resp_key, [])
                answer += f"• {company} ({location}) - {period}\n  {role}: {'; '.join(resp[:2])}\n\n"
            answer += f"{'Esta experiencia demuestra capacidad para trabajar en contextos multiculturales, coordinar stakeholders diversos y gestionar proyectos complejos con impacto social.' if lang == 'es' else 'This experience demonstrates ability to work in multicultural contexts, coordinate diverse stakeholders and manage complex projects with social impact.'}"
        else:
            answer = f"Mirel {'ha trabajado con organizaciones internacionales en proyectos de desarrollo' if lang == 'es' else 'has worked with international organizations on development projects'}."
        context_used.append('international')
    
    # Docencia/Facilitación
    elif any(w in q for w in ['docen', 'teaching', 'facilita', 'educat', 'profesor', 'instructor', 'university', 'universidad']):
        teach_exp = [e for e in experience if any(w in e.get('company', '').lower() for w in ['unellez', 'ubv', 'universidad', 'university'])]
        if teach_exp:
            exp = teach_exp[0]
            company = exp.get('company', '')
            role_key = 'role_es' if lang == 'es' else 'role_en'
            role = exp.get(role_key, '')
            period = exp.get('period', '')
            resp_key = 'responsibilities_es' if lang == 'es' else 'responsibilities_en'
            resp = exp.get(resp_key, [])
            answer = f"{company} - {role} ({period}): {'; '.join(resp)}. {'Esta experiencia desarrolló habilidades de comunicación, adaptabilidad y capacidad para explicar conceptos complejos de forma accesible.' if lang == 'es' else 'This experience developed communication skills, adaptability and ability to explain complex concepts accessibly.'}"
        else:
            answer = f"Mirel {'tiene experiencia en facilitación y docencia universitaria' if lang == 'es' else 'has experience in facilitation and university teaching'}."
        context_used.append('teaching')
    
    # Transición a tecnología / Por qué tech
    elif any(w in q for w in ['transici', 'transition', 'cambio', 'change', 'migra', 'por que tech', 'why tech', 'por qué', 'tecnolog', 'software']):
        answer = f"{'La transición de Mirel hacia el desarrollo de software es una evolución natural de su trayectoria' if lang == 'es' else 'Mirel\\'s transition to software development is a natural evolution of her trajectory'}:\n\n"
        answer += f"{'• Siempre ha usado tecnología: Python, R y SIG para análisis de datos ambientales, modelado económico e investigación científica' if lang == 'es' else '• Has always used technology: Python, R and GIS for environmental data analysis, economic modeling and scientific research'}\n"
        answer += f"{'• Gestionó bases de datos climáticas y redes meteorológicas, requiriendo automatización y procesamiento de grandes volúmenes de datos' if lang == 'es' else '• Managed climate databases and meteorological networks, requiring automation and large-scale data processing'}\n"
        answer += f"{'• Coordinó proyectos complejos con múltiples stakeholders, equipos multidisciplinarios y objetivos técnicos' if lang == 'es' else '• Coordinated complex projects with multiple stakeholders, multidisciplinary teams and technical objectives'}\n"
        answer += f"{'• Experiencia en análisis, diseño de soluciones y documentación técnica' if lang == 'es' else '• Experience in analysis, solution design and technical documentation'}\n\n"
        answer += f"{'Su formación actual en 42 École y certificaciones Salesforce formalizan habilidades que ya aplicaba, ahora enfocadas en CRM, ERP y desarrollo web. Este background único aporta: pensamiento sistémico, capacidad analítica, experiencia en proyectos de impacto y comprensión de necesidades empresariales reales.' if lang == 'es' else 'Her current training at 42 École and Salesforce certifications formalize skills she was already applying, now focused on CRM, ERP and web development. This unique background contributes: systems thinking, analytical capacity, impact project experience and understanding of real business needs.'}"
        context_used.append('transition')
    
    # Experiencia laboral (detallada)
    elif any(w in q for w in ['experiencia', 'experience', 'trabajo', 'work', 'trabaj', 'compañ', 'company', 'empresa', 'trayectoria', 'carrera', 'career', 'background']):
        if experience:
            # Construir respuesta detallada con todas las experiencias
            answer = f"Mirel {'tiene más de 20 años de experiencia profesional combinando tecnología, sostenibilidad y gestión de proyectos' if lang == 'es' else 'has over 20 years of professional experience combining technology, sustainability and project management'}:\n\n"
            
            for i, exp in enumerate(experience, 1):
                company = exp.get('company', '')
                role_key = 'role_es' if lang == 'es' else 'role_en'
                role = exp.get(role_key, '')
                period = exp.get('period', '')
                location = exp.get('location', '')
                resp_key = 'responsibilities_es' if lang == 'es' else 'responsibilities_en'
                responsibilities = exp.get(resp_key, [])
                
                answer += f"{i}. {company} - {role} ({period}, {location})\n"
                if responsibilities:
                    answer += "   " + ("Responsabilidades: " if lang == 'es' else "Responsibilities: ")
                    answer += responsibilities[0] if len(responsibilities) == 1 else ("; ".join(responsibilities[:2]) + ("..." if len(responsibilities) > 2 else ""))
                    answer += "\n\n"
            
            # Añadir contexto de transición
            answer += f"\n{'Esta diversa experiencia en proyectos internacionales, análisis de datos ambientales, coordinación de equipos y uso de herramientas tecnológicas (SIG, Python, R) proporciona una base sólida para su transición al desarrollo de software y soluciones CRM.' if lang == 'es' else 'This diverse experience in international projects, environmental data analysis, team coordination and use of technological tools (GIS, Python, R) provides a solid foundation for her transition to software development and CRM solutions.'}"
        else:
            answer = "Información de experiencia no disponible." if lang == 'es' else "Experience information not available."
        context_used.append('experience')
    
    # Habilidades blandas (soft skills)
    elif any(w in q for w in ['blanda', 'soft', 'social', 'liderazgo', 'leadership', 'comunicación', 'communication', 'interpersonal', 'equipo', 'team']):
        if skills_soft:
            answer = f"Mirel {'posee las siguientes habilidades blandas' if lang == 'es' else 'possesses the following soft skills'}: {', '.join(skills_soft)}."
        else:
            answer = "Información de habilidades blandas no disponible." if lang == 'es' else "Soft skills information not available."
        context_used.append('soft_skills')
    
    # Habilidades/Skills (todas)
    elif any(w in q for w in ['habilidad', 'skill', 'tecnolog', 'technology', 'sabe', 'know', 'herramienta', 'tool', 'capac']):
        top_tech = skills_tech[:5]
        top_soft = skills_soft[:3]
        answer = f"Mirel {'tiene habilidades técnicas' if lang == 'es' else 'has technical skills'}: {', '.join(top_tech)}; {'y habilidades blandas' if lang == 'es' else 'and soft skills'}: {', '.join(top_soft)}."
        context_used.append('skills')
    
    # Proyectos
    elif any(w in q for w in ['proyecto', 'project', 'portfolio', 'portafolio']):
        github = personal_info.get('links', {}).get('github', 'GitHub')
        companies = [e.get('company', '') for e in experience[:2]]
        answer = f"Mirel {'ha trabajado en proyectos en' if lang == 'es' else 'has worked on projects at'}: {', '.join(companies)}. {'Proyectos disponibles en' if lang == 'es' else 'Projects available at'} {github}."
        context_used.append('projects')
    
    # Idiomas
    elif any(w in q for w in ['idioma', 'language', 'ingles', 'english', 'español', 'spanish', 'frances', 'french', 'habla', 'speak']):
        langs_info = personal_info.get('languages', {}).get(lang, {})
        langs_text = ', '.join([f"{k} ({v})" for k, v in langs_info.items()])
        answer = f"Mirel {'habla' if lang == 'es' else 'speaks'}: {langs_text}."
        context_used.append('languages')
    
    # Ubicación
    elif any(w in q for w in ['ubicacion', 'location', 'donde', 'where', 'vive', 'live', 'ciudad', 'city', 'pais']):
        loc = personal_info.get('location', {})
        city, region, country = loc.get('city', ''), loc.get('region', ''), loc.get('country', '')
        nationalities = personal_info.get('nationalities', [])
        answer = f"Mirel {'reside en' if lang == 'es' else 'resides in'} {city}, {region}, {country}. {nationalities[0] if nationalities else ''}."
        context_used.append('location')
    
    # Contacto
    elif any(w in q for w in ['contacto', 'contact', 'linkedin', 'github', 'email', 'correo']):
        email = personal_info.get('email', '')
        links = personal_info.get('links', {})
        linkedin, github = links.get('linkedin', ''), links.get('github', '')
        answer = f"{'Contacto' if lang == 'es' else 'Contact'}: {email}"
        if linkedin:
            answer += f", LinkedIn: {linkedin}"
        if github:
            answer += f", GitHub: {github}"
        answer += "."
        context_used.append('contact')
    
    # Quién es (general)
    elif any(w in q for w in ['quien', 'who', 'eres', 'are you', 'sobre', 'about', 'cuentame', 'tell me', 'perfil', 'profile']):
        summary = ' '.join(summary_lines[:3]) if len(summary_lines) >= 3 else ' '.join(summary_lines)
        companies_count = len(experience)
        sectors = []
        if any('Kernet' in e.get('company', '') for e in experience):
            sectors.append('tech/ERP')
        if any('USFS' in e.get('company', '') or 'USAID' in e.get('company', '') or 'INTEC' in e.get('company', '') for e in experience):
            sectors.append(('proyectos internacionales' if lang == 'es' else 'international projects'))
        if any('UNELLEZ' in e.get('company', '') or 'UBV' in e.get('company', '') for e in experience):
            sectors.append(('educación' if lang == 'es' else 'education'))
        
        answer = f"{summary}\n\n"
        answer += f"{'Con experiencia en' if lang == 'es' else 'With experience in'} {companies_count} {'organizaciones en sectores como' if lang == 'es' else 'organizations across sectors including'}: {', '.join(sectors)}. "
        answer += f"{'Su trayectoria única combina análisis de datos, gestión de proyectos complejos, coordinación internacional y habilidades técnicas (Python, R, SIG, Salesforce, Odoo), aportando una perspectiva multidisciplinaria valiosa para equipos de tecnología.' if lang == 'es' else 'Her unique trajectory combines data analysis, complex project management, international coordination and technical skills (Python, R, GIS, Salesforce, Odoo), bringing valuable multidisciplinary perspective to technology teams.'}"
        context_used.append('summary')
    
    # Respuesta por defecto
    else:
        summary = summary_lines[0] if summary_lines else ("Profesional versátil con +20 años de experiencia" if lang == 'es' else "Versatile professional with 20+ years of experience")
        top_tech = ', '.join(skills_tech[:4])
        top_soft = ', '.join(skills_soft[:2]) if skills_soft else ""
        answer = f"{summary}. {'Habilidades técnicas' if lang == 'es' else 'Technical skills'}: {top_tech}."
        if top_soft:
            answer += f" {'Habilidades blandas' if lang == 'es' else 'Soft skills'}: {top_soft}."
        answer += f"\n\n{'Pregúntame sobre: experiencia internacional, proyectos ambientales, certificaciones Salesforce, habilidades en Odoo/Python/SIG, o cómo mi background aporta valor al desarrollo de software.' if lang == 'es' else 'Ask me about: international experience, environmental projects, Salesforce certifications, Odoo/Python/GIS skills, or how my background adds value to software development.'}"
        context_used.append('general')
    
    return {
        "question": question,
        "answer": answer,
        "respuesta": answer,
        "context_used": context_used,
        "language_detected": lang
    }


