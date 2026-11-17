// All copy for the site. Every figure is lifted from the approved resume (public/Shikhar-Kansal-Resume.pdf) or the
// earlier verified copy (src/content.ts and src/journey.ts, in git history), which trace to career-kb and TRACK-RECORD.
// Do not add a number that is not in those sources.

export const person = {
  name: 'Shikhar Kansal',
  line: 'Product and growth. B.Tech at IIT Hyderabad, class of 2027.',
  statement: 'I find where work is slow or broken, ship the fix, and measure it.',
  seeking: 'Looking for APM, Product Analyst, Product Associate and Growth roles.',
  email: 'ms23btech11024@iith.ac.in',
  phone: '+916203042129',
  phoneDisplay: '+91 62030 42129',
  linkedin: 'https://www.linkedin.com/in/shikhar-kansal-a6b42028b',
  github: 'https://github.com/shikharkansal-aria',
  resume: '/Shikhar-Kansal-Resume.pdf',
};

export interface Shot { key: string; alt: string; w: number; h: number; caption: string }
export interface Figure { value: string; label: string }
export interface Phone { key: string; alt: string; caption: string }
/** A titled section of a case page; used instead of problem, did and result when a case needs more chapters. */
export interface Stat { value: string; label: string; source?: string }
export interface Chapter {
  id: string;
  heading: string;
  paras?: string[];
  list?: string[];
  extra?: 'rivals';
  /** One answer each: a bar per answer, with the question and sample as a visible caption. */
  bars?: { caption: string; rows: { label: string; pct: number }[]; after: number };
  /** A row of numbers; with statsFirst they sit above the paragraphs. */
  stats?: Stat[];
  statsNote?: string;
  statsFirst?: boolean;
}

export interface CaseStudy {
  id: string;
  title: string;
  /** Shown with the title, as part of the heading (Aria, Virtual Human). */
  subtitle?: string;
  org: string;
  role: string;
  period: string;
  kind: 'Work at Nurix AI' | 'Competition' | 'Personal project' | 'Hackathon' | 'Startup in the making';
  /** One sentence, shown on cards and at the top of the case page. */
  summary: string;
  headline?: { before?: string; after: string; label: string };
  problem: string[];
  did: string[];
  result: string[];
  learned?: string;
  figures: Figure[];
  shots: Shot[];
  links?: { href: string; label: string }[];
  chapters?: Chapter[];
  /** Phone screens, shown in groups at the top of the case page. */
  screens?: { heading: string; phones: Phone[] }[];
}

const nurixDates = 'January to July 2026, client work to September';

