// Every page of the site, rendered to HTML at build time by the plugin in vite.config.ts.
import { cases, tools, journey, skills, education, interests, ledger, person, type CaseStudy, type Figure } from './data.ts';
import { esc, page, shot, ext, mailto } from './layout.ts';

const caseById = (id: string) => cases.find((c) => c.id === id)!;
const paras = (xs: string[]) => xs.map((x) => `<p>${esc(x)}</p>`).join('');
const figs = (xs: Figure[], cls = 'figs') =>
  `<dl class="${cls}">${xs.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`;

/** The before → after line, set large. */
function headline(c: CaseStudy, size: 'xl' | 'l' = 'l') {
  const h = c.headline;
  return `<p class="change change-${size}">${h.before ? `<span class="was">${esc(h.before)}</span><span class="arrow" aria-hidden="true">→</span><span class="sr-only"> to </span>` : ''}<span class="now">${esc(h.after)}</span></p><p class="change-label">${esc(h.label)}</p>`;
}

/** Agent Builder has no shareable screenshot (client platform), so its pipeline is drawn in HTML. */
const pipeline = () => `
  <figure class="pipe">
    <ol>
      <li><strong>Brand website</strong><span>Up to 5 pages read in plain code</span></li>
      <li><strong>One-page brief</strong><span>The operator corrects it before any prompt exists</span></li>
      <li><strong>Plan, then agents in parallel</strong><span>One short planning call, every agent written at once</span></li>
      <li><strong>4 quality gates</strong><span>Including staged adversarial conversations</span></li>
      <li><strong>Crew on the platform</strong><span>30 minutes, down from 5 days</span></li>
    </ol>
    <figcaption>How Agent Builder turns a website into a voice-agent crew.</figcaption>
  </figure>`;

function visual(c: CaseStudy, eager = false) {
  if (c.id === 'agent-builder') return pipeline();
  return c.shots[0] ? shot(c.shots[0], { eager }) : '';
}

// ---------------------------------------------------------------- Home

