"""
BRDGen — Stage 9: LangChain ReAct Agent
Wraps the full pipeline as callable tools so Gemini/OpenAI can reason about
which step to invoke — enabling natural language editing of the BRD.

Tools:
  extract_requirements  — classify raw text and return requirements
  search_requirements   — semantic search via ChromaDB
  get_citation          — return full source trail for a requirement ID
  detect_conflicts      — run conflict detection on requirements list
  edit_section          — regenerate one BRD section with new instructions
  generate_brd          — run the full generator
"""
import os
import json


class BRDAgent:
    """
    Thin LangChain ReAct agent wrapper.
    On import failure, falls back to direct tool calls.
    """

    def __init__(self, requirements=None, conflicts=None, graph=None,
                 brd_sections=None, project_name="Project"):
        self.requirements = requirements or []
        self.conflicts = conflicts or []
        self.graph = graph or {"nodes": [], "links": []}
        self.brd_sections = brd_sections or {}
        self.project_name = project_name
        self._agent = None

        self._try_init_langchain()

    def _try_init_langchain(self):
        try:
            from langchain.agents import AgentExecutor, create_react_agent
            from langchain_core.prompts import PromptTemplate
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.tools import Tool

            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=os.getenv("GEMINI_API_KEY", "AIzaSyCFMQP-zGDhb78pDrOXfg_mS92Zb_JTb9I"),
                temperature=0.3
            )

            tools = [
                Tool(
                    name="search_requirements",
                    func=self.tool_search_requirements,
                    description="Search the requirement database using natural language. Input: a question or keyword."
                ),
                Tool(
                    name="get_citation",
                    func=self.tool_get_citation,
                    description="Get the full source trail for a requirement. Input: requirement ID like REQ-001."
                ),
                Tool(
                    name="detect_conflicts",
                    func=self.tool_detect_conflicts,
                    description="Rerun conflict detection. Input: 'all' to check all requirements."
                ),
                Tool(
                    name="edit_section",
                    func=self.tool_edit_section,
                    description="Regenerate a specific BRD section. Input: 'SectionName: instruction' e.g. 'Timeline: Make more conservative'"
                ),
            ]

            template = """You are a BRD Intelligence Agent helping to analyze and edit a Business Requirements Document.

You have access to the following tools:
{tools}

Use the following format:
Question: the input question you must answer
Thought: what do you need to think about
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!
Question: {input}
Thought: {agent_scratchpad}"""

            prompt = PromptTemplate.from_template(template)

            agent = create_react_agent(llm, tools, prompt)
            self._agent = AgentExecutor(agent=agent, tools=tools, verbose=False, max_iterations=5)
            print("   ✅ LangChain ReAct Agent initialized.")

        except ImportError as e:
            print(f"   ⚠️ LangChain not available ({e}). Agent in direct-call mode.")
        except Exception as e:
            print(f"   ⚠️ Agent init failed: {e}. Using direct tool calls.")

    # ── Tools ─────────────────────────────────────────────────────────────────

    def tool_search_requirements(self, query: str) -> str:
        """Search ChromaDB for requirements matching the query."""
        try:
            import chromadb
            client = chromadb.PersistentClient(path="./data/chromadb/")
            collection = client.get_or_create_collection("requirements")
            results = collection.query(query_texts=[query], n_results=5)
            docs = results.get('documents', [[]])[0]
            ids = results.get('ids', [[]])[0]
            return json.dumps([{"id": i, "text": d} for i, d in zip(ids, docs)])
        except Exception as e:
            # Fallback: keyword match from memory
            matches = [
                r for r in self.requirements
                if any(w.lower() in r.get('canonical_text', '').lower() for w in query.split())
            ]
            return json.dumps([{"id": r['id'], "text": r['canonical_text']} for r in matches[:5]])

    def tool_get_citation(self, req_id: str) -> str:
        """Return full citation trail for a requirement ID."""
        from pipeline.graph import get_citation_trail
        citations = get_citation_trail(self.graph, req_id.strip())
        if not citations:
            # Check requirements directly
            for req in self.requirements:
                if req.get('id') == req_id.strip():
                    return json.dumps(req.get('sources', []))
        return json.dumps(citations)

    def tool_detect_conflicts(self, _: str = 'all') -> str:
        """Rerun conflict detection and return results."""
        from pipeline.conflict import detect_conflicts
        new_conflicts = detect_conflicts(self.requirements)
        self.conflicts = new_conflicts
        return f"Detected {len(new_conflicts)} conflicts: " + json.dumps([c['topic'] for c in new_conflicts[:5]])

    def tool_edit_section(self, instruction: str) -> str:
        """
        Regenerate a specific BRD section with a modification instruction.
        Input format: "SectionName: instruction"
        """
        from pipeline.generator import _generate_section_gemini, _build_req_block, _build_stakeholder_block, _build_conflict_block
        import google.generativeai as genai_mod

        if ':' not in instruction:
            return "Error: Use format 'SectionName: instruction'"

        section, user_instr = instruction.split(':', 1)
        section = section.strip()
        user_instr = user_instr.strip()

        if section not in self.brd_sections:
            available = list(self.brd_sections.keys())
            return f"Section '{section}' not found. Available: {available}"

        try:
            key = os.getenv("GEMINI_API_KEY", "AIzaSyCFMQP-zGDhb78pDrOXfg_mS92Zb_JTb9I")
            genai_mod.configure(api_key=key)
            model = genai_mod.GenerativeModel("gemini-2.0-flash")

            existing = self.brd_sections.get(section, '')
            prompt = f"""You are editing a BRD section. The user wants you to: "{user_instr}"

CURRENT SECTION TEXT:
{existing}

ADDITIONAL CONTEXT — Requirements:
{_build_req_block(self.requirements, 15)}

Rewrite the section applying the user's instruction. Keep all REQ-ID citations.
Output ONLY the revised section text."""

            response = model.generate_content(prompt)
            new_text = response.text.strip()
            self.brd_sections[section] = new_text
            return f"Section '{section}' updated ({len(new_text)} chars)."
        except Exception as e:
            return f"Edit failed: {e}"

    # ── Public API ────────────────────────────────────────────────────────────

    def run(self, instruction: str) -> str:
        """Process a natural language instruction through the ReAct agent."""
        if self._agent:
            try:
                result = self._agent.invoke({"input": instruction})
                return result.get('output', str(result))
            except Exception as e:
                return f"Agent error: {e}. Try using direct tool calls."
        else:
            # Fallback: direct tool routing
            instruction_lower = instruction.lower()
            if 'search' in instruction_lower or 'find' in instruction_lower:
                return self.tool_search_requirements(instruction)
            elif 'citation' in instruction_lower or 'source' in instruction_lower:
                # Extract REQ-ID if present
                import re
                match = re.search(r'REQ-\d+', instruction.upper())
                return self.tool_get_citation(match.group(0) if match else 'REQ-001')
            elif 'conflict' in instruction_lower:
                return self.tool_detect_conflicts()
            elif 'edit' in instruction_lower or any(s.lower() in instruction_lower for s in self.brd_sections):
                return self.tool_edit_section(instruction)
            else:
                return f"Agent processed: {instruction}. Use 'search', 'citation for REQ-XXX', 'edit SectionName: instruction'."

    def get_updated_brd_sections(self) -> dict:
        return self.brd_sections

    def get_updated_conflicts(self) -> list:
        return self.conflicts