// Hisaab: every line below is reviewed copy, each claim checked against its source.
const hisaab = {
  problem: [
    'Where does my money go? I kept asking it at the end of each month. A UPI payment already records whom I paid and how much. The why gets lost, and without it a month of payments reads as a list of names and numbers.',
  ],
  survey: [
    'I ran an exploratory survey on the IIT Hyderabad campus and got 86 responses. 87.2% of the people who answered were college students and 84.9% were aged 18 to 22, so the results describe an early student group, not every UPI user.',
    '“Do you know where your money went last month?” 18.6% said yes, almost to the rupee. 61.6% said roughly, 16.3% not really, and 3.5% had no idea.',
    '“How do you track spending today?” 64% scroll through their UPI app history. People could tick several answers.',
    '“Have you used an expense tracking app?” 73.3% have never tried one.',
    '“What would stop you from using a money app?” 62.8% picked “It wants my bank login”. People could tick up to two.',
    '47.7% would rather tap a suggested response, and 37.2% would rather type a few words.',
  ],
  market: [
    'How big. UPI carried 25.47 billion payments in October 2026, 23% more than the 20.70 billion of October 2025 (NPCI monthly statistics; growth is my arithmetic).',
    'Who is there and where they stop. Among the 26 apps I compared, at least one reads payment notifications, and none of the 21 I could check asks why at the moment of payment. Most people I surveyed use none of them: 64% scroll their UPI app history and 73.3% never tried a tracker.',
    'Why the gap exists. Trackers lose people fast: finance apps keep 2% of users to day 30 (Adjust, quoted by Stream at getstream.io, 22 Jan 2026, updated 23 Oct 2026).',
    'What makes it hard. Few people stay with a money app past the first month, and holding money needs a licence and capital. Fi, built on a partner bank, said in March 2026 its banking would end (TechCrunch, 11 Mar 2026). So I start with one job that earns trust.',
  ],
  insight: [
    'Most people I asked check their spending by scrolling UPI history, and most have never tried an expense app. So Hisaab asks one thing, right after I pay, while I still remember: why. Whom and how much are already there.',
    'It began as my entry to The Ken’s case competition. After the competition I kept building it as my own product.',
  ],
  built: [
    'An Android app that asks what a UPI payment was for, right after I make it. I tap one of six categories: the five I use most, plus Other. Then I tap one of my own past reasons in that category or type a new one; Other goes straight to typing. When the app already knows the kind of place I paid, it files the category for me and lets me add a note.',
    'Home shows where my money went, with my own reasons named when they explain a real share of the day. Activity lists every payment by month; one without a reason shows Add a reason, and I can add a cash payment by hand. Hisaab keeps one row per payment, cancels a debit when its refund arrives, and leaves transfers between my own accounts out of the totals. It remembers payees, and when a payee shows up as a phone number it can show the contact name, only if I allow it. I can sign in with Google to back up and restore.',
    'I also built a native iPhone version, which runs as a test build.',
  ],
  decisions: [
    'The reasons are mine. The categories are fixed, but the reason pills under them show only reasons I typed before, and the app preselects nothing.',
    'No ads. My payment history stays on my phone unless I choose to back it up.',
    'Core before looks: I made the payment question reliable first and redesigned the screens after.',
    'I filed an Indian provisional patent application in November 2026.',
  ],
  research: [
    'I compared 26 apps, money trackers and habit apps, on 31 features. Of the 21 I could check, none asks why at the moment of payment; for the other 5 I could not confirm either way.',
    'At least one rival already reads payment notifications on Android, so my edge has to be the why.',
    'The study also showed where I am behind. 8 of the rivals offer family sharing, 3 of them as a paid feature; Hisaab has nothing for that yet, and no app lock either.',
  ],
  today: [
    'The Android app is in a closed test on Google Play, free during the beta. It is not on the public Play Store yet: production access needs 12 testers opted in for 14 days in a row.',
    'The iPhone version runs as a test build on a test phone.',
    'I have not yet shown that testers come back day after day. That is my next test.',
  ],
  vision: [
    'I want Hisaab to be a habit maker, not a tracker: a short step after each payment that, over months, leaves you knowing where your money goes. Next I am testing which result of the why makes people stay: knowing whether the money lasts till the 1st, keeping track of what friends owe, or a weekly fact about your spending.',
    'Later, I want to earn trust with this one job, then add regulated products through licensed partners, without ever holding anyone’s money myself.',
  ],
};

