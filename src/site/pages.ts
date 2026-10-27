// Every page of the site, rendered to HTML at build time by the plugin in vite.config.ts.
import { cases, tools, journey, skills, education, interests, person, skillProof, nurixNumbers, type CaseStudy, type Figure } from './data.ts';
import { esc, page, shot, ext, mailto } from './layout.ts';

const caseById = (id: string) => cases.find((c) => c.id === id)!;
const paras = (xs: string[]) => xs.map((x) => `<p>${esc(x)}</p>`).join('');
const figs = (xs: Figure[], cls = 'figs') =>
  `<dl class="${cls}">${xs.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`;

/** The before → after figure with its plain-English label, so the number always says what it measures. */
function change(c: CaseStudy, size: 'xl' | 'l' | 'm' = 'l') {
  const h = c.headline;
  return `<div class="change change-${size}">
    <p class="change-fig">${h.before ? `<span class="was">${esc(h.before)}</span><span class="arrow" aria-hidden="true">→</span><span class="sr-only"> to </span>` : ''}<span class="now">${esc(h.after)}</span></p>
    <p class="change-label">${esc(h.label)}</p>
  </div>`;
}

/** Agent Builder has no shareable screenshot (client platform), so its flow is drawn as an interface fragment. */
const pipeline = (tone: 'dark' | 'light' = 'dark') => `
  <figure class="pipe pipe-${tone}">
    <ol>
      <li><strong>Brand website</strong><span>Up to 5 pages read in plain code</span></li>
      <li><strong>One-page brief</strong><span>The operator corrects it before any prompt exists</span></li>
      <li><strong>Plan, then every agent at once</strong><span>One short planning call, agents written in parallel</span></li>
      <li><strong>4 quality gates</strong><span>Including staged adversarial conversations</span></li>
      <li><strong>Voice agents ready for the client</strong><span>30 minutes in all, instead of about 5 days by hand</span></li>
    </ol>
    <figcaption>How Agent Builder turns a brand’s website into ready voice agents.</figcaption>
  </figure>`;

const caseLink = (c: CaseStudy) => `<a class="chev" href="/work/${c.id}/" aria-label="Read the ${esc(c.title)} case study">Read the case study</a>`;

// ---------------------------------------------------------------- Home

