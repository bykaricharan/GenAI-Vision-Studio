import time
import logging
from typing import Dict, Any, List, Optional, TypedDict
from app.core.config import settings, require_openai_api_key
from app.services.supabase_service import supabase_service
from app.services.langsmith_service import langsmith_service

logger = logging.getLogger("genai_vision.multi_agent")


class MultiAgentState(TypedDict):
    topic: str
    task_plan: str
    research_notes: str
    writer_output: str
    review_feedback: str
    final_response: str
    agent_outputs: List[Dict[str, Any]]
    completed_agents: List[str]
    error: Optional[str]


def coordinator_agent_node(state: MultiAgentState) -> MultiAgentState:
    logger.info("Coordinator Agent Started: Analyzing user task & assigning agent responsibilities.")
    start = time.time()
    api_key = require_openai_api_key()

    topic = state.get("topic", "Generative AI Agent Architecture")

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.2, openai_api_key=api_key)

    prompt_tmpl = PromptTemplate.from_template(
        "You are the Coordinator Agent in a Multi-Agent System.\n"
        "User Topic / Objective: {topic}\n\n"
        "Formulate a structured execution plan for Research, Writer, and Reviewer agents.\n"
        "Specify: (1) Research focus areas, (2) Target document structure, (3) Quality review criteria."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"topic": topic})
    plan_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    tokens = len(topic.split()) + len(plan_text.split()) * 2
    cost = round(tokens * 0.000005, 6)

    logger.info(f"Coordinator Agent Completed ({duration_ms} ms).")

    state["task_plan"] = plan_text
    state["completed_agents"].append("Coordinator Agent")
    state["agent_outputs"].append({
        "agent": "Coordinator Agent",
        "role": "Task Decomposition & Work Allocation",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "tokens_used": tokens,
        "cost_estimate": cost,
        "model": "gpt-4o",
        "status": "completed",
        "input": topic,
        "output": plan_text,
        "what_it_does": "Analyzes the user objective, breaks the task into subtasks, and assigns roles.",
        "why_required": "Ensures structured delegation and clear focus before execution.",
        "technology": "LangGraph StateGraph + ChatOpenAI gpt-4o"
    })
    return state


def research_agent_node(state: MultiAgentState) -> MultiAgentState:
    if state.get("error"):
        return state

    logger.info("Research Agent Started: Querying vector stores & gathering technical facts.")
    start = time.time()
    api_key = require_openai_api_key()

    topic = state["topic"]
    plan = state["task_plan"]

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.2, openai_api_key=api_key)

    prompt_tmpl = PromptTemplate.from_template(
        "You are the Research Agent. Follow the Coordinator Plan to gather facts and evidence.\n"
        "Topic: {topic}\n"
        "Coordinator Plan:\n{plan}\n\n"
        "Output structured research notes with key factual bullet points, technical definitions, and core architectural components."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"topic": topic, "plan": plan})
    notes_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    tokens = len(plan.split()) + len(notes_text.split()) * 2
    cost = round(tokens * 0.000005, 6)

    logger.info(f"Research Agent Completed ({duration_ms} ms).")

    state["research_notes"] = notes_text
    state["completed_agents"].append("Research Agent")
    state["agent_outputs"].append({
        "agent": "Research Agent",
        "role": "Fact Extraction & Knowledge Gathering",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "tokens_used": tokens,
        "cost_estimate": cost,
        "model": "gpt-4o",
        "status": "completed",
        "input": f"Topic: {topic}\nPlan: {plan[:80]}...",
        "output": notes_text,
        "what_it_does": "Gathers relevant background information and compiles structured factual research notes.",
        "why_required": "Grounds the multi-agent system in factual knowledge.",
        "technology": "LangGraph StateGraph + ChromaDB + ChatOpenAI gpt-4o"
    })
    return state