export const cases: CaseStudy[] = [
  {
    id: 'hisaab',
    title: 'Hisaab',
    org: 'My own startup',
    role: 'Founder',
    period: 'September 2026 to now',
    kind: 'Startup in the making',
    summary:
      'Where does my money go? My UPI app tells me whom I paid and how much, never why. Hisaab asks why right after each payment, so I can come back anytime and see where my money went and why. It is an Android app in a closed test on Google Play, with an iPhone version in testing.',
    headline: { before: 'Case competition entry', after: 'Closed test on Google Play', label: 'Hisaab, from a case competition entry to an Android app in a closed test on Google Play' },
    problem: hisaab.problem,
    did: [...hisaab.insight, ...hisaab.built, ...hisaab.decisions, ...hisaab.research],
    result: [...hisaab.today, ...hisaab.vision],
    learned: 'A competition gives you a deadline. A product needs a reason to open it tomorrow, and I am still proving that reason.',
    figures: [
      { value: '26', label: 'rival apps compared on 31 features' },
      { value: '0 of 21', label: 'rivals I could check ask why at the moment of payment (5 more not confirmed)' },
      { value: '18.6%', label: 'of 86 people surveyed know last month’s spending almost to the rupee' },
    ],
    chapters: [
      { id: 'problem', heading: 'The problem', paras: hisaab.problem },
      {
        id: 'survey',
        heading: 'The survey',
        paras: hisaab.survey,
        bars: {
          caption: 'Do you know where your money went last month? 86 answers, exploratory IIT Hyderabad campus survey.',
          rows: [
            { label: 'Yes, almost to the rupee', pct: 18.6 },
            { label: 'Roughly', pct: 61.6 },
            { label: 'Not really', pct: 16.3 },
            { label: 'No idea', pct: 3.5 },
          ],
          after: 2,
        },
        stats: [
          { value: '18.6%', label: 'know last month’s spending almost to the rupee' },
          { value: '64%', label: 'track by scrolling UPI history' },
          { value: '73.3%', label: 'never tried an expense app' },
        ],
        statsNote: '86 answers, exploratory campus survey. 64% is from a question where people could tick several answers.',
      },
      {
        id: 'market',
        heading: 'The market',
        paras: hisaab.market,
        statsFirst: true,
        stats: [
          { value: '25.47 billion', label: 'UPI payments in October 2026', source: 'NPCI monthly statistics, October 2026' },
          { value: '+23%', label: 'on October 2025 (20.70 billion)', source: 'My arithmetic on NPCI monthly statistics, October 2025 and 2026' },
          { value: '2%', label: 'of finance app users still active on day 30', source: 'Adjust, quoted by Stream, 22 Jan 2026, updated 23 Oct 2026' },
        ],
      },
      { id: 'insight', heading: 'The insight', paras: hisaab.insight },
      { id: 'built', heading: 'What I built', paras: hisaab.built },
      { id: 'decisions', heading: 'Key decisions', list: hisaab.decisions },
      { id: 'research', heading: 'The rival study', paras: hisaab.research, extra: 'rivals' },
      { id: 'today', heading: 'Where it stands today', paras: hisaab.today },
      { id: 'vision', heading: 'The vision', paras: hisaab.vision },
    ],
    screens: [
      {
        heading: 'Right after a payment',
        phones: [
          { key: 'askwhy', alt: 'Hisaab’s in-app card over Home, with demo data: it asks what a payment at Corner Cafe was for, with six categories: Food, Groceries, Transport, Bills, Shopping and Other', caption: 'Right after a payment, Hisaab’s in-app card asks what it was for. You tap a category.' },
          { key: 'reasons', alt: 'The same in-app card after a category is picked: four of your past reasons as buttons, and Change category', caption: 'Then one of your past reasons.' },
          { key: 'typing', alt: 'The same in-app card with a text box, Type what it was for, a Save button and Back', caption: 'Or you type a new one.' },
        ],
      },
      {
        heading: 'Anytime after',
        phones: [
          { key: 'home', alt: 'Hisaab Home with demo data: where your money went today, split into Health, Lunch with Ravi and Other, and payments with Add reason links', caption: 'Home shows where your money went, with a made-up month of payments.' },
          { key: 'activity', alt: 'Activity with demo data: average spend by month as a bar chart, then November 2026 payments, two of them showing Add a reason', caption: 'Activity lists every payment by month. A payment without a reason shows Add a reason.' },
          { key: 'you', alt: 'You with demo data: the profile, Your plan: Free beta, and account rows including Data and backup', caption: 'You: the free beta plan, and backup and restore.' },
        ],
      },
    ],
    shots: [
      { key: 'hisaab-row', w: 1600, h: 623, alt: 'Five Hisaab screens with demo data: Home, the in-app card asking what a payment was for, the same card with past reasons, Activity by month, and You', caption: 'Home, the in-app why card, Activity and You, with demo data.' },
    ],
    links: [
      { href: 'https://hisaabstartup.netlify.app/', label: 'See the Hisaab page' },
      { href: 'https://shikharkansal-aria.github.io/hisaab-policy/privacy/', label: 'Read the privacy policy' },
    ],
  },
  {
    id: 'agent-builder',
    title: 'Agent Builder',
    org: 'Nurix AI (now NuPlay)',
    role: 'Conceived and shipped',
    period: 'June to September 2026',
    kind: 'Work at Nurix AI',
    summary:
      'Setting up AI voice agents for a new client took about 5 days of building by hand. I built an internal tool that does it in 30 minutes, and colleagues ran 7 later client engagements on it.',
    headline: { before: '5 days by hand', after: '30 minutes', label: 'to set up AI voice agents for one new client' },
    problem: [
      'Each new client needed a crew of voice agents built by hand: prompts, tools, the handoffs between agents, a demo page. One crew took about 5 days, and I kept repeating the same steps for every brand.',
    ],
    did: [
      'I used crews that had already passed client demos as the model, so the builder starts from something that worked on real calls.',
      'The tool reads up to 5 pages of the brand’s site in plain code, then writes a one-page brief. The operator corrects that brief before any prompt exists, which is faster than proofreading thousands of words of generated prompt.',
      'I put 4 quality gates in front of the platform, including one that stages adversarial conversations and grades them. Nothing gets written until a crew passes. Speed only helps if the output is right, so the gates came before the speed work.',
      'A 4-agent crew hit the model’s output limit and failed after more than 240 seconds. I split the job: one short planning call, each agent written in parallel, and everything predictable built in plain code. It now finishes in 123 seconds with zero validation errors.',
    ],
    result: ['Setting up a new client’s voice agents went from about 5 days of hand-building to 30 minutes. Colleagues ran 7 later client engagements on the builder.'],
    learned:
      'I judge an internal tool by adoption: do colleagues pick it up without me in the room? Seven engagements answered that better than any demo I could give.',
    figures: [
      { value: '5 days → 30 min', label: 'to set up one new client’s voice agents' },
      { value: '240 s+ → 123 s', label: '4-agent crew build, 0 errors' },
      { value: '4', label: 'quality gates before anything ships' },
      { value: '7', label: 'later engagements run by colleagues' },
    ],
    shots: [],
  },
  {
    id: 'nuplay-electronics',
    title: 'NuPlay Electronics',
    org: 'Nurix AI (now NuPlay)',
    role: 'Built and ran the demo end to end',
    period: 'April to September 2026',
    kind: 'Work at Nurix AI',
    summary:
      'Our longest-running demo: a support line for a fictional electronics store, run by a crew of 5 voice agents. When it failed silently for 19 days, I found why and built the check that catches it.',
    headline: { before: '19 days unseen', after: '3 checks a day', label: 'an order-lookup outage, found and fixed' },
    problem: [
      'You call the store, and a crew of voice agents finds your order, books a pickup or talks you through a price. It had to hold up in front of clients, call after call.',
      'From 22 August, every order lookup failed. The console still showed a green “Live” status, and the agent apologised instead of giving wrong answers, so the failure stayed hidden for 19 days.',
    ],
    did: [
      'I built a crew of 5 agents: one routes the call, the others handle order status, store pickup, price objections and handoff to a human.',
      'I seeded a real Shopify store with about 100 orders, 60 products and 60 customers, and tiered caller verification by risk.',
      'I scripted 3 demo scenarios and pressure-tested every prompt change against 8 cases, with a rollback ready.',
      'For the outage, I tested one call at a time until I found the cause: the store connection used a token that expired every 24 hours. I re-pointed 16 tool bindings and confirmed the fix on a live call.',
      'The outage came back, because my first fix also used a 24-hour token. I wrote the incident note in first person (“That is on me”) and switched to a token that does not expire.',
      'Then I built the check that should have existed from day one: it runs a real order query 3 times a day and names the failure type, so the next person does not have to dig.',
    ],
    result: ['Order lookups work again, and a failure now shows up at the next check instead of hiding for 19 days.'],
    learned:
      'A green status light means nothing until someone tests what it claims. For every dashboard I now ask: what real action does this light check?',
    figures: [
      { value: '5', label: 'voice agents in the crew' },
      { value: '~100', label: 'seeded orders, 60 products, 60 customers' },
      { value: '8', label: 'cases in every pressure test' },
    ],
    shots: [
      { key: 'nuplay-agent', w: 1600, h: 866, alt: 'NuPlay dashboard: the Order Tracking Agent ready for a web or phone call, with suggested questions and the caller’s orders shown beside it (contact details blurred)', caption: 'The Order Tracking Agent, with the caller’s orders beside it.' },
      { key: 'nuplay-playground', w: 1440, h: 900, alt: 'NuPlay CRM playground: “Pick a customer” grid of seeded customer profiles, each card listing what you can test on the call', caption: 'The playground: pick a customer, then call the crew.' },
    ],
    links: [{ href: 'https://experience.nurixlabs.tech/nurix-experience/experience', label: 'Open the live experience page' }],
  },
  {
    id: 'aria',
    title: 'Aria',
    subtitle: 'Virtual Human',
    org: 'Personal project',
    role: 'Designer and product owner',
    period: 'April to September 2026',
    kind: 'Personal project',
    summary:
      'A 3D virtual human you talk to in Hinglish. As her designer and product owner, I cut the wait for her first word by 57%.',
    headline: { before: '1,603 ms', after: '690 ms', label: 'time to Aria’s first word (median)' },
    problem: [
      'I wanted a voice companion that feels like talking to a person, in Hinglish. A long pause before she answers breaks that feeling, so I made first-audio latency the number to beat.',
    ],
    did: [
      'I chose models by testing them in Hindi. The free local stack worked, but its only Hindi voice was male and sounded uncanny, so I kept one paid voice layer.',
      'I made quality measurable with automated checks. When a sound classifier stuck at 10% accuracy, I left that check failing in CI. Faking a pass would have hidden the problem.',
    ],
    result: ['First-audio latency fell 57%, from 1,603 ms to 690 ms, after moving to streaming speech and removing a fixed 700 ms delay on every turn.'],
    figures: [
      { value: '57%', label: 'faster to the first word' },
      { value: '700 ms', label: 'fixed delay removed from every turn' },
    ],
    shots: [
      { key: 'aria-scene', w: 1280, h: 813, alt: 'Aria, an animated virtual human, standing in an alpine meadow scene with a message box at the bottom', caption: 'Aria in one of her scenes.' },
      { key: 'aria-moods', w: 1600, h: 1452, alt: 'Contact sheet of twelve Aria emotion states: neutral, happy, excited, laughing, sarcastic, shy, thinking, concerned, confident, surprised, sad, grateful', caption: 'Hidden mood tags in each reply drive her face and gestures.' },
    ],
  },
  {
    id: 'ey-cafta',
    title: 'Treasury360',
    org: 'EY CAFTA Case Championship 2025',
    role: 'Finalist, 2-person team with Rishabh Duggal',
    period: 'October 2025',
    kind: 'Competition',
    summary:
      'We played treasury team for a simulated exporter in 5 countries with an unhedged USD 500 million loan, and found ₹37.2 crore a year through cash pooling.',
    headline: { after: '₹37.2 Cr', label: 'freed each year by pooling cash' },
    problem: [
      'A simulated exporter operated in 5 countries and carried an unhedged USD 500 million loan. Our job: measure the currency risk and free up cash.',
    ],
    did: [
      'We measured USD/NGN volatility in Python from daily price changes: 29.41% a year over 10 years, 43.47% over the last year. The recent number drove our Nigeria exposure: $2M a month × 12 × 43% = $10.3M a year at risk.',
      'We proposed pooling cash across the subsidiaries: ₹12.0 Cr from deposit returns and ₹25.2 Cr from ending ₹60 Cr a month of outside borrowing, phased in 3 steps over 18 months.',
      'We ranked the 5 countries by risk and set a hedging plan: cross-currency swaps for the loan, forwards and options for exports, and a 70% coverage target.',
      'We built a USD/INR forecasting tool in React that blends purchasing power parity, interest rate parity, macro and technical models, and projects 6 months ahead with ±2% bands.',
    ],
    result: ['Finalist in the EY CAFTA Case Championship 2025.'],
    figures: [
      { value: '43.47%', label: '1-year USD/NGN volatility (29.41% over 10 years)' },
      { value: '$10.3M', label: 'yearly Nigeria FX exposure' },
      { value: '₹37.2 Cr', label: 'freed each year by cash pooling' },
      { value: '70%', label: 'hedge coverage target' },
    ],
    shots: [
      { key: 'ey-forecaster-split', w: 1994, h: 950, alt: 'USD/INR forecaster: indicators you set on the left; on the right, a 6-month forecast line with ±2% bands and a bar chart of each model’s projected rate', caption: 'The USD/INR forecaster: set the indicators, read the 6-month forecast.' },
      { key: 'ey-deck-cashpool', w: 1600, h: 1262, alt: 'EY CAFTA deck slide “Cash Pooling: INR 37.2 Crore Annual Savings”: four pillars of optimisation and two headline figures', caption: 'Cash pooling: ₹12.0 Cr of deposit returns plus ₹25.2 Cr of borrowing removed.' },
      { key: 'ey-vol-1y', w: 1600, h: 1041, alt: 'Chart: USD/NGN daily change over the last 12 months, annualised volatility 43.47%', caption: 'USD/NGN over the last year: 43.47% volatility.' },
    ],
    links: [{ href: 'https://n92hmk.csb.app/', label: 'Try the USD/INR forecaster' }],
  },
  {
    id: 'finanalyse',
    title: 'Financial statement analysis',
    org: 'Nurix internal hackathon',
    role: 'PRD owner, 2-person team',
    period: 'April 2026',
    kind: 'Hackathon',
    summary: 'Worked on automated extraction of financial data and building a financial model of the company.',
    problem: [],
    did: [],
    result: ['From one annual report, the tool builds an Excel workbook with live formulas (the three statements, 20+ ratios, a forecast, WACC, DCF, DDM, comparables and Monte Carlo risk) and a Word report.'],
    figures: [],
    shots: [
      { key: 'finanalyse-workbook', w: 940, h: 1270, alt: 'Generated Excel workbook for Infosys: financial ratios sheet with liquidity, profitability, leverage, efficiency, per-share and DuPont sections for 2022 to 2024', caption: 'An output workbook for a listed company, with live formulas.' },
    ],
  },
];

