/**
 * Landing-page prepare flow — detailed step simulation aligned with ReportKit pipeline.
 */

export type FlowActor = {
  id: string;
  label: string;
  short: string;
};

export const FLOW_ACTORS: FlowActor[] = [
  { id: 'user', label: 'Operator', short: 'You' },
  { id: 'ui', label: 'Browser UI', short: 'UI' },
  { id: 'engine', label: 'Prepare engine', short: 'Prepare' },
  { id: 'data', label: 'Host API', short: 'API' },
  { id: 'mail', label: 'Cloudflare Mail', short: 'Mail' },
];

export type FlowPhase = {
  id: string;
  label: string;
};

export const FLOW_PHASES: FlowPhase[] = [
  { id: 'validate', label: 'Validate' },
  { id: 'plan', label: 'Plan' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'fetch', label: 'Fetch' },
  { id: 'merge', label: 'Merge' },
  { id: 'compose', label: 'Compose' },
  { id: 'send', label: 'Send' },
];

export type ComposeFormat = 'xls' | 'csv' | 'pdf';

export type MailStepId = 'validate' | 'zip' | 'post' | 'route' | 'confirm';

export type FlowStep = {
  id: string;
  phase: string;
  title: string;
  detail: string;
  signal?: string;
  active: string[];
  from?: string;
  to?: string;
  response?: boolean;
  self?: string;
  parallel?: boolean;
  validation?: string[];
  compose?: ComposeFormat;
  mailStep?: MailStepId;
  stats?: {
    weeks?: number;
    rows?: number;
    progress?: number;
    sql?: number;
    files?: ComposeFormat[];
  };
  durationMs: number;
};

