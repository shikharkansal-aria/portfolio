// Single source of truth for all copy. Every figure traces to career-kb / TRACK-RECORD / fmt_general.
// Rendered at build time into index.html (desktop) and recruiter/index.html (plain page).

export const person = {
  name: 'Shikhar Kansal',
  positioning:
    'I find where work is slow or broken, ship the fix, and measure it. At Nurix AI that meant cutting voice-agent setup from 5 days to 30 minutes.',
  sub: 'Product & Growth Intern at Nurix AI (now NuPlay) · B.Tech, IIT Hyderabad, class of 2027',
  seeking: 'APM, Product Analyst, Product Associate and Growth roles',
  email: 'shikharkansal.sk@gmail.com',
  linkedin: 'https://www.linkedin.com/in/shikhar-kansal-a6b42028b',
  github: 'https://github.com/shikharkansal-aria',
  resume: '/Shikhar-Kansal-Resume.pdf',
  /** E.164 for tel: links; empty = no phone anywhere. Shikhar approved publishing it on 2026-10-01. */
  phone: '+916203042129',
  phoneDisplay: '+91 62030 42129',
};

export const about = [
  "I'm Shikhar, a final-year Materials Science & Metallurgical Engineering student at IIT Hyderabad. From January to July 2026 I worked as Product & Growth Intern at Nurix AI (now NuPlay), building voice and chat agents for enterprise client demos and prototypes. My client work continued through September 2026.",
  'I started by building single agents by hand. By the end I had written the internal tool my colleagues used to build the next ones. Along the way I learned to trust a number only after I had checked it myself.',
];

export const stats = [
  { value: '53', label: 'voice & chat bots delivered' },
  { value: '27', label: 'companies' },
  { value: '18', label: 'industries' },
  { value: '7', label: 'languages' },
];

export interface Metric { before: string; after: string; label: string }
export interface CaseStudy {
  id: string;
  title: string;
  icon: string; // short glyph shown on the folder
  context: string;
  metric: Metric;
  summary: string; // one line for the recruiter page + desktop icon tooltip
  problem: string[];
  did: string[];
  result: string[];
  learned: string;
  facts: { value: string; label: string }[];
  image?: { src: string; alt: string; w: number; h: number; caption: string };
}