/** Smaller things, shown compactly on the Work page. */
export const tools = [
  { title: 'DragonFire', text: 'A dragon on my Mac. I click it, talk, and it pastes a cleaned-up version of what I said into whatever app I am in.' },
  { title: 'Resume agent and ATS tracker', text: 'Tailors each application from verified evidence and scores the fit the way an applicant tracking system would.' },
  { title: 'Encrypted chat transfer', text: 'Hands a chat to another account through a relay I run myself.' },
  { title: 'MCP servers', text: 'Connect an AI assistant to my campus placement portal and to YouTube.' },
  { title: 'Inbox cleaner', text: 'Sorted 38,008 emails and moved 28,464 to Trash, with a full undo path and no permanent delete.' },
];

export interface Entry {
  title: string;
  org: string;
  role: string;
  period: string;
  text: string;
  points?: string[];
  figures?: Figure[];
  caseId?: string;
  shot?: Shot;
}

export interface Year { year: string; title: string; intro: string; entries: Entry[] }

export const journey: Year[] = [
  {
    year: '2023',
    title: 'Arriving at IIT Hyderabad',
    intro: 'I started a B.Tech in Materials Science & Metallurgical Engineering, and spent most of my time outside class learning how businesses work.',
    entries: [
      {
        title: 'Joining E-Cell',
        org: 'Entrepreneurship Cell, IIT Hyderabad',
        role: 'Assistant Manager, Corporate Relations & Marketing',
        period: 'August 2023 to April 2024',
        text: 'I joined the Entrepreneurship Cell on the corporate relations and marketing side. This is where I met the campus startups I would work with next.',
        points: [
          'Reached out to sponsors and partners, and ran the meetings and follow-ups that started new partnerships.',
          'Worked across PR, design, marketing, events and operations to keep the club running.',
        ],
      },
      {
        title: 'Picapool',
        org: 'Picapool, an IIT Hyderabad campus startup',
        role: 'Marketing Intern',
        period: 'October 2023 to February 2024',
        text: 'My first startup role. I ran market research, split the audience into segments, and pitched ad campaign ideas to the team.',
      },
    ],
  },
  {
    year: '2024',
    title: 'Moving to the money side',
    intro: 'In second year I took on sponsor deals and event budgets, and ran marketing for TEDx on campus.',
    entries: [
      {
        title: 'Corporate relations and finance',
        org: 'Entrepreneurship Cell, IIT Hyderabad',
        role: 'Manager, Corporate Relations & Finance',
        period: 'May 2024 to April 2025',
        text: 'I became the main point of contact for startups and companies working with E-Cell, and designed the sponsorship decks and proposals we sent to companies.',
      },
      {
        title: 'TEDx IIT Hyderabad',
        org: 'TEDxIITHyderabad',
        role: 'PR & Marketing Coordinator',
        period: 'May 2024 to April 2025',
        text: 'I ran social media promotion and event branding for the Tatv edition.',
        shot: { key: 'tedx-cert', w: 1600, h: 900, alt: 'TEDxIITHyderabad certificate presented to Shikhar Kansal as Public Relations and Marketing Coordinator for the 2024-25 tenure', caption: 'TEDx IIT Hyderabad, 2024-25 tenure.' },
      },
    ],
  },
  {
    year: '2025',
    title: 'Leading, and a first internship',
    intro: 'I did my first company internship, became Head of Corporate Relations & Finance at E-Cell, and reached the EY CAFTA final.',
    entries: [
      {
        title: 'RU Skilled',
        org: 'Kyrion Technologies (parent of RU Skilled and Techgyan)',
        role: 'Strategy & Business Intern',
        period: 'May to July 2025',
        text: 'I planned landing pages and ran the SEO campaigns behind them, streamlined how workshops ran, and built WhatsApp automation flows for lead generation and support.',
        figures: [
          { value: '40%', label: 'more organic traffic' },
          { value: '25%', label: 'more new users' },
          { value: '30%', label: 'higher workshop throughput' },
        ],
      },
      {
        title: 'Head of Corporate Relations & Finance',
        org: 'Entrepreneurship Cell, IIT Hyderabad',
        role: 'Head, leading a 15-member team',
        period: 'May 2025 to April 2026',
        text: 'I led a 15-member team handling ₹40L+ budgets. Our biggest test was E-MERGE 3.0 on 11 and 12 October 2025: planned on a ₹4L budget, run on 57% of it. I negotiated sponsor terms end to end; NPCI came in at ₹10.44L, with Innomet and Masters’ Union also on board.',
        figures: [
          { value: '160+', label: 'E-MERGE participants from 15 colleges' },
          { value: '57%', label: 'of the ₹4L budget used' },
          { value: '₹10.44L', label: 'NPCI sponsorship' },
        ],
        shot: { key: 'ecell-emerge-banner', w: 1600, h: 800, alt: 'E-Merge 3.0 banner from E-Cell IIT Hyderabad: Network. Compete. Thrive, with the Boardroom, Founders Forum, speaker sessions and networking tracks', caption: 'E-MERGE 3.0, October 2025.' },
      },
      {
        title: 'EY CAFTA Case Championship',
        org: 'Treasury360, with Rishabh Duggal',
        role: 'Finalist',
        period: 'October 2025',
        text: 'We measured a simulated exporter’s currency risk and found ₹37.2 crore a year through cash pooling.',
        caseId: 'ey-cafta',
      },
    ],
  },
  {
    year: '2026',
    title: 'Building products at Nurix AI',
    intro: 'I joined Nurix AI to build voice and chat agents for enterprise client demos. I started by building single agents by hand and ended by writing the tool my colleagues used to build the next ones.',
    entries: [
      {
        title: 'Nurix AI (now NuPlay)',
        org: 'Nurix AI',
        role: 'Product & Growth Intern',
        period: nurixDates,
        text: 'I delivered 53 voice and chat bots into client demos for 27 companies across 18 industries and 7 languages.',
        points: [
          'Audited 2,140 deals and 2,843 accounts to answer an open coverage question, and found an untapped vertical plus the CRM defects hiding it.',
          'Built a 3-party hold-and-verify booking flow for a hospitality group, and launched Danish, German and Dutch housekeeping voicebots.',
          'Tested releases over 80 recorded calls and sorted 12 faults by mechanism; ran 53 bilingual test scenarios for a Chennai-based lender.',
          'Guided 4 interns and presented in 8 customer meetings.',
        ],
      },
      { title: 'Financial statement analysis', org: 'Nurix internal hackathon', role: 'PRD owner', period: 'April 2026', text: 'Worked on automated extraction of financial data and building a financial model of the company.', caseId: 'finanalyse' },
      { title: 'Aria', org: 'Personal project', role: 'Product owner', period: 'April to September 2026', text: 'A 3D virtual human who speaks Hinglish; the wait for her first word is down 57%.', caseId: 'aria' },
      { title: 'NuPlay Electronics', org: 'Nurix AI', role: 'Built and ran the demo', period: 'April to September 2026', text: 'A 5-agent support crew, and the 19-day silent outage I traced and fixed.', caseId: 'nuplay-electronics' },
      { title: 'Agent Builder', org: 'Nurix AI', role: 'Conceived and shipped', period: 'June to September 2026', text: 'Setting up a new client’s voice agents went from 5 days by hand to 30 minutes; colleagues ran 7 later engagements on it.', caseId: 'agent-builder' },
      { title: 'Hisaab', org: 'My own startup', role: 'Founder', period: 'September 2026 to now', text: 'Asks why right after each UPI payment, so you see where your money went. In a closed test on Google Play.', caseId: 'hisaab' },
    ],
  },
];