export function home() {
  const ab = caseById('agent-builder');
  const np = caseById('nuplay-electronics');
  const hs = caseById('hisaab');
  const ar = caseById('aria');
  const ey = caseById('ey-cafta');
  const fa = caseById('finanalyse');

  const half = (c: CaseStudy, tone: 'light' | 'dark', pic = c.shots[0]) => `
    <article class="tile tile-half tile-${tone} reveal">
      <div class="tile-text">
        <h3><a href="/work/${c.id}/">${esc(c.title)}</a></h3>
        <p class="tile-sub">${esc(c.summary)}</p>
        ${change(c, 'm')}
        ${caseLink(c)}
      </div>
      <a class="tile-media" href="/work/${c.id}/" tabindex="-1" aria-hidden="true">${shot(pic, { caption: false, sizes: '(max-width: 820px) 100vw, 46vw' })}</a>
    </article>`;

  const years = journey.map((y) => {
    const pick = {
      '2023': { key: 'ecell-logos', w: 1600, h: 213, alt: 'Logos of E-Cell IIT Hyderabad and partners: Innomet Advanced Materials, NPCI and Masters’ Union' },
      '2024': { key: 'tedx-cert', w: 1600, h: 900, alt: 'TEDxIITHyderabad certificate for Shikhar Kansal as PR and Marketing Coordinator, 2024-25' },
      '2025': { key: 'ecell-emerge-banner', w: 1600, h: 800, alt: 'E-MERGE 3.0 banner from E-Cell IIT Hyderabad' },
      '2026': { key: 'aria-scene', w: 1280, h: 813, alt: 'Aria, the 3D voice companion, in an alpine meadow scene' },
    }[y.year]!;
    return { y, pick };
  });

  const body = `
  <section class="hero" aria-labelledby="h1">
    <div class="hero-sky" aria-hidden="true">
      <span class="star" style="left:13%;top:30%"></span><span class="star s2" style="left:86%;top:18%"></span>
      <span class="star s3" style="left:70%;top:34%"></span><span class="star s2" style="left:30%;top:12%"></span>
      <span class="star s3" style="left:92%;top:44%"></span>
      <div class="hero-clouds hero-clouds-b"></div>
      <div class="hero-ticker"><span>PRODUCT · GROWTH · AI VOICE AGENTS · HISAAB · </span><span>PRODUCT · GROWTH · AI VOICE AGENTS · HISAAB · </span></div>
      <div class="hero-clouds hero-clouds-a"></div>
    </div>
    <div class="hero-copy">
      <p class="hero-hi" aria-hidden="true">Hi, I’m</p>
      <h1 id="h1" class="hero-name">Shikhar Kansal</h1>
      <p class="hero-lead">I build AI products and measure what they change.</p>
      <p class="hero-sub">Product and growth. IIT Hyderabad, class of 2027.</p>
    </div>
    <div class="hero-actions">
        <a class="btn btn-sky" href="/work/">See my work</a>
        <a class="btn btn-glass" href="${person.resume}">Download resume</a>
    </div>
    <div class="hero-canvas" aria-hidden="true">
      <img class="hero-poster" src="/img/hero-poster.webp" width="1440" height="576" alt="" fetchpriority="high" decoding="async" />
      <canvas></canvas>
    </div>
    <div class="hero-nav">
      <nav aria-label="On this page">
        <ul>
          <li><a href="/work/">Work</a></li>
          <li><a href="#nb-h">Now building</a></li>
          <li><a href="/journey/">Journey</a></li>
          <li><a href="/about/">About</a></li>
          <li><a href="/recruiter/">30-second version</a></li>
        </ul>
      </nav>
      <button type="button" class="mode js-only" role="switch" aria-checked="true" data-mode><span>Interactive mode</span><span class="sw" aria-hidden="true"><span class="sw-state">ON</span></span></button>
    </div>
  </section>

  <section class="building" aria-labelledby="nb-h">
    <div class="wrap building-in">
      <div class="building-text reveal">
        <h2 id="nb-h" class="building-h"><img src="/img/hisaab-logo.svg" width="56" height="56" alt="" /> Now building: Hisaab</h2>
        <p>My startup in the making. After every UPI payment it asks one question, “What was that for?”, and shows where the month’s money went. It began as my entry to The Ken’s case competition. I kept going after Round 3 and rebuilt it as a product: private by design, with no internet permission, no account and no ads. It is in a free friends beta and heading for Google Play, with a one-time unlock instead of a subscription.</p>
        <div class="actions">
          <a class="btn btn-accent" href="/work/hisaab/">Read the Hisaab story</a>
          ${ext(hs.links![0].href, 'See the Hisaab page')}
        </div>
      </div>
      <dl class="building-figs reveal">
        ${hs.figures.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}
      </dl>
    </div>
  </section>

  <section class="gallery" aria-labelledby="work-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="work-h">Selected work</h2>
        <p>Six projects: two from my internship at Nurix AI, my startup, a competition, a hackathon and one of my own. Each number below is one I measured, with what it measures written under it.</p>
      </div>
    </div>

    <article class="tile tile-full tile-dark bend" aria-labelledby="t-ab">
      <div class="tile-center">
        <h3 id="t-ab"><a href="/work/agent-builder/">Agent Builder</a></h3>
        <p class="tile-sub">${esc(ab.summary)}</p>
        ${change(ab, 'xl')}
        ${caseLink(ab)}
      </div>
      <div class="wrap tile-wide">${pipeline('dark')}</div>
    </article>

    <article class="tile tile-full tile-light bend" aria-labelledby="t-np">
      <div class="tile-center">
        <h3 id="t-np"><a href="/work/nuplay-electronics/">NuPlay Electronics</a></h3>
        <p class="tile-sub">${esc(np.summary)}</p>
        ${change(np, 'l')}
        ${caseLink(np)}
      </div>
      <div class="wrap tile-wide"><a class="tile-media" href="/work/nuplay-electronics/" tabindex="-1" aria-hidden="true">${shot(np.shots[0], { caption: false, sizes: '(max-width: 820px) 100vw, 1200px' })}</a></div>
    </article>

    <div class="wrap tiles-two">
      ${half(hs, 'light')}
      ${half(ar, 'dark')}
    </div>
    <div class="wrap tiles-two flip">
      ${half(ey, 'dark', ey.shots[1])}
      ${half(fa, 'light')}
    </div>
  </section>

  <section class="bleed" aria-labelledby="bleed-h">
    <img src="/img/journey/nuplay-scenarios.webp" width="1440" height="900" alt="NuPlay customer cards showing test scenarios such as order status lookup, cancellation with refund, and returns" loading="lazy" decoding="async" />
    <div class="bleed-scrim" aria-hidden="true"></div>
    <h2 id="bleed-h" class="bleed-h">Nurix AI, in one number</h2>
    <div class="bleed-foot">
      <p class="bleed-fig">53</p>
      <p class="bleed-text">voice and chat bots I delivered into client demos, for 27 companies across 18 industries and 7 languages.</p>
    </div>
  </section>
  <div class="wrap bleed-more reveal">
    <p><strong>2,140</strong> deals and 2,843 accounts audited to find an untapped vertical</p>
    <p><strong>80</strong> recorded calls tested, 12 faults sorted by cause</p>
  </div>

  <section class="story" aria-labelledby="jr-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="jr-h">Four years, start to finish</h2>
        <p>From a first-year job finding sponsors for E-Cell to building AI products at Nurix and starting Hisaab. Scroll through it, or <a href="/journey/">read every step</a>.</p>
      </div>
      <div class="story-grid">
        <div class="story-pin" aria-hidden="true">
          <p class="story-year" data-year-display>${years[0].y.year}</p>
          <p class="story-chapter" data-chapter-display>${esc(years[0].y.title)}</p>
        </div>
        <ol class="story-steps">
          ${years
            .map(
              ({ y, pick }) => `<li class="story-step reveal" data-year="${y.year}" data-chapter="${esc(y.title)}">
                <div class="story-media">${shot({ ...pick, caption: '' }, { caption: false, sizes: '(max-width: 820px) 100vw, 52vw' })}</div>
                <h3><span class="story-y">${y.year}</span> ${esc(y.title)}</h3>
                <p>${esc(y.intro)}</p>
                <p class="story-what">${esc(y.entries.map((e) => e.title).join(', '))}</p>
              </li>`,
            )
            .join('')}
        </ol>
      </div>
      <p class="more reveal"><a class="btn btn-quiet" href="/journey/">Read the whole journey</a></p>
    </div>
  </section>

  <section class="skillset" aria-labelledby="sk-h">
    <div class="wrap skill-grid">
      <div class="skill-pic" aria-hidden="true">
        ${skillProof.map((s, i) => `<img class="${i === 0 ? 'on' : ''}" data-skill-img="${i}" src="/img/journey/${s.shot}-800.webp" width="${s.w}" height="${s.h}" alt="" loading="lazy" decoding="async" />`).join('')}
      </div>
      <div class="skill-side">
        <h2 id="sk-h" class="reveal">Skills, and the work behind them</h2>
        <ul class="skill-list">
          ${skillProof
            .map(
              (s, i) => `<li class="skill-row${i === 0 ? ' on' : ''}" data-skill="${i}">
                <button type="button" aria-expanded="${i === 0}" aria-controls="sk-${i}">${esc(s.group)}</button>
                <div id="sk-${i}" class="skill-more"${i === 0 ? '' : ' hidden'}>
                  <p>${esc(s.items)}</p>
                  ${s.proof ? `<a class="chev" href="/work/${s.proof}/">See it in ${esc(caseById(s.proof).title)}</a>` : `<a class="chev" href="/journey/?year=2025">See it at E-Cell</a>`}
                </div>
              </li>`,
            )
            .join('')}
        </ul>
      </div>
    </div>
  </section>

  <section class="contact" aria-labelledby="ct-h">
    <h2 id="ct-h" class="contact-lead">Hiring for APM, Product Analyst, Product Associate or Growth? Write to me.</h2>
    <a class="contact-mail" href="${mailto()}"><span>${esc(person.email.split('@')[0])}@</span><span>${esc(person.email.split('@')[1])}</span></a>
    <div class="contact-foot">
      <p><a href="tel:${person.phone}">${esc(person.phoneDisplay)}</a><br />IIT Hyderabad, India</p>
      <p class="contact-links"><a href="${person.linkedin}" rel="noopener">LinkedIn</a> <a href="${person.github}" rel="noopener">GitHub</a> <a href="${person.resume}">Resume</a></p>
    </div>
  </section>`;

  return page({
    title: 'Shikhar Kansal · Product and growth · IIT Hyderabad',
    description:
      'Shikhar Kansal, IIT Hyderabad class of 2027, seeking APM, Product Analyst and Growth roles. Agent Builder cut voice-agent setup for a new client from about 5 days to 30 minutes.',
    path: '/',
    nav: 'home',
    body,
  });
}