export const FLOW_STEPS: FlowStep[] = [
  {
    id: 'v1',
    phase: 'validate',
    title: 'Client filter check',
    detail: 'Date range, company enum, and required fields validated in the browser before any AJAX.',
    active: ['user', 'ui'],
    validation: ['Dates in order', 'Span ≤ 6 months', 'Company selected'],
    stats: { progress: 4 },
    durationMs: 1400,
  },
  {
    id: 'v2',
    phase: 'validate',
    title: 'Server FilterValidator',
    detail: 'Host API runs FilterValidator — rejects bad filters with { error } before prepare starts.',
    signal: 'filter OK',
    active: ['ui', 'data'],
    from: 'ui',
    to: 'data',
    response: true,
    stats: { progress: 8 },
    durationMs: 1300,
  },
  {
    id: 'p1',
    phase: 'plan',
    title: 'Load week list',
    detail: 'Browser requests export weeks for the validated date window.',
    signal: 'GET /weeks',
    active: ['ui', 'data'],
    from: 'ui',
    to: 'data',
    stats: { progress: 14 },
    durationMs: 1300,
  },
  {
    id: 'p2',
    phase: 'plan',
    title: 'Weeks returned',
    detail: '9 fictional week chunks returned — operator selects W01, W02, W03.',
    signal: '9 weeks',
    active: ['data', 'ui'],
    from: 'data',
    to: 'ui',
    response: true,
    stats: { weeks: 9, progress: 20 },
    durationMs: 1200,
  },
  {
    id: 'p3',
    phase: 'plan',
    title: 'Prepare clicked',
    detail: 'Three weeks queued — concurrency capped at 3 per settings.prepare.',
    active: ['user', 'ui'],
    stats: { weeks: 3, progress: 24 },
    durationMs: 1100,
  },
  {
    id: 'pr1',
    phase: 'prepare',
    title: 'Prepare job started',
    detail: 'UI posts week selection to the in-browser prepare runner.',
    signal: 'POST /prepare',
    active: ['ui', 'engine'],
    from: 'ui',
    to: 'engine',
    stats: { progress: 30 },
    durationMs: 1300,
  },
  {
    id: 'pr2',
    phase: 'prepare',
    title: 'Secure store opened',
    detail: 'beginPrepare() allocates session scope — credentials encoded for the prepared store.',
    active: ['engine'],
    self: 'engine',
    stats: { progress: 36 },
    durationMs: 1200,
  },
  {
    id: 'f1',
    phase: 'fetch',
    title: 'Parallel fetch (≤3)',
    detail: 'W01 · W02 · W03 hit host API at once — live + archive DB queries only here.',
    active: ['engine', 'data'],
    parallel: true,
    stats: { progress: 48 },
    durationMs: 2200,
  },
  {
    id: 'f2',
    phase: 'fetch',
    title: 'Week rows merged',
    detail: '742 fictional rows deduped across chunks — mergeRows() in the browser.',
    signal: '742 rows',
    active: ['data', 'engine'],
    from: 'data',
    to: 'engine',
    response: true,
    stats: { rows: 742, progress: 58 },
    durationMs: 1400,
  },
  {
    id: 'm1',
    phase: 'merge',
    title: 'Store committed',
    detail: 'Prepared JSON committed to secure store — optional encrypt if under size ceiling.',
    active: ['engine'],
    self: 'engine',
    stats: { rows: 742, progress: 66, sql: 0 },
    durationMs: 1300,
  },
  {
    id: 'c1',
    phase: 'compose',
    title: 'Excel (.xls)',
    detail: 'HTML table compose in 400-row chunks — soft max 25k rows, no DB round-trip.',
    active: ['engine'],
    compose: 'xls',
    stats: { rows: 742, progress: 74, sql: 0, files: ['xls'] },
    durationMs: 1200,
  },
  {
    id: 'c2',
    phase: 'compose',
    title: 'CSV export',
    detail: 'Instant Blob download from prepared store — 400-row chunks, no overlay, no SQL.',
    active: ['engine'],
    compose: 'csv',
    stats: { rows: 742, progress: 82, sql: 0, files: ['xls', 'csv'] },
    durationMs: 900,
  },
  {
    id: 'c3',
    phase: 'compose',
    title: 'PDF statement',
    detail: 'In-browser compose with progress overlay — pages, PNR rows, ETA; Ping/Mute/Cancel on large exports.',
    active: ['engine'],
    compose: 'pdf',
    stats: { rows: 742, progress: 88, sql: 0, files: ['xls', 'csv', 'pdf'] },
    durationMs: 1800,
  },
  {
    id: 's1',
    phase: 'send',
    title: 'Email validated',
    detail: 'assessEmail() checks format, length ≤254, and blocks typos before send.',
    active: ['user', 'ui'],
    mailStep: 'validate',
    stats: { rows: 742, progress: 91, sql: 0, files: ['xls', 'csv', 'pdf'] },
    durationMs: 1200,
  },
  {
    id: 's2',
    phase: 'send',
    title: 'ZIP attachment built',
    detail: 'XLS + CSV + PDF bundled into report.zip — size checked against 25 MB mail limit.',
    active: ['ui', 'engine'],
    mailStep: 'zip',
    stats: { rows: 742, progress: 94, sql: 0, files: ['xls', 'csv', 'pdf'] },
    durationMs: 1300,
  },
  {
    id: 's3',
    phase: 'send',
    title: 'POST /send',
    detail: 'FormData with email + report_file posted to host {slug}/send endpoint.',
    signal: 'POST /send',
    active: ['ui', 'data'],
    from: 'ui',
    to: 'data',
    mailStep: 'post',
    stats: { rows: 742, progress: 96, sql: 0, files: ['xls', 'csv', 'pdf'] },
    durationMs: 1400,
  },
  {
    id: 's4',
    phase: 'send',
    title: 'Mail routed',
    detail: 'Host MailService forwards ZIP via Cloudflare Email Routing — fictional demo only.',
    signal: 'SMTP relay',
    active: ['data', 'mail'],
    from: 'data',
    to: 'mail',
    mailStep: 'route',
    stats: { rows: 742, progress: 98, sql: 0, files: ['xls', 'csv', 'pdf'] },
    durationMs: 1300,
  },
  {
    id: 's5',
    phase: 'send',
    title: 'Delivery confirmed',
    detail: '{ ok: true } returned — activity log records mail.success, toast shown in UI.',
    signal: '200 OK',
    active: ['mail', 'ui'],
    from: 'mail',
    to: 'ui',
    response: true,
    mailStep: 'confirm',
    stats: { rows: 742, progress: 100, sql: 0, files: ['xls', 'csv', 'pdf'] },
    durationMs: 1500,
  },
];