def writer_agent_node(state: MultiAgentState) -> MultiAgentState:
    if state.get("error"):
        return state

    logger.info("Writer Agent Started: Synthesizing research notes into structured document draft.")
    start = time.time()
    api_key = require_openai_api_key()

    topic = state["topic"]
    notes = state["research_notes"]

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.3, openai_api_key=api_key)

    prompt_tmpl = PromptTemplate.from_template(
        "You are the Writer Agent. Synthesize the research notes into a clear, publication-ready technical document draft.\n"
        "Topic: {topic}\n\n"
        "Research Notes:\n{notes}\n\n"
        "Format with Title, Executive Summary, Technical Architecture Details, and Key Takeaways."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"topic": topic, "notes": notes})
    draft_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    tokens = len(notes.split()) + len(draft_text.split()) * 2
    cost = round(tokens * 0.000005, 6)

    logger.info(f"Writer Agent Completed ({duration_ms} ms).")

    state["writer_output"] = draft_text
    state["completed_agents"].append("Writer Agent")
    state["agent_outputs"].append({
        "agent": "Writer Agent",
        "role": "Content Synthesis & Technical Drafting",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "tokens_used": tokens,
        "cost_estimate": cost,
        "model": "gpt-4o",
        "status": "completed",
        "input": notes[:100] + "...",
        "output": draft_text,
        "what_it_does": "Transforms raw research notes into a structured, readable technical document draft.",
        "why_required": "Converts fragmented facts into coherent human-readable prose.",
        "technology": "LangGraph StateGraph + ChatOpenAI gpt-4o"
    })
    return state


def reviewer_agent_node(state: MultiAgentState) -> MultiAgentState:
    if state.get("error"):
        return state

    logger.info("Reviewer Agent Started: Auditing draft report for accuracy, structure, and tone.")
    start = time.time()
    api_key = require_openai_api_key()

    draft = state["writer_output"]
    topic = state["topic"]

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.1, openai_api_key=api_key)

    prompt_tmpl = PromptTemplate.from_template(
        "You are the Reviewer Agent. Critique and audit the writer's draft report for factual accuracy, completeness, and edge cases.\n"
        "Topic: {topic}\n\n"
        "Writer Draft Report:\n{draft}\n\n"
        "Provide: (1) Accuracy Audit Score (0-100%), (2) Specific Critique & Enhancements, (3) Approval Verdict."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"topic": topic, "draft": draft})
    review_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    tokens = len(draft.split()) + len(review_text.split()) * 2
    cost = round(tokens * 0.000005, 6)

    logger.info(f"Reviewer Agent Completed ({duration_ms} ms).")

    state["review_feedback"] = review_text
    state["completed_agents"].append("Reviewer Agent")
    state["agent_outputs"].append({
        "agent": "Reviewer Agent",
        "role": "Quality Audit & Verification",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "tokens_used": tokens,
        "cost_estimate": cost,
        "model": "gpt-4o",
        "status": "completed",
        "input": draft[:100] + "...",
        "output": review_text,
        "what_it_does": "Critiques draft quality, audits factual precision, and suggests concrete refinements.",
        "why_required": "Guarantees error reduction, safety adherence, and multi-perspective verification.",
        "technology": "LangGraph Reflection Loop + ChatOpenAI gpt-4o"
    })
    return state