// ---------------------------------------------------------------- Work

export function work() {
  const body = `
  <section class="page-head">
    <div class="wrap">
      <h1 class="reveal">Work</h1>
      <p class="lede reveal">Six projects from my internship, competitions and my own time. Each page covers the problem, what I decided, and what changed, with the numbers I measured.</p>
    </div>
  </section>
  <section class="work-list" aria-label="Projects">
    ${cases
      .map(
        (c, i) => `<article class="tile tile-full ${i % 2 ? 'tile-light' : 'tile-dark'} bend" aria-labelledby="w-${c.id}">
          <div class="tile-center">
            <h2 id="w-${c.id}" class="tile-title"><a href="/work/${c.id}/">${esc(c.title)}</a></h2>
            <p class="tile-meta">${esc(c.org)} · ${esc(c.period)}</p>
            <p class="tile-sub">${esc(c.summary)}</p>
            ${change(c, 'l')}
            ${caseLink(c)}
          </div>
          <div class="wrap tile-wide">${c.id === 'agent-builder' ? pipeline('dark') : `<a class="tile-media" href="/work/${c.id}/" tabindex="-1" aria-hidden="true">${shot(c.shots[0], { caption: false, sizes: '(max-width: 820px) 100vw, 1200px', eager: i < 2 })}</a>`}</div>
        </article>`,
      )
      .join('')}
  </section>
  <section class="sec" aria-labelledby="tools-h">
    <div class="wrap two">
      <h2 id="tools-h" class="reveal">Tools I built for myself</h2>
      <dl class="rows-list reveal">${tools.map((t) => `<div><dt>${esc(t.title)}</dt><dd>${esc(t.text)}</dd></div>`).join('')}</dl>
    </div>
  </section>`;
  return page({
    title: 'Work · Shikhar Kansal',
    description: 'Case studies: Agent Builder, NuPlay Electronics, Hisaab, Aria, EY CAFTA Treasury360 and a financial statement analysis tool, each with the problem, decisions and measured result.',
    path: '/work/',
    nav: 'work',
    body,
  });
}