export const nurixNumbers: Figure[] = [
  { value: '53', label: 'voice and chat bots delivered' },
  { value: '27', label: 'companies' },
  { value: '18', label: 'industries' },
  { value: '7', label: 'languages' },
];

export const skills = [
  { group: 'Product', items: 'Requirements and PRDs, funnel mapping, root cause analysis, competitive benchmarking, impact measurement.' },
  { group: 'Finance', items: 'FX volatility, cash pooling, hedging plans, DCF and DDM valuation, ratio analysis. Course: CIIB, NSE Academy & NYIF.' },
  { group: 'AI', items: 'Multi-agent voice crews, prompt design, LLM evaluation and test scenarios.' },
  { group: 'Tools', items: 'Python, SQL, Excel, Power BI, Google Sheets, HubSpot, Shopify and Salesforce integrations.' },
  { group: 'People', items: 'Sponsor negotiation, stakeholder management, cross-functional work, guiding interns.' },
];

export const education = [
  { title: 'B.Tech, Materials Science & Metallurgical Engineering', org: 'IIT Hyderabad', detail: '2027 · CGPA 7.15' },
  { title: 'Class XII, CBSE', org: 'LZEBRA Public School', detail: '2023 · 92.40%' },
  { title: 'Class X, CBSE', org: 'Narayana E-Techno School', detail: '2021 · 92.00%' },
];