export function home() {
  const rows = ledger
    .map(
      (l, i) => `<tr>
        <th scope="row"><button type="button" class="pick" data-row="${i}" aria-pressed="${i === 0}">${esc(l.what)}</button><span class="where">${esc(l.where)}</span></th>
        <td class="was-cell" data-label="Before"><span class="strike">${esc(l.before)}</span></td>
        <td class="now-cell" data-label="After">${esc(l.after)}</td>
      </tr>`,
    )
    .join('');
  const first = ledger[0];
  const detail = `
    <div class="ledger-detail" aria-live="polite">
      <div class="bars" ${first.ratio == null ? 'hidden' : ''}>
        <div class="bar-row"><span class="bar-name">Before</span><span class="bar was-bar"></span><span class="bar-val" data-f="before">${esc(first.before)}</span></div>
        <div class="bar-row"><span class="bar-name">After</span><span class="bar now-bar" style="--r:${first.ratio == null ? 1 : Math.max(first.ratio, 0.012)}"></span><span class="bar-val" data-f="after">${esc(first.after)}</span></div>
      </div>
      <p class="ledger-note" data-f="note">${esc(first.note)}</p>
      <a class="arrow-link" data-f="link" href="/work/${first.id}/">Read the case study</a>
    </div>`;

  const featured = ['nuplay-electronics', 'hisaab', 'aria'].map(caseById);
  const flagship = caseById('agent-builder');

  const body = `
  <section class="hero" aria-labelledby="h1">
    <div class="wrap hero-in">
      <div class="hero-text reveal">
        <h1 id="h1">Shikhar Kansal</h1>
        <p class="hero-line">${esc(person.line)}</p>
        <p class="statement">${esc(person.statement)} At Nurix AI that meant cutting voice-agent setup from 5 days to 30 minutes.</p>
        <p class="hero-seek">${esc(person.seeking)}</p>
        <div class="actions">
          <a class="btn btn-accent" href="/work/">See my work</a>
          <a class="btn btn-quiet" href="${person.resume}">Download resume</a>
        </div>
        <p class="hero-quick"><a class="arrow-link" href="/recruiter/">Short on time? The 30-second version</a></p>
      </div>
      <div class="hero-photo reveal">
        <img src="/img/photo-cutout.webp" srcset="/img/photo-cutout-200.webp 200w, /img/photo-cutout.webp 336w" sizes="(max-width: 820px) 44vw, 336px" width="336" height="1035" alt="Shikhar Kansal, smiling, in a black polo with sunglasses tucked into the collar" fetchpriority="high" />
      </div>
    </div>
  </section>

  <section class="sec ledger" aria-labelledby="ledger-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="ledger-h">What changed, and by how much</h2>
        <p>Each line is a before and after from my own work, with the number I measured. Pick a line to see it to scale.</p>
      </div>
      <div class="ledger-grid reveal">
        <table class="ledger-table">
          <caption class="sr-only">Before and after figures from my projects</caption>
          <thead><tr><th scope="col">What</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${detail}
      </div>
    </div>
  </section>

  <section class="sec flagship" aria-labelledby="flag-h">
    <div class="wrap flag-in">
      <div class="flag-text reveal">
        <h2 id="flag-h">Agent Builder</h2>
        <p class="meta">${esc(flagship.org)} · ${esc(flagship.period)}</p>
        ${headline(flagship, 'xl')}
        <p>${esc(flagship.summary)}</p>
        <a class="btn btn-light" href="/work/agent-builder/">Read the case study</a>
      </div>
      <div class="reveal">${pipeline()}</div>
    </div>
  </section>

  <section class="sec" aria-labelledby="sel-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="sel-h">More of my work</h2>
        <p>Six projects in all, from a 5-agent support line to a treasury case. Each one has its own page: the problem, what I did, and the result.</p>
      </div>
      <div class="rows">
        ${featured
          .map(
            (c, i) => `<article class="row${i % 2 ? ' row-flip' : ''} reveal">
              <a class="row-img" href="/work/${c.id}/" tabindex="-1" aria-hidden="true">${shot(c.shots[0], { caption: false, sizes: '(max-width: 820px) 100vw, 55vw' })}</a>
              <div class="row-text">
                <p class="meta">${esc(c.kind)} · ${esc(c.period)}</p>
                <h3><a href="/work/${c.id}/">${esc(c.title)}</a></h3>
                <p>${esc(c.summary)}</p>
                ${headline(c)}
              </div>
            </article>`,
          )
          .join('')}
      </div>
      <p class="more reveal"><a class="arrow-link" href="/work/">All six projects</a></p>
    </div>
  </section>

  <section class="sec tint" aria-labelledby="jr-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="jr-h">From E-Cell to Nurix AI</h2>
        <p>Four years at IIT Hyderabad, each one a step closer to building products.</p>
      </div>
      <ol class="years">
        ${journey
          .map(
            (y) => `<li class="reveal"><a href="/journey/#y${y.year}"><span class="year">${y.year}</span><strong>${esc(y.title)}</strong><span>${esc(y.entries.map((e) => e.title).join(' · '))}</span></a></li>`,
          )
          .join('')}
      </ol>
      <p class="more reveal"><a class="arrow-link" href="/journey/">Read the whole journey</a></p>
    </div>
  </section>`;

  return page({
    title: 'Shikhar Kansal · Product and growth · IIT Hyderabad',
    description:
      'Shikhar Kansal, IIT Hyderabad class of 2027, looking for APM, Product Analyst, Product Associate and Growth roles. Agent Builder cut voice-agent setup from 5 days to 30 minutes. Case studies, journey and resume.',
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
  <section class="sec sec-tight" aria-label="Projects">
    <div class="wrap work-list">
      ${cases
        .map(
          (c, i) => `<article class="work-item${i === 0 ? ' work-first' : ''} reveal">
            <a class="work-visual" href="/work/${c.id}/" tabindex="-1" aria-hidden="true">${c.id === 'agent-builder' ? `<span class="big-change">${esc(c.headline.before!)} → ${esc(c.headline.after)}</span>` : shot(c.shots[0], { caption: false, sizes: '(max-width: 820px) 100vw, 50vw', eager: i < 2 })}</a>
            <div class="work-text">
              <p class="meta">${esc(c.kind)} · ${esc(c.period)}</p>
              <h2><a href="/work/${c.id}/">${esc(c.title)}</a></h2>
              <p class="work-org">${esc(c.org)} · ${esc(c.role)}</p>
              <p>${esc(c.summary)}</p>
              <a class="arrow-link" href="/work/${c.id}/" aria-label="Read the ${esc(c.title)} case study">Read the case study</a>
            </div>
          </article>`,
        )
        .join('')}
    </div>
  </section>
  <section class="sec tint" aria-labelledby="tools-h">
    <div class="wrap tools-in">
      <div class="sec-head reveal">
        <h2 id="tools-h">Tools I built for myself</h2>
        <p>Small things that take chores out of my own week.</p>
      </div>
      <dl class="tools reveal">${tools.map((t) => `<div><dt>${esc(t.title)}</dt><dd>${esc(t.text)}</dd></div>`).join('')}</dl>
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
      <div class="wrap">
        <p class="crumb reveal"><a href="/work/">All work</a></p>
        <h1 class="reveal">${esc(c.title)}</h1>
        <p class="meta reveal">${esc(c.org)} · ${esc(c.role)} · ${esc(c.period)}</p>
        <p class="lede reveal">${esc(c.summary)}</p>
        <div class="reveal">${headline(c, 'xl')}</div>
      </div>
    </header>
    <div class="wrap case-visual reveal">${visual(c, true)}</div>
    <div class="wrap case-body">
      <section class="case-sec reveal" aria-labelledby="p-h"><h2 id="p-h">The problem</h2><div>${paras(c.problem)}</div></section>
      <section class="case-sec reveal" aria-labelledby="d-h"><h2 id="d-h">What I did</h2><ul class="did">${c.did.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></section>
      <section class="case-sec reveal" aria-labelledby="r-h"><h2 id="r-h">The result</h2><div>${paras(c.result)}${figs(c.figures)}${c.links?.length ? `<p class="case-links">${c.links.map((l) => ext(l.href, l.label)).join('')}</p>` : ''}</div></section>
      ${c.learned ? `<section class="case-sec reveal" aria-labelledby="l-h"><h2 id="l-h">What I learned</h2><div><p class="said">${esc(c.learned)}</p></div></section>` : ''}
    </div>
    ${rest.length ? `<section class="sec sec-tight tint" aria-label="More screenshots"><div class="wrap shots${rest.length === 1 ? ' shots-one' : ''}">${rest.map((s) => `<div class="reveal">${shot(s, { sizes: '(max-width: 820px) 100vw, 50vw' })}</div>`).join('')}</div></section>` : ''}
    <nav class="next" aria-label="Next case study">
      <div class="wrap"><a href="/work/${next.id}/"><span>Next case study</span><strong>${esc(next.title)}</strong></a></div>
    </nav>
  </article>`;
  return page({
    title: `${c.title} · Shikhar Kansal`,
    description: c.summary,
    path: `/work/${c.id}/`,
    nav: 'work',
    body,
  });
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
                return `<article class="jentry${linked ? ' jentry-case' : ''} reveal">
                  <p class="meta">${esc(e.period)}</p>
                  <h3>${linked ? `<a href="/work/${linked.id}/">${esc(e.title)}</a>` : esc(e.title)}</h3>
                  <p class="jrole">${esc(e.role)} · ${esc(e.org)}</p>
                  <p>${esc(e.text)}</p>
                  ${e.points ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
                  ${e.figures ? figs(e.figures, 'figs figs-small') : ''}
                  ${e.shot ? shot(e.shot, { sizes: '(max-width: 820px) 100vw, 50vw' }) : ''}
                  ${linked ? `<a class="arrow-link" href="/work/${linked.id}/" aria-label="Read the ${esc(linked.title)} case study">Read the case study</a>` : ''}
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
      <h1 class="reveal">My journey, 2023 to now</h1>
      <p class="lede reveal">I came to IIT Hyderabad to study materials science and found I cared more about how businesses work: where the money comes from, why people buy, and what a decision changes. Here is what I did about it, year by year.</p>
      ${chooser}
    </div>
  </section>
  ${years}
  <section class="sec now-sec" aria-labelledby="now-h">
    <div class="wrap now-in reveal">
      <h2 id="now-h">Now</h2>
      <p class="statement">I graduate from IIT Hyderabad in 2027. ${esc(person.seeking)}</p>
      <div class="actions"><a class="btn btn-accent" href="${mailto()}">Email me</a><a class="btn btn-quiet" href="${person.resume}">Download resume</a></div>
    </div>
  </section>`;
  return page({
    title: 'Journey · Shikhar Kansal',
    description: 'From E-Cell and a campus startup in 2023 to building voice-agent products at Nurix AI in 2026, year by year.',
    path: '/journey/',
    nav: 'journey',
    body,
  });
}

// ---------------------------------------------------------------- About

export function about() {
  const body = `
  <section class="page-head about-head">
    <div class="wrap about-in">
      <div>
        <h1 class="reveal">About me</h1>
        <p class="lede reveal">I’m Shikhar, a final-year B.Tech student at IIT Hyderabad. I like finding out how a business works: where the money comes from, why people buy, and what a decision changes.</p>
        <div class="prose reveal">
          <p>I care about finance, fashion, management and marketing, and I like the ideating and strategy work that ties them together. I treat every decision as an experiment: make the call, measure what happened, then pick the next test.</p>
          <p>From January to July 2026 I was a Product & Growth Intern at Nurix AI (now NuPlay), building voice and chat agents for enterprise client demos; my client work continued through September. I started by building single agents by hand. By the end I had written the internal tool my colleagues used to build the next ones. Along the way I learned to trust a number only after I had checked it myself.</p>
          <p>${esc(interests)}</p>
        </div>
      </div>
      <div class="about-photo reveal"><img src="/img/photo-cutout.webp" width="336" height="1035" alt="Shikhar Kansal, standing, in a black polo and navy trousers" loading="lazy" /></div>
    </div>
  </section>
  <section class="sec tint" aria-labelledby="sk-h">
    <div class="wrap two">
      <h2 id="sk-h" class="reveal">Skills, by where I used them</h2>
      <dl class="skills reveal">${skills.map((s) => `<div><dt>${esc(s.group)}</dt><dd>${esc(s.items)}</dd></div>`).join('')}</dl>
    </div>
  </section>
  <section class="sec" aria-labelledby="ed-h">
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
      <h1 class="reveal">Shikhar Kansal in 30 seconds</h1>
      <p class="lede reveal">IIT Hyderabad, class of 2027. ${esc(person.seeking)}</p>
      <div class="actions reveal"><a class="btn btn-accent" href="${person.resume}">Download resume</a><a class="btn btn-quiet" href="${mailto()}">Email me</a><a class="btn btn-quiet" href="tel:${person.phone}">Call ${esc(person.phoneDisplay)}</a></div>
    </div>
  </section>
  <section class="sec sec-tight" aria-labelledby="r1">
    <div class="wrap two">
      <h2 id="r1" class="reveal">Best results</h2>
      <ul class="quick reveal">
        ${cases.map((c) => `<li><a href="/work/${c.id}/"><strong>${esc(c.title)}</strong></a><span>${esc(c.summary)}</span></li>`).join('')}
      </ul>
    </div>
  </section>
  <section class="sec sec-tight tint" aria-labelledby="r2">
    <div class="wrap two">
      <h2 id="r2" class="reveal">Experience</h2>
      <ul class="quick reveal">
        <li><strong>Product & Growth Intern, Nurix AI (now NuPlay)</strong><span>January to July 2026, client work to September. 53 bots for 27 companies across 18 industries and 7 languages; Agent Builder cut crew setup from 5 days to 30 minutes.</span></li>
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
    nav: 'none',
    body,
  });
}

export const caseIds = cases.map((c) => c.id);