export function casePage(id: string) {
  const i = cases.findIndex((c) => c.id === id);
  const c = cases[i];
  const next = cases[(i + 1) % cases.length];
  const rest = c.shots.slice(1);
  const body = `
  <article>
    <header class="case-head">
      <div class="wrap head-split">
        <div>
          <p class="crumb reveal"><a href="/work/">All work</a></p>
          <h1 class="reveal">${esc(c.title)}</h1>
          <p class="lede reveal">${esc(c.summary)}</p>
          <div class="reveal">${change(c, 'xl')}</div>
        </div>
        <aside class="glance reveal" aria-label="At a glance">
          <dl>
            <div><dt>Where</dt><dd>${esc(c.org)}</dd></div>
            <div><dt>My role</dt><dd>${esc(c.role)}</dd></div>
            <div><dt>When</dt><dd>${esc(c.period)}</dd></div>
          </dl>
          <div class="glance-actions">
            ${c.links?.[0] ? `<a class="btn btn-accent" href="${c.links[0].href}" rel="noopener" target="_blank">${esc(c.links[0].label)}<span class="sr-only"> (opens in a new tab)</span></a>` : `<a class="btn btn-accent" href="${person.resume}">Download resume</a>`}
          </div>
        </aside>
      </div>
    </header>
    <div class="case-visual reveal${c.id === 'agent-builder' ? ' case-visual-dark' : ''}"><div class="wrap">${c.id === 'agent-builder' ? pipeline('dark') : shot(c.shots[0], { eager: true, sizes: '(max-width: 820px) 100vw, 1280px' })}</div></div>
    <div class="wrap case-body">
      <section class="case-sec reveal" aria-labelledby="p-h"><h2 id="p-h">The problem</h2><div>${paras(c.problem)}</div></section>
      <section class="case-sec reveal" aria-labelledby="d-h"><h2 id="d-h">What I did</h2><ul class="did">${c.did.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></section>
      <section class="case-sec reveal" aria-labelledby="r-h"><h2 id="r-h">The result</h2><div>${paras(c.result)}${figs(c.figures)}${c.links?.length ? `<p class="case-links">${c.links.map((l) => ext(l.href, l.label)).join('')}</p>` : ''}</div></section>
      ${c.learned ? `<section class="case-sec reveal" aria-labelledby="l-h"><h2 id="l-h">What I learned</h2><div><p class="said">${esc(c.learned)}</p></div></section>` : ''}
    </div>
    ${rest.length ? `<section class="sec sec-tight parch" aria-label="More screenshots"><div class="wrap shots${rest.length === 1 ? ' shots-one' : ''}">${rest.map((s) => `<div class="reveal">${shot(s, { sizes: '(max-width: 820px) 100vw, 50vw' })}</div>`).join('')}</div></section>` : ''}
    <section class="others" aria-labelledby="oth-h">
      <div class="wrap">
        <h2 id="oth-h" class="reveal">More case studies</h2>
        <ul class="others-list">
          ${cases.filter((o) => o.id !== c.id && o.shots[0]).slice(0, 3).map((o) => `<li class="reveal"><a href="/work/${o.id}/"><span class="others-img">${shot(o.shots[0], { caption: false, sizes: '(max-width: 820px) 100vw, 30vw' })}</span><strong>${esc(o.title)}</strong><span class="others-sub">${esc(o.headline.before ? `${o.headline.before} → ${o.headline.after}` : o.headline.after)}, ${esc(o.headline.label)}</span></a></li>`).join('')}
        </ul>
      </div>
    </section>
    <nav class="next" aria-label="Next case study">
      <div class="wrap"><a href="/work/${next.id}/"><span>Next case study</span><strong>${esc(next.title)}</strong></a></div>
    </nav>
  </article>`;
  return page({ title: `${c.title} · Shikhar Kansal`, description: c.summary, path: `/work/${c.id}/`, nav: 'work', body });
}