export const cases: CaseStudy[] = [
  {
    id: 'agent-builder',
    title: 'Agent Builder',
    icon: 'AB',
    context: 'Nurix AI · internal platform · June to September 2026',
    metric: { before: '5 days', after: '30 min', label: 'to set up a client voice-agent crew' },
    summary:
      'An internal tool that turns a brand’s website and target workflow into a ready voice-agent crew. Setup dropped from 5 days to 30 minutes, and colleagues ran 7 later engagements on it.',
    problem: [
      'Each new client needed a crew of voice agents built by hand: prompts, tools, the handoffs between agents, a demo page. One crew took about 5 days, and I kept repeating the same steps for every brand.',
    ],
    did: [
      'I used crews that had already passed client demos as the model. The builder copies the structure of a shipped airline refund flow, so it starts from something that worked on real calls.',
      'I made the tool write an editable brief first. The operator corrects a one-page summary of the company, which is faster than proofreading thousands of words of generated prompt.',
      'I put 4 quality gates in front of the platform, including one that stages adversarial conversations and grades them. Nothing gets written until a crew passes. Speed only helps if the output is right, so the gates came before the speed work.',
      'A 4-agent crew hit the model’s output limit and failed after more than 240 seconds. I split the job: one short planning call, each agent written in parallel, and everything predictable built in plain code. It now finishes in 123 seconds with zero validation errors.',
    ],
    result: [
      'Setup went from 5 days to 30 minutes. Colleagues ran 7 later client engagements on the builder.',
    ],
    learned:
      'I judge an internal tool by adoption: do colleagues pick it up without me in the room? Seven engagements answered that better than any demo I could give.',
    facts: [
      { value: '5 d → 30 m', label: 'setup time' },
      { value: '4', label: 'quality gates' },
      { value: '240 s+ → 123 s', label: '4-agent crew, 0 errors' },
      { value: '7', label: 'later engagements' },
    ],
  },
  {
    id: 'outage',
    title: 'The demo that said “Live”',
    icon: '19',
    context: 'Nurix AI · electronics retail demo · August to September 2026',
    metric: { before: '19 days silent', after: '3 checks/day', label: 'order-lookup outage, found and fixed' },
    summary:
      'Traced a 19-day outage to a login token that expired every 24 hours while the console showed healthy. Re-pointed 16 tool bindings and added monitoring that checks 3 times a day.',
    problem: [
      'Our longest-running demo was a voice agent for an electronics store: you call, ask where your order is, and it looks it up. From 22 August, every lookup failed. The console still showed a green “Live” status, and the agent apologised politely instead of giving wrong answers, so the failure stayed hidden for 19 days.',
    ],
    did: [
      'I tested one call at a time until I found the cause: the store connection used a token that expires every 24 hours. Every lookup since 22 August had been rejected.',
      'I built a new connection, re-pointed 16 tool bindings across 4 sub-agents, and confirmed the fix on a live call.',
      'The outage came back. My first fix had also used a 24-hour token. I wrote the incident note in first person (“That is on me”), then switched to a token that doesn’t expire.',
      'Then I built the check that should have existed from day one. It runs a real order query, sends a Telegram report 3 times a day, and names the failure type (expired token, frozen store, missing permission) so the next person doesn’t have to dig.',
    ],
    result: [
      'Order lookups work again. A failure now shows up at the next check instead of hiding for 19 days.',
    ],
    learned:
      'A green status light means nothing until someone tests what it claims. For every dashboard I now ask one question: what real action does this light check?',
    facts: [
      { value: '19 days', label: 'outage found' },
      { value: '24 h', label: 'token expiry, the root cause' },
      { value: '16', label: 'tool bindings re-pointed' },
      { value: '3× / day', label: 'health reports' },
    ],
  },
  {
    id: 'hisaab',
    title: 'Hisaab',
    icon: '₹',
    context: 'The Ken agentic-commerce case competition (₹20L) · September 2026 · Android app',
    metric: { before: '77% can’t track', after: '1 tap each', label: 'students who can’t account for small UPI transfers → one tap to name a payee' },
    summary:
      'An Android app that names the small UPI transfers bank apps can’t categorise, grounded in a 26-student survey. The core app keeps your data on the phone. Advanced to Round 3 of a ₹20L competition.',
    problem: [
      'UPI tells you where money went, never what it was for. Small peer transfers (chai, canteen, splitting a bill) pile up with no category, and bank apps can’t tell a dinner split from a repaid debt.',
      'I surveyed 26 students to check the pain was real. 73% avoid checking their balance, 73% had lied to a parent about spending, and 77% named small UPI transfers as the spending they can’t account for.',
    ],
    did: [
      'I read payment notifications instead of SMS. SMS and accessibility permissions are Play Store rejection risks, and I wanted something a student could install from the store.',
      'The app asks you to name a person once, with up to 3 one-tap category buttons, then reuses that label for later payments to them. It asks again only when an amount falls outside that person’s usual range.',
      'I field-tested the pre-payment card. Triggering it when the payment app opened fired on ordinary balance checks and WhatsApp screenshot sharing, so I moved the trigger to the moment you scan a QR code.',
      'I reused the money model from my earlier prototype and spent the time on capture and the question flow.',
    ],
    result: [
      'Advanced to Round 3 of The Ken’s ₹20L case competition with a working Android build: 8,541 lines of Kotlin and 22 test files.',
    ],
    learned:
      'Field-testing taught me more than the plan did: the naive build broke 7 of our own design rules within 20 minutes of real use. So I turned some rules into code: a build check that fails if the app ever shows streaks, grades or exclamation marks.',
    facts: [
      { value: '26', label: 'students surveyed' },
      { value: '73%', label: 'avoid checking their balance' },
      { value: '77%', label: 'of students can’t account for small UPI' },
      { value: 'Round 3', label: '₹20L competition' },
    ],
  },
  {
    id: 'aria',
    title: 'Aria',
    icon: 'A',
    context: 'Personal project · April to September 2026 · real-time 3D voice companion',
    metric: { before: '1,603 ms', after: '690 ms', label: 'voice first-byte time (median)' },
    summary:
      'A voice-first 3D companion that speaks Hinglish. I ran it as product owner over 5 parallel Claude Code lanes: 96 commits, 86 automated specs, first-audio latency down 57%.',
    problem: [
      'I wanted a voice companion that feels like talking to a person, in Hinglish. A long pause before she answers breaks that feeling, so I made first-audio latency the number to beat.',
    ],
    did: [
      'I ran Aria like a small product team. I split the work into 5 parallel Claude Code lanes (animation, voice and latency, memory, brain and tools, QA) and acted as product owner: I wrote the specs, set priorities and made the calls each lane escalated.',
      'I set up a Mission Control dashboard to see every lane at once: who is working, who is waiting on me, which decisions are queued.',
      'I chose models by testing them in Hindi. The free local stack worked, but its only Hindi voice was male and sounded uncanny. I kept one paid voice layer and dropped the rest.',
      'I made quality measurable with 86 automated specs covering streaming turns, memory consent and crisis safety. When a sound classifier stuck at 10% accuracy, I called it a hardware limit and left that check failing in CI. Faking a pass would have hidden the problem.',
    ],
    result: [
      'First-audio latency fell 57%, from 1,603 ms to 690 ms, after moving to streaming speech and removing a fixed 700 ms delay on every turn. The lanes shipped 96 commits against 86 specs.',
    ],
    learned:
      'The project’s operating rule was “a check that cannot fail is worse than no check.” Directing AI builders taught me that the spec is the product: a lane only ships what I wrote down clearly.',
    facts: [
      { value: '57%', label: 'faster voice first byte' },
      { value: '5', label: 'parallel build lanes' },
      { value: '96', label: 'commits' },
      { value: '86', label: 'automated specs' },
    ],
    image: {
      src: '/img/aria-mission-control.webp',
      alt: 'Aria Mission Control dashboard: agent lanes arranged in a ring around the Aria core, with a list of lanes and their status on the left and a decision queue on the right.',
      w: 1200, h: 636,
      caption: 'Mission Control, the dashboard I used to run the build lanes.',
    },
  },
];