export const interests = 'Outside work I take photographs, play basketball, follow equities and make long-form explainer video essays.';

/** The home page ledger: before and after, booked like entries in an account. */
export const ledger = [
  { id: 'agent-builder', what: 'Setting up a new client’s voice agents', where: 'Agent Builder, Nurix AI', before: '5 days by hand', after: '30 minutes', ratio: 30 / (5 * 24 * 60), note: 'An internal tool that writes a brief, plans the crew, and checks it against 4 quality gates. Colleagues ran 7 later engagements on it.' },
  { id: 'aria', what: 'Time to first word', where: 'Aria, personal project', before: '1,603 ms', after: '690 ms', ratio: 690 / 1603, note: 'Streaming speech and removing a fixed 700 ms delay on every turn cut the wait by 57%.' },
  { id: 'agent-builder', what: '4-agent crew build', where: 'Agent Builder, Nurix AI', before: '240 s+, failing', after: '123 s, 0 errors', ratio: 123 / 240, note: 'One short planning call, each agent written in parallel, and everything predictable built in plain code.' },
  { id: 'nuplay-electronics', what: 'Silent order-lookup outage', where: 'NuPlay Electronics, Nurix AI', before: '19 days unseen', after: '3 checks a day', ratio: null, note: 'A health check now runs a real order query 3 times a day and names the failure type.' },
] as const;

