import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Multi-agent supervisor pattern.
 *
 * This is the reusable skeleton for every Finnovo idea: a supervisor routes
 * a user query to one of N specialist agents, which each produce a partial
 * answer, and a critic approves or rejects before the final response.
 *
 * Swap specialists in the `specialists` map to retool for a new idea in
 * minutes. The state shape (`State`) and the graph wiring stay the same.
 */

export const State = Annotation.Root({
  input: Annotation<string>(),
  plan: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  findings: Annotation<Record<string, string>>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),
  critique: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  output: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  trace: Annotation<
    Array<{ agent: string; at: number; summary: string; kind: "in" | "out" }>
  >({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
});

type AppState = typeof State.State;

/**
 * Lazy model factories — building these at module load fails during `next build`
 * when the API key isn't injected. Always call `getSmart()` / `getStrong()` from
 * inside a request handler.
 */
let _smart: ChatAnthropic | null = null;
let _strong: ChatAnthropic | null = null;

function getSmart(): ChatAnthropic {
  if (!_smart) _smart = new ChatAnthropic({ model: "claude-sonnet-4-6", temperature: 0.2 });
  return _smart;
}

function getStrong(): ChatAnthropic {
  if (!_strong) _strong = new ChatAnthropic({ model: "claude-opus-4-6", temperature: 0.1 });
  return _strong;
}

/** A specialist agent is just an async function that reads state and returns a partial state patch. */
export type Specialist = (state: AppState) => Promise<Partial<AppState>>;

/** Example specialists — replace these with domain-specific ones tomorrow. */
export const exampleSpecialists: Record<string, Specialist> = {
  fundamentals: async (s) => ({
    findings: {
      fundamentals: `[Fundamentals] Stub response for: ${s.input}. Replace with BVMT / filings RAG.`,
    },
    trace: [
      {
        agent: "fundamentals",
        at: Date.now(),
        summary: "Analyzed fundamentals (stub)",
        kind: "out",
      },
    ],
  }),
  news: async (s) => ({
    findings: {
      news: `[News] Stub response for: ${s.input}. Replace with Tunisian press RAG.`,
    },
    trace: [
      {
        agent: "news",
        at: Date.now(),
        summary: "Summarized relevant news (stub)",
        kind: "out",
      },
    ],
  }),
  risk: async (s) => ({
    findings: {
      risk: `[Risk] Stub response for: ${s.input}. Replace with Monte Carlo / VaR.`,
    },
    trace: [
      {
        agent: "risk",
        at: Date.now(),
        summary: "Computed risk exposure (stub)",
        kind: "out",
      },
    ],
  }),
};

/** Supervisor: produces a plan (ordered list of specialists to call). */
export const supervisor: Specialist = async (s) => {
  const sys = new SystemMessage(
    `You are the supervisor agent. Pick the specialists that should answer the user's question.
Available specialists: ${Object.keys(exampleSpecialists).join(", ")}.
Reply with a JSON array of specialist names, nothing else.`,
  );
  const user = new HumanMessage(s.input);
  const res = await getSmart().invoke([sys, user]);
  const text = typeof res.content === "string" ? res.content : String(res.content);
  let plan: string[];
  try {
    plan = JSON.parse(text);
  } catch {
    plan = Object.keys(exampleSpecialists);
  }
  return {
    plan,
    trace: [
      {
        agent: "supervisor",
        at: Date.now(),
        summary: `Plan: ${plan.join(" → ")}`,
        kind: "out",
      },
    ],
  };
};

/** Critic: reviews combined findings, flags hallucinations, forces a rerun if needed. */
export const critic: Specialist = async (s) => {
  const sys = new SystemMessage(
    `You are a strict critic. Review the specialist findings. Are they consistent, grounded, and free of hallucination?
Reply with JSON: {"ok": boolean, "critique": string}. If anything feels invented, set ok to false.`,
  );
  const user = new HumanMessage(
    `User asked: ${s.input}\n\nFindings:\n${JSON.stringify(s.findings, null, 2)}`,
  );
  const res = await getStrong().invoke([sys, user]);
  const text = typeof res.content === "string" ? res.content : String(res.content);
  try {
    const parsed = JSON.parse(text);
    return {
      critique: parsed.ok ? null : parsed.critique,
      trace: [
        {
          agent: "critic",
          at: Date.now(),
          summary: parsed.ok ? "Approved" : `Rejected: ${parsed.critique}`,
          kind: "out",
        },
      ],
    };
  } catch {
    return {
      critique: null,
      trace: [
        {
          agent: "critic",
          at: Date.now(),
          summary: "Approved (parse fallback)",
          kind: "out",
        },
      ],
    };
  }
};

/** Composer: combines findings into a final user-facing answer. */
export const composer: Specialist = async (s) => {
  const sys = new SystemMessage(
    `You are the response composer. Merge the specialist findings into one clear, grounded answer for the user.
Cite which specialist contributed which claim in brackets, e.g. [fundamentals]. Keep it tight.`,
  );
  const user = new HumanMessage(
    `User asked: ${s.input}\n\nFindings:\n${JSON.stringify(s.findings, null, 2)}`,
  );
  const res = await getSmart().invoke([sys, user]);
  const text = typeof res.content === "string" ? res.content : String(res.content);
  return {
    output: text,
    trace: [
      {
        agent: "composer",
        at: Date.now(),
        summary: "Composed final answer",
        kind: "out",
      },
    ],
  };
};

/** Build the LangGraph graph. */
export function buildGraph(specialists: Record<string, Specialist> = exampleSpecialists) {
  const graph = new StateGraph(State)
    .addNode("supervisor", supervisor)
    .addNode("fanout", async (state) => {
      // Run all planned specialists in parallel.
      const picked = state.plan.filter((name) => name in specialists);
      const results = await Promise.all(
        picked.map((name) =>
          specialists[name](state).catch(
            (err): Partial<AppState> => ({
              findings: { [name]: `[error] ${String(err)}` },
            }),
          ),
        ),
      );
      // Merge partial states.
      const merged: Partial<AppState> = { findings: {}, trace: [] };
      for (const patch of results) {
        merged.findings = { ...merged.findings, ...(patch.findings ?? {}) };
        merged.trace = [...(merged.trace ?? []), ...(patch.trace ?? [])];
      }
      return merged;
    })
    .addNode("critic", critic)
    .addNode("composer", composer);

  graph.addEdge(START, "supervisor");
  graph.addEdge("supervisor", "fanout");
  graph.addEdge("fanout", "critic");
  graph.addConditionalEdges("critic", (s) => (s.critique ? "fanout" : "composer"));
  graph.addEdge("composer", END);

  return graph.compile();
}

export type AgentGraph = ReturnType<typeof buildGraph>;
