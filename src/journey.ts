// Depth-journey copy for the landing page: about me at the top, then the resume in time order, skills at the bottom.
// Every figure traces to career-kb, TRACK-RECORD, the approved resume, content.ts or islands.ts (numbers match exactly).
// Items marked TODO_CONFIRM need Shikhar's sign-off before launch.

export type StageKind = 'intro' | 'chapter' | 'feature' | 'compact' | 'skills' | 'section';

export interface StageNumber {
  value: string;
  label: string;
  /** TODO_CONFIRM: figure is on the resume but not backed by a document on disk. */
  todoConfirm?: true;
}

export interface StageVisual {
  /** Image key the capture team produces, e.g. 'aria-mission-control'. */
  key: string;
  caption: string;
}

export interface Stage {
  id: string;
  period: string;
  title: string;
  org: string;
  role: string;
  kind: StageKind;
  lead: string;
  points: string[];
  numbers: StageNumber[];
  visuals: StageVisual[];
  link?: { href: string; label: string };
  /** Open questions for Shikhar. Anything here is TODO_CONFIRM. */
  todo?: string[];
}

export const journey: Stage[] = [
  {
    id: 'about',
    period: 'Now',
    title: 'About me',
    org: 'IIT Hyderabad',
    role: 'B.Tech, Materials Science & Metallurgical Engineering, class of 2027',
    kind: 'intro',
    lead:
      "I'm Shikhar, a student at IIT Hyderabad. I like finding out how a business works: where the money comes from, why people buy, and what a decision changes.",
    points: [
      'I care about finance, fashion, management and marketing, and I like the ideating and strategy work that ties them together.',
      'I treat every decision as an experiment. Make the call, measure what happened, then pick the next test.',
      'Outside work I take photographs, play basketball, follow equities and make long-form explainer video essays.',
    ],
    numbers: [],
    visuals: [],
  },
  {
    id: 'section-por',
    period: '',
    title: 'Positions of Responsibility',
    org: '',
    role: '',
    kind: 'section',
    lead: '',
    points: [],
    numbers: [],
    visuals: [],
  },
  {
    id: 'ecell-start',
    period: 'Aug 2023 to Apr 2024',
    title: 'Joining E-Cell',
    org: 'Entrepreneurship Cell, IIT Hyderabad',
    role: 'Assistant Manager, Corporate Relations & Marketing',
    kind: 'chapter',
    lead:
      'In my first year I joined the Entrepreneurship Cell on the corporate relations and marketing side. This is where I met the campus startups I would work with next.',
    points: [
      'Reached out to sponsors and partners, and ran the meetings and follow-ups that started new partnerships.',
      'Worked across PR, Design, Marketing, Events and Operations to keep the club running smoothly.',
      'Helped the corporate relations and finance team with sponsorship outreach, documentation and early financial planning.',
    ],
    numbers: [],
    visuals: [{ key: 'ecell-logos', caption: 'E-Cell IIT Hyderabad and the partners I later worked with.' }],
  },
  {
    id: 'picapool',
    period: 'Oct 2023 to Feb 2024',
    title: 'Picapool',
    org: 'Picapool, an IIT Hyderabad campus startup',
    role: 'Marketing Intern',
    kind: 'compact',
    lead: 'My first startup role, at a campus startup that E-Cell counts among its success stories.',
    points: [
      'Ran market research and split the audience into segments.',
      'Came up with ad campaign ideas and pitched them to the team.',
    ],
    numbers: [],
    visuals: [],
  },
  {
    id: 'ecell-manager',
    period: 'May 2024 to Apr 2025',
    title: 'Managing corporate relations and finance',
    org: 'Entrepreneurship Cell, IIT Hyderabad',
    role: 'Manager, Corporate Relations & Finance',
    kind: 'compact',
    lead: 'In second year I moved to the money side of E-Cell: sponsor deals and event budgets.',
    points: [
      'Became the main point of contact for startups and companies working with E-Cell.',
      'Handled sponsorship outreach, finance and event operations for flagship events.',
      'Designed the sponsorship decks and proposals we sent to companies.',
    ],
    numbers: [],
    visuals: [],
  },
  {
    id: 'tedx',
    period: 'May 2024 to Apr 2025',
    title: 'TEDx IIT Hyderabad',
    org: 'TEDxIITHyderabad',
    role: 'PR & Marketing Coordinator',
    kind: 'compact',
    lead: 'I ran social media promotion and event branding for the Tatv edition.',
    points: [],
    numbers: [],
    visuals: [{ key: 'tedx-cert', caption: 'TEDx IIT Hyderabad certificate, 2024-25 tenure.' }],
  },
  {
    id: 'section-workex',
    period: '',
    title: 'Work Experience',
    org: '',
    role: '',
    kind: 'section',
    lead: '',
    points: [],
    numbers: [],
    visuals: [],
  },
  {
    id: 'kyrion',
    period: 'May to Jul 2025',
    title: 'RU Skilled',
    org: 'Kyrion Technologies (parent of RU Skilled and Techgyan)',
    role: 'Strategy & Business Intern, RU Skilled',
    kind: 'compact',
    lead:
      'My first company internship. I worked across two of its brands, on course design for one and customer flows for the other.',
    points: [
      'Planned the landing pages and website content, and ran the SEO campaigns behind them.',
      'Streamlined how workshops ran, from registration to completion.',
      'RU Skilled: mapped the curriculum and structured hybrid online and offline courses.',
      'Techgyan: built WhatsApp automation flows on TeleCRM for lead generation and support.',
      'Designed chatbot menus that handle registration, queries and payments.',
    ],
    numbers: [
      { value: '40%', label: 'more organic traffic from SEO campaigns and landing pages' },
      { value: '25%', label: 'more new users' },
      { value: '30%', label: 'higher workshop throughput' },
      { value: '20%', label: 'wider market reach' },
    ],
    visuals: [],
  },
  {
    id: 'ecell-head',
    period: 'May 2025 to Apr 2026',
    title: 'Running E-Cell’s money, and E-MERGE 3.0',
    org: 'Entrepreneurship Cell, IIT Hyderabad',
    role: 'Head, Corporate Relations & Finance',
    kind: 'feature',
    lead:
      'In third year I became Head of Corporate Relations & Finance, leading a 15-member team handling ₹40L+ budgets. Our biggest test was E-MERGE 3.0, a two-day summit on 11 and 12 October 2025.',
    points: [
      'We planned E-MERGE on a ₹4L budget, funded 51% by sponsors and 49% by registrations. We ran it on 57% of that and kept the rest.',
      'I negotiated sponsor terms end to end. NPCI came in at ₹10.44L, with Innomet and Masters’ Union also on board.',
      'The program had a Startup Senate, a Boardroom Simulation and a Founders Forum, with speakers from Cars24 and Bombay Shaving Company.',
    ],
    numbers: [
      { value: '15', label: 'people on my team' },
      { value: '₹40L+', label: 'budgets handled' },
      { value: '160+', label: 'E-MERGE participants from 15 colleges' },
      { value: '57%', label: 'of the ₹4L E-MERGE budget used' },
      { value: '₹10.44L', label: 'NPCI sponsorship' },
    ],
    visuals: [
      { key: 'ecell-emerge-banner', caption: 'E-MERGE 3.0, October 2025.' },
      { key: 'ecell-emerge', caption: 'From the E-MERGE 3.0 report: 160+ students, 15+ colleges, 57% of budget used.' },
      { key: 'ecell-logos', caption: 'Sponsors and partners: NPCI, Innomet, Masters’ Union.' },
    ],
  },
  {
    id: 'ey-cafta',
    period: '2025',
    title: 'EY CAFTA Case Championship: Treasury360',
    org: 'EY CAFTA Case Championship 2025',
    role: 'Finalist, 2-person team with Rishabh Duggal',
    kind: 'feature',
    lead:
      'We played treasury team for a simulated exporter operating in 5 countries and carrying an unhedged USD 500 million loan. Our job: measure the currency risk and free up cash.',
    points: [
      'We measured USD/NGN volatility in Python notebooks from daily price changes: 29.41% a year over 10 years, 43.47% over the last year. The recent number drove our Nigeria exposure: $2M a month × 12 × 43% = $10.3M a year at risk.',
      'We proposed pooling cash across the subsidiaries. That frees ₹37.2 Cr a year: ₹12.0 Cr from deposit returns and ₹25.2 Cr from ending ₹60 Cr a month of outside borrowing (₹40 Cr in Nigeria at 12%, ₹20 Cr in China at 8%), phased in 3 steps over 18 months.',
      'We ranked the 5 countries by risk and set a hedging plan: cross-currency swaps for the USD 500M loan, forwards and options for exports, and a 70% coverage target.',
      'We built a USD/INR forecasting tool in React. It blends purchasing power parity, interest rate parity, macro and technical models with weights you can adjust, and projects 6 months ahead with ±2% bands.',
    ],
    numbers: [
      { value: '43.47%', label: '1-year USD/NGN volatility (29.41% over 10 years)' },
      { value: '$10.3M', label: 'yearly Nigeria FX exposure' },
      { value: '₹37.2 Cr', label: 'freed each year by cash pooling' },
      { value: '70%', label: 'hedge coverage target' },
    ],
    visuals: [
      { key: 'ey-vol-10y', caption: 'USD/NGN daily changes over 10 years: 29.41% annualised volatility.' },
      { key: 'ey-vol-1y', caption: 'The last year alone: 43.47%.' },
      { key: 'ey-deck-cashpool', caption: 'Cash pooling: ₹12.0 Cr deposit returns plus ₹25.2 Cr of borrowing removed.' },
      { key: 'ey-forecaster-split', caption: 'The USD/INR forecaster: set the indicators on the left, read the 6-month forecast on the right.' },
    ],
    link: { href: 'https://n92hmk.csb.app/', label: 'Try the USD/INR forecaster' },
  },
  {
    id: 'nurix',
    period: 'Jan to Jul 2026, client work to Sep',
    title: 'Nurix AI',
    org: 'Nurix AI (now NuPlay)',
    role: 'Product & Growth Intern',
    kind: 'chapter',
    lead:
      'I joined Nurix AI to build voice and chat agents for enterprise client demos. I started by building single agents by hand and ended by writing the tool my colleagues used to build the next ones.',
    points: [
      'Audited 2,140 deals and 2,843 accounts to answer an open coverage question, and found an untapped vertical plus the CRM defects hiding it.',
      'Tested releases over 80 recorded calls and sorted 12 faults by mechanism.',
      'Guided 4 interns and presented in 8 customer meetings.',
    ],
    numbers: [
      { value: '53', label: 'voice & chat bots delivered' },
      { value: '27', label: 'companies' },
      { value: '18', label: 'industries' },
      { value: '7', label: 'languages' },
    ],
    visuals: [],
  },
  {
    id: 'section-projects',
    period: '',
    title: 'Projects',
    org: '',
    role: '',
    kind: 'section',
    lead: '',
    points: [],
    numbers: [],
    visuals: [],
  },
  {
    id: 'aria',
    period: 'Apr to Sep 2026',
    title: 'Aria',
    org: 'Personal project',
    role: 'Designer and product owner',
    kind: 'feature',
    lead:
      'A 3D voice companion you talk to in Hinglish. I designed it and ran it as product owner over 5 parallel Claude Code lanes. The lanes wrote the code.',
    points: [
      'I made first-audio latency the number to beat, because a long pause breaks the feeling of talking to a person. Streaming speech and removing a fixed 700 ms delay cut it 57%.',
      'I split the work into 5 lanes (animation, voice and latency, memory, brain and tools, QA) and watched them from one Mission Control dashboard.',
      'I tested a free local speech stack in Hindi. Its only Hindi voice was male and sounded uncanny, so I kept one paid voice layer.',
      'When a sound classifier stuck at 10% accuracy, I left its check failing in CI. Faking a pass would have hidden the problem.',
    ],
    numbers: [
      { value: '1,603 → 690 ms', label: 'voice first-byte time, median of 4 runs' },
      { value: '5', label: 'parallel Claude Code lanes' },
      { value: '96', label: 'commits' },
      { value: '86', label: 'automated specs' },
    ],
    visuals: [
      { key: 'aria-scene', caption: 'Aria in her scene.' },
      { key: 'aria-moods', caption: 'Hidden mood tags in each reply drive her face and gestures.' },
      { key: 'aria-mission-control', caption: 'Mission Control, the dashboard I ran the build lanes from (5 build lanes).' },
    ],
  },
  {
    id: 'finanalyse',
    period: 'Apr 2026',
    title: 'Financial statement analysis',
    org: 'Nurix internal hackathon',
    role: 'PRD owner, 2-person team',
    kind: 'feature',
    lead:
      'Upload an annual report, get a valuation workbook with live formulas. I owned the PRD and directed the build, which we built with Claude Code.',
    points: [
      'The pipeline reads the PDF, fills gaps with Claude when extraction confidence is low, writes commentary, then builds an Excel workbook and a Word report.',
      'The workbook covers the three statements, 20+ ratios, a forecast, WACC, DCF, DDM, comparables and Monte Carlo risk.',
      'Then I audited it against an analyst’s model. 60 of 92 items matched. The gaps exposed 17 calculation errors, and I traced their causes, such as other income counted in profit before tax and leases handled wrong.',
    ],
    numbers: [
      { value: '60 / 92', label: 'items matched an analyst’s model' },
      { value: '17', label: 'calculation errors found by my audit' },
      { value: '20+', label: 'ratios, plus DCF and DDM' },
    ],
    visuals: [
      { key: 'finanalyse-workbook', caption: 'Output workbook for a listed company, with live formulas.' },
      { key: 'finanalyse-audit', caption: 'My audit against an analyst’s model: 60 of 92 matched.' },
    ],
  },
  {
    id: 'agent-builder',
    period: 'Jun to Sep 2026',
    title: 'Agent Builder',
    org: 'Nurix AI (now NuPlay)',
    role: 'Conceived and shipped',
    kind: 'feature',
    lead:
      "Each new client needed a crew of voice agents built by hand: writing prompts, linking agents, wiring tools, building a demo page. That took about 5 days per client. I built a tool that does it in 30 minutes.",
    points: [
      'It reads up to 5 pages of the site in plain code, then writes a one-page brief the operator corrects before any prompt exists.',
      'One short planning call sets the crew, and each agent is written in parallel. A 4-agent crew that failed after 240+ seconds now finishes in 123 seconds with zero errors.',
      'Nothing reaches the platform until the crew passes 4 quality gates, including simulated adversarial conversations.',
      'Colleagues ran 7 later client engagements on it.',
    ],
    numbers: [
      { value: '5 days → 30 min', label: 'setup time per client crew' },
      { value: '240 s+ → 123 s', label: '4-agent crew build, 0 errors' },
      { value: '4', label: 'quality gates' },
      { value: '7', label: 'later engagements run by colleagues' },
    ],
    visuals: [],
  },
  {
    id: 'nuplay-electronics',
    period: 'Apr to Sep 2026',
    title: 'NuPlay Electronics, end to end',
    org: 'Nurix AI (now NuPlay)',
    role: 'Built and ran the demo',
    kind: 'feature',
    lead:
      'Our longest-running demo: a support line for a fictional electronics store. You call, and a crew of voice agents finds your order, books a pickup or talks you through a price.',
    points: [
      'A crew of 5 agents: one routes the call, the others handle order status, store pickup, price objections and handoff to a human.',
      'I seeded a real Shopify store with about 100 orders, 60 products and 60 customers, and tiered caller verification by risk.',
      'I scripted 3 demo scenarios and pressure-tested each prompt change against 8 cases, with a rollback ready.',
      'When order lookups failed for 19 days behind a green "Live" light, I traced it to a 24-hour token, re-pointed 16 tool bindings and added a health check that runs a real order query 3 times a day.',
    ],
    numbers: [
      { value: '5', label: 'agents in the crew' },
      { value: '~100', label: 'seeded orders, 60 products, 60 customers' },
      { value: '8', label: 'cases in each pressure test' },
      { value: '19 days → 3× / day', label: 'silent outage, now checked 3 times a day' },
    ],
    visuals: [
      { key: 'nuplay-agent', caption: 'The Order Tracking Agent in the NuPlay dashboard: start a web or phone call, with the caller’s orders beside it.' },
      { key: 'nuplay-playground', caption: 'The playground: pick a scenario and call the crew.' },
    ],
    link: { href: 'https://experience.nurixlabs.tech/nurix-experience/experience', label: 'Open the live experience page' },
  },
  {
    id: 'hisaab',
    period: 'Sep 2026',
    title: 'The Ken case: Hisaab',
    org: 'The Ken agentic-commerce case competition (₹20L)',
    role: 'Round 3',
    kind: 'feature',
    lead:
      'UPI tells you where money went, never what it was for. Hisaab is an Android app that names small UPI transfers in one tap and keeps your data on the phone.',
    points: [
      'I surveyed 26 students first. 73% avoid checking their balance, and 77% named small UPI transfers as the spending they can’t account for.',
      'The app reads payment notifications, since SMS and accessibility permissions risk Play Store rejection. You name a payee once and it reuses the label.',
      'Field-testing moved the pre-payment card from app launch to the QR scan, because the first trigger fired on balance checks.',
      'The first build broke 7 of our design rules within 20 minutes of real use, so a build check now fails if the app shows streaks, grades or exclamation marks.',
    ],
    numbers: [
      { value: '26', label: 'students surveyed' },
      { value: '77%', label: 'can’t account for small UPI transfers' },
      { value: '8,541', label: 'lines of Kotlin, 22 test files' },
      { value: 'Round 3', label: 'of the ₹20L competition' },
    ],
    visuals: [
      { key: 'hisaab-phones', caption: 'Hisaab screens: the one-tap question and the month view.' },
      { key: 'ken-flow', caption: 'The flow from payment notification to a named payee.' },
    ],
  },
  {
    id: 'tools',
    period: '2026',
    title: 'Everyday automation tools',
    org: 'Personal projects',
    role: 'Built for myself',
    kind: 'compact',
    lead: 'Small tools that remove chores from my own week.',
    points: [
      'DragonFire: a dragon on my Mac. I click it, talk, and it pastes a cleaned-up version of what I said.',
      'A resume agent and ATS tracker that tailor each application from verified evidence and score the fit.',
      'An encrypted chat-transfer service, MCP servers for YouTube and my campus placement portal, and an inbox cleaner that sorted 38,008 emails and moved 28,464 to Trash.',
    ],
    numbers: [
      { value: '249', label: 'end-to-end assertions in chat transfer' },
      { value: '9 + 14', label: 'tools in the YouTube and placement-portal servers' },
      { value: '38,008', label: 'emails sorted' },
    ],
    visuals: [{ key: 'ats-tracker', caption: 'The ATS tracker, shown with synthetic data.' }],
  },
  {
    id: 'skills',
    period: 'Toolkit',
    title: 'Skills',
    org: '',
    role: '',
    kind: 'skills',
    lead: 'What the work above taught me, grouped by where I used it.',
    points: [
      'Product: requirements and PRDs, funnel mapping, root cause analysis, competitive benchmarking, impact measurement.',
      'Finance: FX volatility, cash pooling, hedging plans, DCF and DDM valuation, ratio analysis. Course: CIIB, NSE Academy & NYIF.',
      'AI: multi-agent voice crews, prompt design, LLM evaluation and test scenarios, directing Claude Code builds.',
      'Tools: Python, SQL, Excel, Power BI, Google Sheets, HubSpot, Shopify and Salesforce integrations.',
      'People: sponsor negotiation, stakeholder management, cross-functional work, guiding interns.',
    ],
    numbers: [],
    visuals: [],
  },
];