/** Home page: each skill with the project that shows it, for the active list. */
export const skillProof = [
  { group: 'Product', items: 'Requirements and PRDs, funnel mapping, root cause analysis, competitive benchmarking, impact measurement.', proof: 'nuplay-electronics', shot: 'nuplay-agent', w: 1600, h: 866, alt: 'NuPlay dashboard with the Order Tracking Agent ready for a call' },
  { group: 'AI', items: 'Multi-agent voice crews, prompt design, LLM evaluation and test scenarios.', proof: 'aria', shot: 'aria-scene', w: 1280, h: 813, alt: 'Aria, a 3D virtual human, standing in an alpine meadow scene' },
  { group: 'Finance', items: 'FX volatility, cash pooling, hedging plans, DCF and DDM valuation, ratio analysis. Course: CIIB, NSE Academy & NYIF.', proof: 'ey-cafta', shot: 'ey-forecaster-split', w: 1994, h: 950, alt: 'USD/INR forecaster with indicators on the left and a 6-month forecast on the right' },
  { group: 'Analysis tools', items: 'Python, SQL, Excel, Power BI, Google Sheets, HubSpot, Shopify and Salesforce integrations.', proof: 'finanalyse', shot: 'finanalyse-workbook', w: 940, h: 1270, alt: 'Generated Excel workbook of financial ratios for a listed company' },
  { group: 'People', items: 'Sponsor negotiation, stakeholder management, cross-functional work, guiding interns.', proof: null, shot: 'ecell-emerge-banner', w: 1600, h: 800, alt: 'E-MERGE 3.0 banner from E-Cell IIT Hyderabad' },
] as const;