def final_response_agent_node(state: MultiAgentState) -> MultiAgentState:
    if state.get("error"):
        return state

    logger.info("Final Response Agent Generated: Merging approved draft and reviewer feedback.")
    start = time.time()
    api_key = require_openai_api_key()

    draft = state["writer_output"]
    feedback = state["review_feedback"]
    topic = state["topic"]

    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate

    llm = ChatOpenAI(model="gpt-4o", temperature=0.2, openai_api_key=api_key)

    prompt_tmpl = PromptTemplate.from_template(
        "You are the Final Response Agent. Combine the writer draft with reviewer feedback to produce the final polished answer.\n"
        "Topic: {topic}\n\n"
        "Writer Draft:\n{draft}\n\n"
        "Reviewer Feedback:\n{feedback}\n\n"
        "Produce the final, impeccably formatted technical report."
    )

    chain = prompt_tmpl | llm
    res = chain.invoke({"topic": topic, "draft": draft, "feedback": feedback})
    final_text = res.content.strip()

    duration_ms = int((time.time() - start) * 1000)
    tokens = len(draft.split()) + len(feedback.split()) + len(final_text.split()) * 2
    cost = round(tokens * 0.000005, 6)

    logger.info(f"Final Response Agent Completed ({duration_ms} ms).")

    state["final_response"] = final_text
    state["completed_agents"].append("Final Response Agent")
    state["agent_outputs"].append({
        "agent": "Final Response Agent",
        "role": "Polished Output Synthesis",
        "start_time": time.strftime("%H:%M:%S", time.localtime(start)),
        "duration_ms": duration_ms,
        "tokens_used": tokens,
        "cost_estimate": cost,
        "model": "gpt-4o",
        "status": "completed",
        "input": f"Draft & Feedback for: {topic}",
        "output": final_text,
        "what_it_does": "Merges approved draft and reviewer refinements into a single polished response.",
        "why_required": "Delivers the final verified multi-agent result to the user.",
        "technology": "LangGraph Output State + ChatOpenAI gpt-4o"
    })
    return state