type LaneState =
  | { kind: 'none' }
  | { kind: 'connector'; from: string; to: string; label: string; response: boolean; mailStep?: MailStepId }
  | { kind: 'parallel' }
  | { kind: 'self'; actorId: string; label: string }
  | { kind: 'validation'; items: string[] }
  | { kind: 'compose'; format: ComposeFormat }
  | { kind: 'mail'; step: MailStepId };

const COMPOSE_LABELS: Record<ComposeFormat, string> = {
  xls: 'Excel .xls',
  csv: 'CSV chunked',
  pdf: 'PDF statement',
};

export function mountPrepareSequence(root: HTMLElement) {
  const titleEl = root.querySelector('[data-flow-title]');
  const detailEl = root.querySelector('[data-flow-detail]');
  const stepEl = root.querySelector('[data-flow-step]');
  const packet = root.querySelector('[data-flow-packet]');
  const connector = root.querySelector('[data-flow-connector]');
  const connectorLabel = root.querySelector('[data-flow-connector-label]');
  const parallelLane = root.querySelector('[data-flow-parallel]');
  const selfLane = root.querySelector('[data-flow-self]');
  const validationLane = root.querySelector('[data-flow-validation]');
  const composeLane = root.querySelector('[data-flow-compose]');
  const mailLane = root.querySelector('[data-flow-mail]');
  const replayBtn = root.querySelector('[data-flow-replay]');
  const phaseNodes = root.querySelectorAll('[data-flow-phase]');
  const actorNodes = root.querySelectorAll('[data-flow-actor]');
  const statWeeks = root.querySelector('[data-stat-weeks]');
  const statRows = root.querySelector('[data-stat-rows]');
  const statSql = root.querySelector('[data-stat-sql]');
  const fileChips = root.querySelectorAll('[data-flow-file]');
  const progressFill = root.querySelector('[data-flow-progress-fill]');
  const stage = root.querySelector('[data-flow-stage]');
  const actorsRow = root.querySelector('[data-flow-actors-row]');

  let timer = 0;
  let running = false;
  let loop = true;
  let stepIndex = 0;
  let runId = 0;
  let laneState: LaneState = { kind: 'none' };

  function actorIndex(id: string): number {
    return FLOW_ACTORS.findIndex((a) => a.id === id);
  }

  function setPhases(activePhase: string) {
    const order = FLOW_PHASES.map((p) => p.id);
    const activeIdx = order.indexOf(activePhase);
    phaseNodes.forEach((node) => {
      const id = node.getAttribute('data-flow-phase');
      const idx = order.indexOf(id || '');
      node.classList.remove('is-active', 'is-done');
      if (idx < activeIdx) node.classList.add('is-done');
      if (idx === activeIdx) node.classList.add('is-active');
    });
  }

  function setActors(active: string[]) {
    actorNodes.forEach((node) => {
      const id = node.getAttribute('data-flow-actor');
      node.classList.toggle('is-active', active.includes(id || ''));
    });
  }

  function setFileChips(files?: ComposeFormat[]) {
    const active = new Set(files || []);
    fileChips.forEach((chip) => {
      const fmt = chip.getAttribute('data-flow-file') as ComposeFormat | null;
      chip.classList.toggle('is-ready', !!fmt && active.has(fmt));
    });
  }

  function setStats(stats?: FlowStep['stats']) {
    if (!stats) return;
    if (typeof stats.weeks === 'number' && statWeeks) statWeeks.textContent = String(stats.weeks);
    if (typeof stats.rows === 'number' && statRows) statRows.textContent = stats.rows.toLocaleString();
    if (typeof stats.sql === 'number' && statSql) statSql.textContent = String(stats.sql);
    if (stats.files) setFileChips(stats.files);
    if (typeof stats.progress === 'number' && progressFill instanceof HTMLElement) {
      progressFill.style.width = `${stats.progress}%`;
    }
  }

  function hideLanes() {
    laneState = { kind: 'none' };
    [connector, parallelLane, selfLane, validationLane, composeLane, mailLane].forEach((el) => {
      if (el instanceof HTMLElement) el.hidden = true;
    });
    if (packet instanceof HTMLElement) packet.hidden = true;
  }

  function actorCard(id: string): HTMLElement | undefined {
    const idx = actorIndex(id);
    if (idx < 0 || !actorsRow) return undefined;
    return actorsRow.querySelectorAll('[data-flow-actor]')[idx] as HTMLElement | undefined;
  }

  function stageOffsetY(card: HTMLElement, gap = 16): number {
    if (!stage || !actorsRow) return 0;
    const stageRect = stage.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return cardRect.bottom - stageRect.top + gap;
  }

  function layoutConnector(from: string, to: string, label: string, response: boolean) {
    if (!(connector instanceof HTMLElement) || !(packet instanceof HTMLElement) || !actorsRow || !stage) return;

    const fromCard = actorCard(from);
    const toCard = actorCard(to);
    if (!fromCard || !toCard) return;

    const rowRect = actorsRow.getBoundingClientRect();
    const fromRect = fromCard.getBoundingClientRect();
    const toRect = toCard.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - rowRect.left;
    const x2 = toRect.left + toRect.width / 2 - rowRect.left;
    const y = stageOffsetY(fromCard, 14);

    connector.hidden = false;
    packet.hidden = false;
    connector.classList.toggle('is-response', response);
    if (connectorLabel) connectorLabel.textContent = label;

    connector.style.top = `${y}px`;
    connector.style.left = `${Math.min(x1, x2)}px`;
    connector.style.width = `${Math.max(Math.abs(x2 - x1), 24)}px`;

    packet.style.top = '50%';
    packet.style.left = '0';
    packet.style.marginTop = '-5px';
    packet.classList.remove('is-run');
    void packet.offsetWidth;
    packet.style.setProperty('--flow-end', `${Math.max(Math.abs(x2 - x1), 24)}px`);
    packet.classList.add('is-run');
  }

  function showConnector(from: string, to: string, label: string, response: boolean, mailStep?: MailStepId) {
    hideLanes();
    laneState = { kind: 'connector', from, to, label, response, mailStep };
    layoutConnector(from, to, label, response);
    if (mailStep) paintMailStep(mailStep, true);
  }

  function layoutBetweenActors(actorA: string, actorB: string, el: HTMLElement, gap = 18) {
    const cardA = actorCard(actorA);
    if (!cardA || !actorsRow) return;
    const cardB = actorCard(actorB);
    const rowRect = actorsRow.getBoundingClientRect();
    const aRect = cardA.getBoundingClientRect();
    const centerX = cardB
      ? (aRect.left + aRect.width / 2 + cardB.getBoundingClientRect().left + cardB.getBoundingClientRect().width / 2) / 2 -
        rowRect.left
      : aRect.left + aRect.width / 2 - rowRect.left;
    el.style.top = `${stageOffsetY(cardA, gap)}px`;
    el.style.left = `${centerX}px`;
    el.style.transform = 'translateX(-50%)';
  }

  function layoutUnderActor(actorId: string, el: HTMLElement, gap = 10, width = 88) {
    const card = actorCard(actorId);
    if (!card || !actorsRow) return;
    const rowRect = actorsRow.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const centerX = cardRect.left + cardRect.width / 2 - rowRect.left;
    el.style.top = `${stageOffsetY(card, gap)}px`;
    el.style.left = `${centerX - width / 2}px`;
    el.style.transform = 'none';
  }

  function layoutParallel() {
    if (!(parallelLane instanceof HTMLElement)) return;
    layoutBetweenActors('engine', 'data', parallelLane, 18);
  }

  function showParallel() {
    hideLanes();
    laneState = { kind: 'parallel' };
    if (parallelLane instanceof HTMLElement) {
      parallelLane.hidden = false;
      layoutParallel();
      parallelLane.querySelectorAll('[data-par-lane]').forEach((lane, i) => {
        lane.classList.remove('is-run');
        void (lane as HTMLElement).offsetWidth;
        window.setTimeout(() => lane.classList.add('is-run'), i * 200);
      });
    }
  }

  function showSelf(actorId: string, text: string) {
    hideLanes();
    laneState = { kind: 'self', actorId, label: text };
    if (selfLane instanceof HTMLElement) {
      selfLane.hidden = false;
      const label = selfLane.querySelector('[data-flow-self-label]');
      if (label) label.textContent = text;
      selfLane.setAttribute('data-self-actor', actorId);
      layoutUnderActor(actorId, selfLane, 8, 88);
      selfLane.classList.remove('is-run');
      void selfLane.offsetWidth;
      selfLane.classList.add('is-run');
    }
  }

  function showValidation(items: string[]) {
    hideLanes();
    laneState = { kind: 'validation', items };
    if (!(validationLane instanceof HTMLElement)) return;
    validationLane.hidden = false;
    layoutUnderActor('ui', validationLane, 12, 260);
    validationLane.querySelectorAll('[data-val-item]').forEach((node, i) => {
      const item = items[i];
      node.textContent = item || '';
      node.classList.remove('is-pass');
      if (item) {
        window.setTimeout(() => node.classList.add('is-pass'), 180 + i * 280);
      }
    });
  }

  function showCompose(format: ComposeFormat) {
    hideLanes();
    laneState = { kind: 'compose', format };
    if (!(composeLane instanceof HTMLElement)) return;
    composeLane.hidden = false;
    layoutUnderActor('engine', composeLane, 12, 280);
    composeLane.querySelectorAll('[data-compose-fmt]').forEach((node) => {
      const fmt = node.getAttribute('data-compose-fmt');
      node.classList.remove('is-active', 'is-done');
      if (fmt === format) node.classList.add('is-active');
      else if (fmt && isFormatBefore(fmt as ComposeFormat, format)) node.classList.add('is-done');
    });
    const bar = composeLane.querySelector('[data-compose-bar]');
    if (bar instanceof HTMLElement) {
      bar.classList.remove('is-run');
      void bar.offsetWidth;
      bar.classList.add('is-run');
    }
    const label = composeLane.querySelector('[data-compose-label]');
    if (label) label.textContent = COMPOSE_LABELS[format];
  }

  function isFormatBefore(a: ComposeFormat, b: ComposeFormat): boolean {
    const order: ComposeFormat[] = ['xls', 'csv', 'pdf'];
    return order.indexOf(a) < order.indexOf(b);
  }

  function paintMailStep(step: MailStepId, underConnector = false) {
    if (!(mailLane instanceof HTMLElement)) return;
    mailLane.hidden = false;
    layoutBetweenActors('ui', 'mail', mailLane, underConnector ? 44 : 16);
    mailLane.querySelectorAll('[data-mail-step]').forEach((node) => {
      const id = node.getAttribute('data-mail-step');
      node.classList.remove('is-active', 'is-done');
      if (id === step) node.classList.add('is-active');
      else if (id && isMailBefore(id as MailStepId, step)) node.classList.add('is-done');
    });
  }

  function showMailStep(step: MailStepId) {
    hideLanes();
    laneState = { kind: 'mail', step };
    paintMailStep(step, false);
  }

  function isMailBefore(a: MailStepId, b: MailStepId): boolean {
    const order: MailStepId[] = ['validate', 'zip', 'post', 'route', 'confirm'];
    return order.indexOf(a) < order.indexOf(b);
  }

  function relayoutLane() {
    switch (laneState.kind) {
      case 'connector':
        layoutConnector(laneState.from, laneState.to, laneState.label, laneState.response);
        if (laneState.mailStep) paintMailStep(laneState.mailStep, true);
        break;
      case 'parallel':
        layoutParallel();
        break;
      case 'self':
        layoutUnderActor(laneState.actorId, selfLane as HTMLElement, 8, 88);
        break;
      case 'validation':
        layoutUnderActor('ui', validationLane as HTMLElement, 12, 260);
        break;
      case 'compose':
        layoutUnderActor('engine', composeLane as HTMLElement, 12, 280);
        break;
      case 'mail':
        layoutBetweenActors('ui', 'mail', mailLane as HTMLElement, 16);
        break;
      default:
        break;
    }
  }

  function renderStep(step: FlowStep, token: number): Promise<void> {
    return new Promise((resolve) => {
      if (token !== runId) {
        resolve();
        return;
      }

      if (titleEl) titleEl.textContent = step.title;
      if (detailEl) detailEl.textContent = step.detail;
      if (stepEl) stepEl.textContent = `Step ${FLOW_STEPS.indexOf(step) + 1} of ${FLOW_STEPS.length}`;
      setPhases(step.phase);
      setActors(step.active);
      setStats(step.stats);

      if (step.validation?.length) {
        showValidation(step.validation);
      } else if (step.parallel) {
        showParallel();
      } else if (step.compose) {
        showCompose(step.compose);
      } else if (step.self) {
        showSelf(step.self, step.title);
      } else if (step.from && step.to) {
        const label = step.signal || (step.response ? 'response' : 'request');
        showConnector(step.from, step.to, label, !!step.response, step.mailStep);
      } else if (step.mailStep) {
        showMailStep(step.mailStep);
      } else {
        hideLanes();
      }

      timer = window.setTimeout(() => {
        if (token === runId) resolve();
      }, step.durationMs);
    });
  }

  function resetVisual() {
    hideLanes();
    phaseNodes.forEach((n) => n.classList.remove('is-active', 'is-done'));
    actorNodes.forEach((n) => n.classList.remove('is-active'));
    fileChips.forEach((c) => c.classList.remove('is-ready'));
    if (progressFill instanceof HTMLElement) progressFill.style.width = '0%';
    if (statWeeks) statWeeks.textContent = '—';
    if (statRows) statRows.textContent = '0';
    if (statSql) statSql.textContent = '—';
  }

  async function runFlow() {
    if (running) return;
    const token = ++runId;
    running = true;
    resetVisual();

    for (let i = 0; i < FLOW_STEPS.length; i += 1) {
      if (token !== runId) return;
      stepIndex = i;
      await renderStep(FLOW_STEPS[i], token);
    }

    if (token !== runId) return;

    running = false;
    stepIndex = FLOW_STEPS.length;
    if (loop) {
      timer = window.setTimeout(() => {
        if (token !== runId) return;
        stepIndex = 0;
        void runFlow();
      }, 3200);
    }
  }

  replayBtn?.addEventListener('click', () => {
    window.clearTimeout(timer);
    runId += 1;
    loop = true;
    stepIndex = 0;
    running = false;
    void runFlow();
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !running && stepIndex === 0) {
        void runFlow();
      }
    },
    { threshold: 0.15 }
  );
  observer.observe(root);

  const resizeObserver = new ResizeObserver(() => relayoutLane());
  if (stage) resizeObserver.observe(stage);
  window.addEventListener('resize', relayoutLane);

  return () => {
    window.clearTimeout(timer);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('resize', relayoutLane);
  };
}