export const experience = [
  {
    role: 'Product & Growth Intern',
    org: 'Nurix AI (now NuPlay)',
    dates: 'January to July 2026 · client work continued to September',
    points: [
      'Conceived and shipped Agent Builder: setup from 5 days to 30 minutes, 4 quality gates, 7 later engagements.',
      'Delivered 53 conversational AI bots for 27 companies across 18 industries and 7 languages, including prototypes for a top Indian hotel chain and Latin America’s largest international airline network.',
      'Audited 2,140 deals and 2,843 accounts to answer an open coverage question, surfacing an untapped vertical and the CRM defects hiding it.',
      'Built a 3-party hold-and-verify booking flow for a hospitality group: a relay caller phones the property while the guest waits. Also launched Danish, German and Dutch housekeeping voicebots.',
      'Tested releases over 80 recorded calls and classified 12 faults by mechanism; ran 53 bilingual test scenarios for a Chennai-based lender.',
      'Guided 4 interns and presented in 8 customer meetings.',
    ],
  },
  {
    role: 'Strategy & Business Intern',
    org: 'RU Skilled (Kyrion Technologies)',
    dates: 'May to July 2025',
    points: [
      'Grew organic traffic 40% through SEO campaigns and landing pages, lifting new users 25%.',
      'Streamlined workshop operations, improving throughput 30%.',
    ],
  },
  {
    role: 'Head, Corporate Relations & Finance',
    org: 'Entrepreneurship Cell, IIT Hyderabad',
    dates: 'August 2023 to April 2026',
    points: [
      'Rose from Assistant Manager to Head of a 15-member team handling ₹40L+ budgets.',
      'Ran E-MERGE 3.0 for 160+ participants from 15 colleges on 57% of its ₹4L allocation; secured sponsors including NPCI (₹10.44L).',
    ],
  },
];

export const more = [
  {
    title: 'Financial statement analysis · Nurix hackathon',
    text: 'Led a 2-person team turning annual reports into a valuation workbook with live formulas. I then checked it against an analyst’s model: 60 of 92 items matched, and the gaps exposed 17 calculation errors.',
  },
  {
    title: 'EY CAFTA Case Championship 2025 · Finalist',
    text: 'Modelled pooled cash across 5 subsidiaries to unlock ₹37.2 crore a year for a simulated exporter carrying an unhedged USD 500 million loan.',
  },
  {
    title: 'Everyday automation tools',
    text: 'An encrypted chat-transfer service (249 end-to-end assertions), MCP servers for YouTube and my campus placement portal, and an inbox cleaner that sorted 38,008 emails and moved 28,464 to Trash, with a full undo path.',
  },
];

export const education = {
  degree: 'B.Tech, Materials Science & Metallurgical Engineering',
  school: 'IIT Hyderabad',
  year: '2027',
};