class MultiAgentService:
    def __init__(self):
        from langgraph.graph import StateGraph, START, END

        builder = StateGraph(MultiAgentState)
        builder.add_node("Coordinator Agent", coordinator_agent_node)
        builder.add_node("Research Agent", research_agent_node)
        builder.add_node("Writer Agent", writer_agent_node)
        builder.add_node("Reviewer Agent", reviewer_agent_node)
        builder.add_node("Final Response Agent", final_response_agent_node)

        builder.add_edge(START, "Coordinator Agent")
        builder.add_edge("Coordinator Agent", "Research Agent")
        builder.add_edge("Research Agent", "Writer Agent")
        builder.add_edge("Writer Agent", "Reviewer Agent")
        builder.add_edge("Reviewer Agent", "Final Response Agent")
        builder.add_edge("Final Response Agent", END)

        self.graph = builder.compile()

    def run_multi_agent_simulation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a production LangGraph Multi-Agent graph (Coordinator -> Research -> Writer -> Reviewer -> Final Response).
        """
        logger.info("Multi-Agent collaboration started: executing LangGraph StateGraph.")
        start_total = time.time()

        topic = payload.get("topic", payload.get("user_input", "Generative AI Agent Architecture")).strip()

        initial_state: MultiAgentState = {
            "topic": topic,
            "task_plan": "",
            "research_notes": "",
            "writer_output": "",
            "review_feedback": "",
            "final_response": "",
            "agent_outputs": [],
            "completed_agents": [],
            "error": None
        }

        try:
            final_state = self.graph.invoke(initial_state)
            total_duration_ms = int((time.time() - start_total) * 1000)

            if final_state.get("error"):
                logger.error(f"Multi-Agent collaboration halted due to error: {final_state['error']}")
                return {
                    "status": "failed",
                    "topic": topic,
                    "execution_state": "FAILED",
                    "error": final_state["error"],
                    "agent_steps": final_state.get("agent_outputs", []),
                    "final_report": f"Multi-Agent execution failed: {final_state['error']}"
                }

            logger.info("Multi-Agent collaboration completed successfully.")

            total_tokens = sum(ag.get("tokens_used", 0) for ag in final_state["agent_outputs"])
            total_cost = round(sum(ag.get("cost_estimate", 0) for ag in final_state["agent_outputs"]), 6)

            metrics = {
                "total_runtime_ms": total_duration_ms,
                "total_tokens": total_tokens,
                "total_cost": total_cost,
                "completed_agents": len(final_state["completed_agents"]),
                "total_agents": 5
            }

            # Build Shared Memory State
            shared_state = {
                "topic": topic,
                "task_plan": final_state.get("task_plan", ""),
                "research_notes": final_state.get("research_notes", ""),
                "writer_output": final_state.get("writer_output", ""),
                "review_feedback": final_state.get("review_feedback", ""),
                "final_response": final_state.get("final_response", "")
            }

            # Build Inter-Agent Communications Chat/Message Cards
            communications = [
                {
                    "from_agent": "Coordinator Agent",
                    "to_agent": "Research Agent",
                    "timestamp": final_state["agent_outputs"][0]["start_time"] if len(final_state["agent_outputs"]) > 0 else "00:00:00",
                    "message": f"Formulated execution plan: {final_state.get('task_plan', '')[:120]}...",
                    "type": "delegation"
                },
                {
                    "from_agent": "Research Agent",
                    "to_agent": "Writer Agent",
                    "timestamp": final_state["agent_outputs"][1]["start_time"] if len(final_state["agent_outputs"]) > 1 else "00:00:00",
                    "message": f"Compiled research notes & factual evidence: {final_state.get('research_notes', '')[:120]}...",
                    "type": "data_transfer"
                },
                {
                    "from_agent": "Writer Agent",
                    "to_agent": "Reviewer Agent",
                    "timestamp": final_state["agent_outputs"][2]["start_time"] if len(final_state["agent_outputs"]) > 2 else "00:00:00",
                    "message": f"Submitted initial draft report for quality audit: {final_state.get('writer_output', '')[:120]}...",
                    "type": "draft_submission"
                },
                {
                    "from_agent": "Reviewer Agent",
                    "to_agent": "Final Response Agent",
                    "timestamp": final_state["agent_outputs"][3]["start_time"] if len(final_state["agent_outputs"]) > 3 else "00:00:00",
                    "message": f"Completed quality critique & verification: {final_state.get('review_feedback', '')[:120]}...",
                    "type": "quality_audit"
                },
                {
                    "from_agent": "Final Response Agent",
                    "to_agent": "User / System Output",
                    "timestamp": final_state["agent_outputs"][4]["start_time"] if len(final_state["agent_outputs"]) > 4 else "00:00:00",
                    "message": "Final polished technical report ready for user presentation.",
                    "type": "final_delivery"
                }
            ]

            # Build Execution Timeline
            timeline = [
                {
                    "time": ag.get("start_time", "00:00:00"),
                    "agent": ag.get("agent", "Agent"),
                    "event": f"{ag.get('agent')} finished execution in {ag.get('duration_ms')} ms.",
                    "status": "completed"
                }
                for ag in final_state["agent_outputs"]
            ]

            # Persist session state in Supabase agent_sessions
            supabase_service.record_agent_session(
                session_name=f"Multi-Agent: {topic[:30]}",
                completed_agents=len(final_state["completed_agents"]),
                total_agents=5
            )

            # Log trace in LangSmith
            trace_rec = langsmith_service.log_trace(
                workflow=f"LangGraph Multi-Agent ({topic[:20]})",
                duration_ms=total_duration_ms,
                tokens=total_tokens,
                cost=total_cost
            )

            langsmith_trace = {
                "trace_id": trace_rec["trace_id"],
                "run_id": trace_rec["run_id"],
                "duration_ms": total_duration_ms,
                "status": "success",
                "is_configured": langsmith_service.is_configured
            }

            return {
                "status": "success",
                "topic": topic,
                "execution_state": "COMPLETED",
                "final_report": final_state["final_response"],
                "agent_steps": final_state["agent_outputs"],
                "shared_state": shared_state,
                "communications": communications,
                "timeline": timeline,
                "metrics": metrics,
                "langsmith_trace": langsmith_trace
            }

        except Exception as err:
            logger.exception(f"Unhandled exception during Multi-Agent execution: {err}")
            return {
                "status": "failed",
                "topic": topic,
                "execution_state": "FAILED",
                "error": str(err),
                "agent_steps": [],
                "final_report": f"Multi-Agent exception: {err}"
            }


multi_agent_service = MultiAgentService()
