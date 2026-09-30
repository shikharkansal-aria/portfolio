// Island content for the universe. Every claim traces to career-kb, TRACK-RECORD, the resume or content.ts.
// Numbers shared with content.ts must match it exactly.
import type { Island } from './universe/types';

export const islands: Island[] = [
  {
    id: 'agent-builder',
    title: 'Agent Builder',
    tier: 'flagship',
    tagline: 'Turns a brand’s website into a voice-agent crew in 30 minutes.',
    context: 'Nurix AI · internal platform · Jun–Sep 2026',
    scope: 'work',
    metric: { before: '5 days', after: '30 min', label: 'to set up a client voice-agent crew' },
    what:
      'An internal tool that takes a company website, a use case and a workspace, and produces a checked crew of voice agents with a demo page. Colleagues ran 7 later client engagements on it.',
    pipeline: [
      { label: 'Inputs', detail: 'The operator gives a workspace, a company URL and the workflow to build.' },
      { label: 'Read the site', detail: 'Plain code scrapes up to 5 pages with no model call, so the facts come from the site itself.' },
      { label: 'Editable brief', detail: 'A model distills a one-page company brief that the operator corrects before anything is written.' },
      { label: 'Plan and write', detail: 'One short planning call sets the crew, then each agent is written in parallel while predictable parts are built in code.' },
      { label: 'Check', detail: 'Each prompt is validated and adversarial conversations are simulated and graded. Nothing is written until the crew passes.' },
      { label: 'Preview', detail: 'The operator sees the crew graph and its artifacts before anything is created.' },
      { label: 'Provision', detail: 'The tool creates the crew, links the agents, publishes, and wires the tools and demo page, with status on every step.' },
    ],
    stack: ['LLM agents', 'Prompt validation', 'Web scraping', 'Parallel generation', 'Crew handoffs'],
    decisions: [
      {
        choice: 'Split one big generation into a plan plus parallel writes',
        rejected: 'One large request for the whole crew',
        why: 'A 4-agent crew hit the model’s output limit and failed after more than 240 seconds, so I split the job and it now finishes in 123 seconds.',
      },
      {
        choice: 'An editable brief before any prompt is generated',
        rejected: 'Asking the operator to proofread the generated prompts',
        why: 'Correcting one page about the company is faster than reading thousands of words of prompt.',
      },
      {
        choice: 'Quality gates before speed work',
        why: 'Speed only helps if the output is right, so I built the checks first and let nothing reach the platform until a crew passed them.',
      },
      {
        choice: 'Preview, then create, in a fixed order',
        why: 'Creating the crew, then linking, publishing and wiring tools in one set order fixed the unconnected nodes I kept finding.',
      },
      {
        choice: 'Site scraping in plain code',
        rejected: 'Sending pages through a model',
        why: 'Plain code is cheap and predictable, so I kept the model for the brief, where judgment is needed.',
      },
    ],
    runs: 'Internal web tool. Nothing is written to the platform until checks pass. Colleagues ran 7 later client engagements on it.',
    numbers: [
      { value: '5 days → 30 min', label: 'setup time per client crew, manual build vs the builder' },
      { value: '240 s+ → 123 s', label: '4-agent crew build, from failing to 0 validation errors' },
      { value: '4', label: 'quality gates, one of them a simulated adversarial conversation' },
      { value: '7', label: 'later client engagements run by colleagues' },
    ],
    myPart:
      'I conceived it, designed the flow and shipped it. The 5 days to 30 minutes figure is my own comparison of a manual build with client-ready wiring against the builder.',
    learned:
      'I judge an internal tool by adoption: do colleagues pick it up without me in the room? Seven engagements told me more than any demo.',
    caseId: 'agent-builder',
  },
  {
    id: 'outage',
    title: 'The demo that said “Live”',
    tier: 'second',
    scope: 'work',
    tagline: 'A green light hid a 19-day outage. My first fix failed too.',
    context: 'Nurix AI · electronics retail demo · Aug–Sep 2026',
    metric: { before: '19 days silent', after: '3 checks/day', label: 'order-lookup outage, found and fixed' },
    what:
      'Our longest-running demo was a voice agent that looks up order status for an electronics store. I traced why every lookup had failed, fixed it twice, and added a health check that runs a real order query.',
    beats: [
      {
        when: '22 Aug',
        title: 'Lookups start failing',
        detail: 'Every order lookup was rejected across 4 sub-agents. The agent apologised instead of giving wrong answers, and the console kept showing “Live”.',
      },
      {
        title: 'The cause',
        detail: 'I tested one call at a time until I found it: the store connection used a token that expires every 24 hours.',
      },
      {
        when: '10 Sep',
        title: 'First fix',
        detail: 'I built a new connection, re-pointed 16 tool bindings and confirmed it on a live call. Lookups worked again, 19 days after they broke.',
      },
      {
        title: 'It came back',
        detail: 'The outage returned because my first fix also used a 24-hour token.',
      },
      {
        when: '18 Sep',
        title: 'Second fix and the write-up',
        detail: 'I switched to a token that does not expire, republished, and wrote the incident note in first person: “That is on me.”',
      },
      {
        title: 'Monitoring that tests the claim',
        detail: 'A check now runs a real order query, alerts on failure, reports 3 times a day and names the failure type: expired token, frozen store or missing permission.',
      },
    ],
    stack: ['Voice agents', 'Tool bindings', 'Token auth', 'Scheduled health check', 'Slack alerts'],
    decisions: [
      {
        choice: 'Test one call at a time to find the cause',
        rejected: 'Trusting the green “Live” status',
        why: 'The status only showed that the agent was published, so I had to run the real lookup myself.',
      },
      {
        choice: 'A health check built on a real order query',
        rejected: 'A ping that shows the store is up',
        why: 'Health should mean the store responds and an order lookup works, because that is what a caller needs.',
      },
      {
        choice: 'A check that names the failure type',
        why: 'An expired token, a frozen store and a missing permission each need a different fix, so the next person should not have to dig.',
      },
      {
        choice: 'A first-person incident note',
        why: 'My first fix had the same flaw as the original, and I wanted the record to say so.',
      },
    ],
    runs: 'The health check runs on a schedule, posts to Slack on failure, and sends reports 3 times a day.',
    numbers: [
      { value: '19 days', label: 'order lookups failing before the first fix' },
      { value: '24 h', label: 'token expiry, the root cause both times' },
      { value: '16', label: 'tool bindings re-pointed' },
      { value: '3× / day', label: 'health reports' },
    ],
    myPart: 'I diagnosed it, fixed it, wrote the incident note and built the monitoring.',
    learned:
      'A green status light means nothing until someone tests what it claims. For every dashboard I now ask what real action the light checks.',
    caseId: 'outage',
  },
  {
    id: 'hisaab',
    title: 'Hisaab',
    tier: 'mid',
    scope: 'competition',
    tagline: 'An Android app that names small UPI transfers in one tap.',
    context: 'The Ken agentic-commerce case competition (₹20L) · Sep 2026 · Android',
    metric: { before: '77% can’t track', after: '1 tap each', label: 'students who can’t account for small UPI transfers → one tap to name a payee' },
    what:
      'Bank apps show where money went, never what it was for. Hisaab reads UPI payment notifications, asks you to name a payee once with a one-tap category, and reuses that label next time. The core app keeps your data on the phone.',
    pipeline: [
      { label: 'Payment notification', detail: 'The app reads the UPI payment notification, so it needs no SMS or accessibility permission.' },
      { label: 'Parse by rules', detail: 'A file of 14 parsing rules pulls out the amount and payee, so a new bank format is a data change.' },
      { label: 'Guard and match', detail: 'Duplicate and reconciliation checks stop the same payment being counted twice.' },
      { label: 'One-tap question', detail: 'For a new payee, a notification offers up to 3 category buttons.' },
      { label: 'Remember the payee', detail: 'Later payments to that person reuse the label, and the app asks again only when an amount falls outside their usual range.' },
      { label: 'Month view', detail: 'A month screen and a position card show where the money went.' },
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'Room', 'WorkManager', 'Kotest'],
    decisions: [
      {
        choice: 'Payment notifications',
        rejected: 'Reading SMS or using an accessibility service',
        why: 'Those permissions risk Play Store rejection, and I wanted an app a student could install from the store.',
      },
      {
        choice: 'Room database',
        rejected: 'SQLDelight',
        why: 'We had no iOS plan, so cross-platform storage would have added cost for nothing.',
      },
      {
        choice: 'A separate module for the only network code, with a socket-counting test',
        why: 'The test proves the core app makes zero network calls: it counts sockets and fails the build if one opens.',
      },
      {
        choice: 'Parsing rules kept as data',
        why: 'When a bank changes its notification wording, the rules file changes and the code stays the same.',
      },
      {
        choice: 'No streaks and no re-engagement nags',
        why: 'A money app that guilts students repeats what they already avoid, so a build task fails if the app ever shows a streak, a grade or an exclamation mark.',
      },
    ],
    runs: 'Runs on the phone with no account and works offline. The core app makes no network calls.',
    numbers: [
      { value: '26', label: 'students surveyed before any code' },
      { value: '77%', label: 'named small UPI transfers as spending they can’t account for' },
      { value: '8,541', label: 'lines of Kotlin, with 22 test files' },
      { value: 'Round 2', label: 'of the ₹20L competition' },
    ],
    myPart: 'Built for The Ken case competition. I surveyed 26 students to check the problem was real.',
    learned:
      'Field-testing taught me more than the plan did. The first build broke 7 of our own design rules within 20 minutes of real use, so I turned some of those rules into build checks.',
    caseId: 'hisaab',
  },
  {
    id: 'aria',
    title: 'Aria',
    tier: 'mid',
    scope: 'personal',
    tagline: 'A Hinglish-speaking 3D voice companion I directed as product owner.',
    context: 'Personal project · Apr–Sep 2026 · real-time 3D voice companion',
    metric: { before: '1,603 ms', after: '690 ms', label: 'before Aria starts speaking' },
    what:
      'A full-body 3D anime companion you talk to in Hinglish. She listens, answers through a language model, and speaks with lip-sync and mood-driven gestures.',
    pipeline: [
      { label: 'You speak', detail: 'The browser sends your microphone audio to a speech-to-text service.' },
      { label: 'Speech to text', detail: 'Deepgram transcribes what you say as you say it.' },
      { label: 'Claude replies', detail: 'A small, fast Claude model writes the answer with hidden mood tags.' },
      { label: 'Streaming voice', detail: 'A streaming text-to-speech voice starts audio before the whole reply exists.' },
      { label: 'Face and body', detail: 'Mood tags drive expression and gestures, and the voice drives lip-sync on the 3D model.' },
    ],
    stack: ['Node.js', 'three.js', 'Claude', 'Deepgram', 'ElevenLabs', 'Claude Code'],
    decisions: [
      {
        choice: 'One paid voice layer',
        rejected: 'A fully local, free speech stack',
        why: 'I tested both in Hindi. The only local Hindi voice was male and sounded uncanny, so I kept the paid voice and dropped the local stack.',
      },
      {
        choice: 'First-audio latency as the number to beat',
        why: 'A long pause breaks the feeling of talking to a person, so I moved to streaming speech and removed a fixed 700 ms delay on every turn.',
      },
      {
        choice: 'Orchestrating existing models',
        rejected: 'Training a model of my own',
        why: 'The product comes from how the parts work together, so I spent my time there.',
      },
      {
        choice: 'Leave a failing check failing',
        rejected: 'Tuning thresholds until a loudspeaker-vs-person sound classifier passed',
        why: 'It sat at 10% accuracy, which I read as a hardware limit, so I moved to speaker identification and left the check red in CI.',
      },
      {
        choice: 'A Mission Control dashboard for the build lanes',
        why: 'With 5 lanes working at once, I needed one screen to see who was working, who was waiting on me and which decisions were queued.',
      },
    ],
    runs: 'Runs locally on my laptop.',
    numbers: [
      { value: '1,603 → 690 ms', label: 'median time to first audio' },
      { value: '5', label: 'parallel Claude Code lanes' },
      { value: '96', label: 'commits' },
      { value: '86', label: 'automated specs' },
    ],
    myPart:
      'I designed it and directed 5 parallel Claude Code lanes as product owner: animation, voice and latency, memory, brain and tools, and QA. I wrote the specs, set priorities and made the calls each lane escalated. The lanes wrote the code.',
    learned:
      'The project’s rule was that a check which cannot fail is worse than no check. Directing AI builders taught me that the spec is the product: a lane only ships what I wrote down clearly.',
    caseId: 'aria',
  },
  {
    id: 'dragonfire',
    title: 'DragonFire',
    tier: 'moon',
    scope: 'personal',
    tagline: 'A desktop dragon that turns rough speech into clean text.',
    context: 'Personal project · macOS menu-bar app · Sep 2026',
    what:
      'A floating dragon on my Mac. I click it, talk, and it pastes a cleaned-up version of what I said into whatever app I am using. It breathes fire while I dictate.',
    pipeline: [
      { label: 'Click and talk', detail: 'One click on the dragon starts listening.' },
      { label: 'On-device speech', detail: 'Apple Speech turns my voice into words on the Mac, and the audio is never stored.' },
      { label: 'Two seconds of silence', detail: 'A pause of about two seconds tells it I am done.' },
      { label: 'Claude refines', detail: 'A script sends the words, my style profile and recent dictations to Claude through my Claude Code login.' },
      { label: 'Paste', detail: 'The cleaned text lands in the focused app through a simulated paste.' },
      { label: 'Background learner', detail: 'A second, cheaper Claude pass rewrites my style profile so the next dictation sounds more like me.' },
    ],
    stack: ['Swift', 'AppKit', 'Apple Speech', 'Claude Code CLI', 'zsh'],
    decisions: [
      {
        choice: 'On-device Apple Speech',
        why: 'I did not want a recording of my voice leaving the machine, so only the transcribed words go to Claude.',
      },
      {
        choice: 'Claude Code login',
        rejected: 'An API key',
        why: 'The app holds no secret, so there is nothing to leak or rotate.',
      },
      {
        choice: 'Tools switched off for the model',
        why: 'Refining text needs no file or shell access, so I took it away.',
      },
      {
        choice: 'Raw words as the fallback',
        why: 'If the model fails or times out, I still get exactly what I said, so a dictation is never lost.',
      },
    ],
    runs: 'Local menu-bar app on my Mac. It remembers its position and whether Fast mode, which uses a smaller model, is on.',
    numbers: [
      { value: '561', label: 'lines in one Swift file' },
      { value: '120', label: 'line cap on the learned style profile' },
      { value: '90 s', label: 'timeout before it falls back to raw words' },
    ],
    learned: 'A dictation tool has to fail safe. Returning the raw words mattered more than any polish.',
  },
  {
    id: 'job-hunt',
    title: 'Job-hunt engine',
    tier: 'small',
    scope: 'personal',
    tagline: 'A resume agent and ATS scorer that run applications like a pipeline.',
    context: 'Personal tools · Claude Code skill + local web app · 2026',
    what:
      'For each job description, an agent tailors a one-page resume from verified evidence and checks it. A separate tracker scores how well a resume fits a role and logs every application.',
    pipeline: [
      { label: 'Read the JD', detail: 'The agent pulls the requirements out of the job description.' },
      { label: 'Find evidence', detail: 'It looks each requirement up in my own notes and keeps only what I can back up.' },
      { label: 'Build the resume', detail: 'A spec file feeds a builder that produces the Word file in my usual format.' },
      { label: 'Run the checks', detail: 'A script checks the PDF is one page, audits repeated words and scores the ATS match.' },
      { label: 'Log it', detail: 'The application goes into the tracker with its score.' },
      { label: 'Read the score', detail: 'The tracker shows per-skill matches, a weighted total and a band from A to D.' },
    ],
    stack: ['Claude Code skill', 'Python', 'Vanilla JavaScript', 'Word and PDF output'],
    decisions: [
      {
        choice: 'Six weighted scoring dimensions plus knockouts',
        rejected: 'TF-IDF cosine similarity, a stability score, location match, an overqualification penalty, a keyword-stuffing penalty',
        why: 'I put the scoring approach in front of a four-model review and cut these because they rewarded the wrong things or guessed at the person.',
      },
      {
        choice: 'No minimum-years knockout',
        why: 'A years cutoff works as a proxy for age, so the score never rejects on it.',
      },
      {
        choice: 'No repeated content words across bullets',
        why: 'A resume that repeats the same verbs reads as padding, so the checker fails it.',
      },
      {
        choice: 'Only Claude subagents touch my private notes',
        rejected: 'Free models',
        why: 'The evidence base holds personal and client context, so it stays inside Claude.',
      },
    ],
    runs: 'Local. The resume agent is a Claude Code skill. The tracker is a static page with no build step, shown here with synthetic data.',
    numbers: [
      { value: '6', label: 'weighted scoring dimensions' },
      { value: '5', label: 'scoring ideas cut after a four-model review' },
      { value: '3,733', label: 'lines in the tracker, HTML included' },
    ],
    learned: 'Most of the work was deciding what the score should refuse to measure.',
  },
  {
    id: 'ai-router',
    title: 'Local AI router',
    tier: 'small',
    scope: 'personal',
    tagline: 'One command that sends cheap, non-private work to free models.',
    context: 'Personal tooling · macOS · 2026',
    what:
      'A command-line tool and Claude agent that hand bulk, low-stakes text jobs to free language models, so my paid Claude quota goes to reasoning and code.',
    pipeline: [
      { label: 'Claude delegates', detail: 'Claude passes a bulk, non-private job to the cheap-worker agent.' },
      { label: 'freellm CLI', detail: 'The agent calls my freellm command instead of talking to any model directly.' },
      { label: 'Primary gateway', detail: 'The request goes first to FreeLLMAPI, running on my Mac.' },
      { label: 'Fallback gateway', detail: 'If that fails, the same request goes to OmniRoute.' },
      { label: 'Result returns', detail: 'The agent checks the answer and hands Claude a short summary.' },
    ],
    stack: ['Shell', 'launchd', 'FreeLLMAPI', 'OmniRoute', 'Claude Code agent'],
    decisions: [
      {
        choice: 'A privacy gate on every task',
        why: 'Personal, placement or NDA data never goes to a free model, and the skill spells that out in plain rules.',
      },
      {
        choice: 'Fixed fallback order across two gateways',
        why: 'If one gateway goes down, the job moves to the other and still finishes.',
      },
      {
        choice: 'A plain command-line tool',
        rejected: 'MCP servers for the gateways',
        why: 'A command is simpler to test and to swap out.',
      },
      {
        choice: 'Free models for grunt work only',
        rejected: 'Running Claude Code itself on free models',
        why: 'Code edits and decisions need a model I trust, so those stay on Claude.',
      },
    ],
    runs: 'Local. The gateways start under launchd, and keys stay in files outside any project.',
    numbers: [
      { value: '104', label: 'lines in the freellm CLI' },
      { value: '2', label: 'gateways in the fallback chain' },
    ],
    myPart:
      'FreeLLMAPI, OmniRoute and edge0 are third-party open-source projects. My part is the freellm CLI, the routing and fallback order, the launchd setup, the cheap-worker agent and the privacy gate that keeps personal, placement and NDA data away from free models.',
    learned: 'The useful part was the rule about what may not go through the router.',
  },
  {
    id: 'claude-tools',
    title: 'Claude tools',
    tier: 'small',
    scope: 'personal',
    tagline: 'Three tools that give Claude my placement portal, YouTube and chat handoff.',
    context: 'Personal tools · Python MCP servers · 2026',
    what:
      'An MCP server for my campus placement portal, an MCP server for YouTube, and a tool that sends a Claude Code chat to another person. Each turns something I did by hand into a call Claude can make.',
    pipeline: [
      { label: 'Browser session', detail: 'The portal server reuses cookies from my own logged-in browser and never stores a password.' },
      { label: 'Portal client', detail: 'It calls the same endpoints the portal front end uses.' },
      { label: 'Render for Claude', detail: 'Results come back as short, readable text.' },
      { label: 'Confirm to write', detail: 'Tools that register or unregister me do nothing without confirm=True.' },
      { label: 'Chat transfer', detail: 'The chat tool strips credentials, sends the session to a relay over HTTPS and resumes it on the other side.' },
    ],
    stack: ['Python', 'MCP', 'Playwright', 'yt-dlp', 'SQLite'],
    decisions: [
      {
        choice: 'Cookies from my own browser session',
        rejected: 'Storing my password',
        why: 'The server never holds a credential it could leak.',
      },
      {
        choice: 'confirm=True on every write tool',
        why: 'Reading is safe by default, and a change to my applications needs an explicit yes.',
      },
      {
        choice: 'Paged transcripts and no API key in the YouTube server',
        rejected: 'Truncating long videos',
        why: 'A long video should be read in full, one page at a time.',
      },
      {
        choice: 'HTTPS only, with a typed count for bulk sends',
        why: 'The chat tool refuses plain http and asks me to type the number of chats before it sends a batch.',
      },
    ],
    runs: 'Local. Claude Code starts the MCP servers on my Mac. The chat relay is self-hosted.',
    numbers: [
      { value: '14', label: 'tools in the placement-portal server' },
      { value: '9', label: 'tools in the YouTube server' },
      { value: '249', label: 'end-to-end assertions in chat transfer' },
    ],
    learned: 'Read-only by default, with one explicit gate for writes, made these tools safe to leave on.',
  },
  {
    id: 'mailbox',
    title: 'Mailbox cleaner',
    tier: 'small',
    scope: 'personal',
    tagline: 'Trashed 28,464 emails, and by design it could delete none.',
    context: 'Personal tool · Gmail API · my university inbox · 2026',
    what:
      'A script that sorted my university inbox and moved the junk to Trash. It cannot delete anything permanently, and it has a full undo path.',
    pipeline: [
      { label: 'Inventory', detail: 'It lists every message in the mailbox.' },
      { label: 'Read headers', detail: 'It fetches sender and subject lines only.' },
      { label: 'Classify', detail: 'Rules mark each message keep or trash, the first matching rule wins, and the plan goes to a file I can review.' },
      { label: 'Apply', detail: 'It adds the Trash label in batches of 1,000.' },
      { label: 'Undo', detail: 'A full undo path takes moved messages back out of Trash.' },
    ],
    stack: ['Python', 'Gmail API', 'OAuth'],
    decisions: [
      {
        choice: 'The gmail.modify scope',
        rejected: 'Full mail access',
        why: 'That scope cannot permanently delete, so a bug in my code cannot destroy mail.',
      },
      {
        choice: 'Review the plan file before applying',
        why: 'I could check the classification before anything moved.',
      },
      {
        choice: 'Trash label with an undo path',
        why: 'If a rule is wrong, the undo path puts the mail back.',
      },
    ],
    runs: 'Local Python script that calls the Gmail API with my own login.',
    numbers: [
      { value: '38,008', label: 'emails sorted' },
      { value: '28,464', label: 'moved to Trash' },
      { value: '0', label: 'deleted permanently, by design' },
    ],
    learned: 'Picking the narrowest permission was the safety feature. Careful code came second.',
  },
];