// ---------------------------------------------------------------- Journey

export function journeyPage() {
  const chooser = `
    <div class="chooser js-only" role="group" aria-label="Show one year">
      <button type="button" data-year="all" aria-pressed="true">All years</button>
      ${journey.map((y) => `<button type="button" data-year="${y.year}" aria-pressed="false">${y.year}</button>`).join('')}
    </div>`;
  const years = journey
    .map(
      (y) => `<section class="jyear" id="y${y.year}" data-year="${y.year}" aria-labelledby="yh${y.year}">
        <div class="wrap jyear-in">
          <div class="jyear-side reveal">
            <p class="year-big" aria-hidden="true">${y.year}</p>
            <h2 id="yh${y.year}"><span class="sr-only">${y.year}: </span>${esc(y.title)}</h2>
            <p>${esc(y.intro)}</p>
          </div>
          <div class="jentries">
            ${y.entries
              .map((e) => {
                const linked = e.caseId ? caseById(e.caseId) : undefined;
                return `<article class="jentry reveal">
                  <p class="jperiod">${esc(e.period)}</p>
                  <h3>${linked ? `<a href="/work/${linked.id}/">${esc(e.title)}</a>` : esc(e.title)}</h3>
                  <p class="jrole">${esc(e.role)} · ${esc(e.org)}</p>
                  <p>${esc(e.text)}</p>
                  ${e.points ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
                  ${e.figures ? figs(e.figures, 'figs figs-small') : ''}
                  ${e.shot ? shot(e.shot, { sizes: '(max-width: 820px) 100vw, 50vw' }) : linked?.shots[0] ? shot(linked.shots[0], { sizes: '(max-width: 820px) 100vw, 50vw' }) : ''}
                  ${linked ? caseLink(linked) : ''}
                </article>`;
              })
              .join('')}
          </div>
        </div>
      </section>`,
    )
    .join('');
  const body = `
  <section class="page-head">
    <div class="wrap">
      <div class="head-split">
        <div>
          <h1 class="reveal">My journey, 2023 to now</h1>
          <p class="lede reveal">I came to IIT Hyderabad to study materials science and found I cared more about how businesses work: where the money comes from, why people buy, and what a decision changes. Here is what I did about it, year by year.</p>
          <div class="actions reveal"><a class="btn btn-accent" href="${person.resume}">Download resume</a></div>
        </div>
        <nav class="glance reveal" aria-label="Years">
          <ol class="year-index">${journey.map((y) => `<li><a href="#y${y.year}"><span>${y.year}</span>${esc(y.title)}</a></li>`).join('')}</ol>
        </nav>
      </div>
      ${chooser}
    </div>
  </section>
  ${years}
  <section class="now-sec" aria-labelledby="now-h">
    <div class="wrap now-in reveal">
      <div>
        <h2 id="now-h">Now</h2>
        <p class="now-text">I graduate from IIT Hyderabad in 2027. Alongside college I am building <a href="/work/hisaab/">Hisaab</a>, my startup in the making, now in a free friends beta. ${esc(person.seeking)}</p>
      </div>
      <div class="actions"><a class="btn btn-accent" href="${mailto()}">Email me</a><a class="chev chev-light" href="${person.resume}">Download resume</a></div>
    </div>
  </section>`;
  return page({
    title: 'Journey · Shikhar Kansal',
    description: 'From E-Cell and a campus startup in 2023 to voice-agent products at Nurix AI and my own startup, Hisaab, in 2026, year by year.',
    path: '/journey/',
    nav: 'journey',
    body,
  });
}

// ---------------------------------------------------------------- About

export function about() {
  const body = `
  <section class="page-head">
    <div class="wrap">
      <h1 class="reveal">About me</h1>
      <p class="lede reveal">I’m Shikhar, a final-year B.Tech student at IIT Hyderabad. I like finding out how a business works: where the money comes from, why people buy, and what a decision changes.</p>
      <div class="actions reveal"><a class="btn btn-accent" href="${mailto()}">Email me</a><a class="chev" href="${person.resume}">Download resume</a></div>
    </div>
  </section>
  <section class="sec-tight" aria-label="More about me">
    <div class="wrap about-in">
      <div>
        <div class="prose">
          <p>I care about finance, fashion, management and marketing, and I like the ideating and strategy work that ties them together. I treat every decision as an experiment: make the call, measure what happened, then pick the next test.</p>
          <p>From January to July 2026 I was a Product & Growth Intern at Nurix AI (now NuPlay), building voice and chat agents for enterprise client demos; my client work continued through September. I started by building single agents by hand. By the end I had written the internal tool my colleagues used to build the next ones. Along the way I learned to trust a number only after I had checked it myself.</p>
          <p>${esc(interests)}</p>
        </div>
      </div>
      <div class="about-photo reveal"><img src="/img/photo-cutout.webp" width="336" height="1035" alt="Shikhar Kansal, standing, in a black polo and navy trousers" fetchpriority="high" /></div>
    </div>
  </section>
  <section class="sec parch" aria-labelledby="ak-h">
    <div class="wrap two">
      <h2 id="ak-h" class="reveal">Skills</h2>
      <dl class="rows-list reveal">${skills.map((s) => `<div><dt>${esc(s.group)}</dt><dd>${esc(s.items)}</dd></div>`).join('')}</dl>
    </div>
  </section>
  <section class="sec" aria-labelledby="ou-h">
    <div class="wrap">
      <h2 id="ou-h" class="reveal">Outside class</h2>
      <div class="outside">
        <div class="reveal">${shot({ key: 'ecell-emerge-banner', w: 1600, h: 800, alt: 'E-MERGE 3.0 banner from E-Cell IIT Hyderabad', caption: 'E-MERGE 3.0, the summit my E-Cell team ran on 57% of its ₹4L budget.' }, { sizes: '(max-width: 820px) 100vw, 50vw' })}</div>
        <div class="reveal">${shot({ key: 'tedx-cert', w: 1600, h: 900, alt: 'TEDxIITHyderabad certificate for Shikhar Kansal as PR and Marketing Coordinator, 2024-25', caption: 'PR and marketing for TEDx IIT Hyderabad, the Tatv edition.' }, { sizes: '(max-width: 820px) 100vw, 50vw' })}</div>
      </div>
    </div>
  </section>
  <section class="sec parch" aria-labelledby="ed-h">
    <div class="wrap two">
      <h2 id="ed-h" class="reveal">Education</h2>
      <table class="edu reveal">
        <caption class="sr-only">Education</caption>
        <thead><tr><th scope="col">Qualification</th><th scope="col">Where</th><th scope="col">Year and score</th></tr></thead>
        <tbody>${education.map((e) => `<tr><th scope="row">${esc(e.title)}</th><td>${esc(e.org)}</td><td>${esc(e.detail)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </section>`;
  return page({
    title: 'About · Shikhar Kansal',
    description: 'Shikhar Kansal: IIT Hyderabad, class of 2027. Product, finance and AI skills, education and contact.',
    path: '/about/',
    nav: 'about',
    body,
  });
}

// ---------------------------------------------------------------- 30-second view

export function recruiter() {
  const body = `
  <section class="page-head">
    <div class="wrap">
      <div class="head-split">
        <div>
          <h1 class="reveal">Shikhar in 30 seconds</h1>
          <p class="lede reveal">IIT Hyderabad, class of 2027. ${esc(person.seeking)}</p>
          <div class="actions reveal"><a class="btn btn-accent" href="${person.resume}">Download resume</a><a class="btn btn-quiet" href="${mailto()}">Email me</a><a class="btn btn-quiet" href="tel:${person.phone}">Call ${esc(person.phoneDisplay)}</a></div>
        </div>
        <aside class="glance reveal" aria-label="At a glance">
          <dl>
            <div><dt>Graduating</dt><dd>2027, B.Tech, IIT Hyderabad</dd></div>
            <div><dt>Latest role</dt><dd>Product & Growth Intern, Nurix AI (now NuPlay)</dd></div>
            <div><dt>Best result</dt><dd>A new client’s voice-agent setup: about 5 days by hand → 30 minutes</dd></div>
            <div><dt>Contact</dt><dd><a href="${mailto()}">${esc(person.email)}</a></dd></div>
          </dl>
        </aside>
      </div>
    </div>
  </section>
  <section class="sec sec-tight" aria-labelledby="r1">
    <div class="wrap two">
      <h2 id="r1" class="reveal">Best results</h2>
      <ul class="quick reveal">
        ${cases.map((c) => `<li class="quick-case">${c.shots[0] ? `<span class="quick-img">${shot(c.shots[0], { caption: false, sizes: '160px' })}</span>` : '<span class="quick-img quick-img-fig" aria-hidden="true">5 days → 30 min</span>'}<span><a href="/work/${c.id}/"><strong>${esc(c.title)}</strong></a><span class="quick-text">${esc(c.summary)}</span></span></li>`).join('')}
      </ul>
    </div>
  </section>
  <section class="sec sec-tight parch" aria-labelledby="r2">
    <div class="wrap two">
      <h2 id="r2" class="reveal">Experience</h2>
      <ul class="quick reveal">
        <li><strong>Product & Growth Intern, Nurix AI (now NuPlay)</strong><span>January to July 2026, client work to September. ${nurixNumbers.map((n) => `${n.value} ${n.label}`).join(', ')}. Agent Builder cut a new client’s voice-agent setup from about 5 days by hand to 30 minutes.</span></li>
        <li><strong>Strategy & Business Intern, RU Skilled (Kyrion Technologies)</strong><span>May to July 2025. Organic traffic up 40% and new users up 25% through SEO campaigns and landing pages.</span></li>
        <li><strong>Head, Corporate Relations & Finance, E-Cell IIT Hyderabad</strong><span>August 2023 to April 2026. Rose from Assistant Manager to lead a 15-member team handling ₹40L+ budgets; E-MERGE 3.0 for 160+ participants on 57% of its ₹4L budget.</span></li>
        <li><strong>PR & Marketing Coordinator, TEDx IIT Hyderabad</strong><span>May 2024 to April 2025. Social media promotion and event branding for the Tatv edition.</span></li>
      </ul>
    </div>
  </section>`;
  return page({
    title: 'Shikhar Kansal in 30 seconds',
    description: 'One page: who Shikhar Kansal is, his best results, experience, resume and contact.',
    path: '/recruiter/',
    nav: 'recruiter',
    body,
  });
}

export const caseIds = cases.map((c) => c.id);
