(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ID card: flip it with the button, a tap, or a flick. */

  const card = document.querySelector('[data-id-card]');
  if (card) {
    const inner = card.querySelector('.id-card-inner');
    const faces = Array.from(card.querySelectorAll('.id-face'));
    const flipButton = card.querySelector('.id-flip');
    let angle = 0;
    let drag = null;

    const settle = () => {
      const showingBack = Math.round(angle / 180) % 2 !== 0;
      faces[0].inert = showingBack;
      faces[1].inert = !showingBack;
      flipButton.setAttribute('aria-pressed', String(showingBack));
    };

    const spinTo = (target) => {
      angle = target;
      inner.style.transform = `rotateY(${angle}deg)`;
      settle();
    };

    faces[1].hidden = false;
    flipButton.hidden = false;
    card.classList.add('is-interactive');
    settle();

    flipButton.addEventListener('click', () => spinTo(angle + 180));

    card.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('a, button')) return;
      drag = { id: event.pointerId, x: event.clientX, start: angle, moved: false, last: event.clientX, time: performance.now(), velocity: 0 };
    });

    card.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        card.setPointerCapture(event.pointerId);
        card.classList.add('is-dragging');
      }
      const now = performance.now();
      drag.velocity = (event.clientX - drag.last) / Math.max(8, now - drag.time);
      drag.last = event.clientX;
      drag.time = now;
      angle = drag.start + dx * 0.7;
      inner.style.transform = `rotateY(${angle}deg)`;
    });

    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { moved, velocity } = drag;
      drag = null;
      card.classList.remove('is-dragging');
      if (!moved) {
        if (event.type === 'pointerup' && !window.getSelection()?.toString()) spinTo(angle + 180);
        return;
      }
      // A quick flick keeps spinning like a coin before it lands on a face.
      const fling = reducedMotion.matches ? 0 : Math.max(-3, Math.min(3, velocity)) * 160;
      spinTo(Math.round((angle + fling) / 180) * 180);
    };

    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
  }

  /* Fugazi: a browser port of chain.py, trained on the repo's sample corpus. */

  const fugazi = document.querySelector('[data-fugazi]');
  if (fugazi) {
    const CORPUS = [
      "All Hands, Q3 - Partial Transcript\n\nGreat, I think we have everyone. Let us give it another minute for people to\njoin and then we will get started.\n\nOkay. Thank you all for making the time. I know calendars are tight, so I want\nto be respectful of that and keep this tight as well. I have got three things I\nwant to cover, and then we will open it up for questions at the end.\n\nFirst, the quarter. The numbers are in the deck and I am not going to read the\ndeck to you. What I will say is that we came in ahead on the metrics that\nmatter and behind on two that we care about. That is roughly where we expected\nto land. The team should feel good about it.\n\nSecond, and this is the part I actually want to spend time on, the strategy.\nThere has been a lot of conversation about whether we are pivoting. We are not\npivoting. What we are doing is getting sharper about who we serve and what we\nserve them. Those are different things, and I think the difference has gotten\nlost somewhere between my head and the org, which is on me.\n\nHere is the way I would frame it. We built a platform. Platforms are wonderful\nbecause they can do anything, and platforms are terrible because they can do\nanything. Every customer conversation turns into a conversation about what we\ncould build rather than what we have built. That is a signal, and the signal is\nthat we have not been opinionated enough.\n\nSo moving forward we are going to be opinionated. We are going to have a point\nof view. Some customers are not going to love that, and that is genuinely fine.\nThe ones who do love it will love it a great deal more than they do today.\n\nThird, headcount. I want to address this directly because I know it is on\npeople's minds. We are not planning a reduction. We are planning to be slower\nand more deliberate about where we add. If your team has an open role, that role\nis still open. If you were hoping to make a case for three more, come talk to me\nand bring the business case, because the bar is higher than it was.\n\nLet me pause there. What questions do we have?\n\nYes, go ahead.\n\nThat is a great question, and honestly I do not have a complete answer for you\ntoday. What I can tell you is that we are working through it and we will have\nmore to share in a couple of weeks. Let me take that one away and come back to\nit rather than give you something half-formed from the stage.\n\nAnything else? Okay. Look, I know this quarter asked a lot of people. Thank you.\nGenuinely. Go enjoy the weekend and we will pick this up on Monday.\n",
      "Investor Update - Q3\n\nHi all,\n\nQuick update on the quarter. As always, the headline first and the detail\nafter, and please reach out directly if you want to go deeper on anything here.\n\nHeadline: we grew, we grew more slowly than we wanted to, and we learned\nsomething important about why. Net revenue is up quarter over quarter. Gross\nmargin improved. Sales cycles lengthened materially, which is the number we are\nwatching most closely going into Q4.\n\nWhat went well. Retention held. This matters more than any growth number in the\ncurrent environment, because it tells us the product is doing real work for the\npeople who already bought it. Our largest accounts expanded, and expansion was\ndriven by usage rather than by negotiation, which is the healthy version of that\nstory. The team shipped the integration work we committed to last quarter, on\ntime, which has not always been true of us historically.\n\nWhat did not. New business came in under plan. The honest read is that we were\nslow to adjust our messaging when the buying environment changed, and we spent\nthe first half of the quarter running a playbook that had stopped working. That\nis a self-inflicted problem, which is the good news, because it means it is ours\nto fix. We have already made changes to how we qualify early and we are seeing\nthe leading indicators respond.\n\nWhat we are doing about it. Three things. We are narrowing our focus to the two\nsegments where we win consistently and where the value is easiest to articulate.\nWe are rebuilding the top of funnel motion around that focus rather than around\nthe broad platform story. And we are holding headcount roughly flat through the\nend of the year, which extends our runway meaningfully without asking the team\nto do less.\n\nWhat I need from you. Introductions, still, and specifically to operators in the\ntwo segments above. The single highest leverage thing this list has done for us\nover the past year has been warm introductions, and it is not close.\n\nRunway sits comfortably past the point where we would want to raise again, and\nour plan does not assume a raise. If the market improves and the growth story\ngets easier to tell, we will revisit that. For now the plan is to build a\nbusiness that does not need the market to cooperate.\n\nThank you, as always, for the support. Happy to jump on a call with anyone who\nwants to talk through any of this in more detail.\n",
      "Subject: Q3 Strategic Alignment and the Path Forward\n\nTeam,\n\nThank you all for a tremendous quarter. Before we get into the numbers, I want\nto take a step back and talk about where we are as an organization and where we\nare going.\n\nAt the end of the day, our north star has not changed. We are here to deliver\nvalue to our stakeholders, and everything we do should ladder up to that. The\nreality is that the market has shifted underneath us, and we need to be honest\nwith ourselves about what that means. The headwinds are real. But so are the\ntailwinds, and I would argue that the opportunity in front of us is larger than\nanything we have seen in the last three years.\n\nLet me double-click on that for a moment.\n\nOur core competency has always been execution. That is what we do. That is our\ndifferentiator in a crowded ecosystem. But execution without alignment is just\nmotion, and motion is not the same thing as progress. Moving forward, we need to\nbe far more intentional about how we prioritize. We cannot boil the ocean. We\nneed to identify the low-hanging fruit, move the needle on the things that\nactually matter, and have the discipline to say no to everything else.\n\nTo that end, I am asking each function to come back with three things. First, a\ngranular view of your current bandwidth and where it is going. Second, the top\ntwo initiatives you believe will move the needle in the next two quarters, with\na clear line of sight to impact. Third, and this is the hard one, the work you\nare prepared to sunset in order to create that capacity.\n\nI want to be clear that this is not a cost exercise. This is a focus exercise.\nThere is a meaningful difference, and I would ask you to communicate it that way\nto your teams.\n\nOn the topic of communication, a few of you have flagged that we are not doing\nenough to socialize decisions once they are made. That is fair feedback, and we\nown it. Starting this quarter we will be sharing a weekly update with the\nrationale behind every major call, not just the call itself. Transparency is a\nvalue, not a project.\n\nI know there are open questions. I know some of them are uncomfortable. Let us\ntake those offline where we can go deeper, and let us use the all hands to\nalign on the direction rather than relitigate it.\n\nThe reality is that we have the team, we have the runway, and we have a product\nthat customers genuinely want. What we need now is alignment and the willingness\nto execute against it. I am confident we have both.\n\nMore to come. Please reach out if you want to drill down on any of this.\n",
    ];
    const ORDER = 2;
    const TERMINATORS = new Set(['.', '!', '?']);
    const TOKEN_RE = /[\p{L}\p{N}_']+|[.!?]/gu;

    const tokens = CORPUS.flatMap((text) => text.match(TOKEN_RE) || []);
    const chain = new Map();
    const starts = [];
    for (let i = 0; i < tokens.length - ORDER; i += 1) {
      const key = tokens.slice(i, i + ORDER).join(' ');
      if (!chain.has(key)) chain.set(key, new Map());
      const counts = chain.get(key);
      counts.set(tokens[i + ORDER], (counts.get(tokens[i + ORDER]) || 0) + 1);
      if (i === 0 || TERMINATORS.has(tokens[i - 1])) starts.push(key);
    }
    const openings = starts.filter((key) => chain.has(key));

    const mulberry32 = (seed) => () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const generate = (seed, maxWords = 60, maxSentences = 2) => {
      const random = mulberry32(seed);
      const choice = (list) => list[Math.floor(random() * list.length)];
      const steps = [];
      const output = [];
      const open = () => {
        const key = choice(openings);
        key.split(' ').forEach((token) => {
          output.push(token);
          steps.push({ token, opening: key });
        });
        return key;
      };

      let key = open();
      let sentences = 0;
      while (output.length < maxWords) {
        const options = chain.get(key);
        if (!options) {
          key = open();
          continue;
        }
        const entries = Array.from(options);
        const total = entries.reduce((sum, [, count]) => sum + count, 0);
        let pick = random() * total;
        let next = entries[entries.length - 1][0];
        for (const [token, count] of entries) {
          pick -= count;
          if (pick < 0) {
            next = token;
            break;
          }
        }
        output.push(next);
        steps.push({ token: next, context: key, options: entries });
        key = output.slice(-ORDER).join(' ');
        if (TERMINATORS.has(next)) {
          sentences += 1;
          if (sentences >= maxSentences) break;
        }
      }
      return steps;
    };

    const outputEl = fugazi.querySelector('[data-fugazi-output]');
    const readoutEl = fugazi.querySelector('[data-fugazi-readout]');
    const seedEl = fugazi.querySelector('[data-fugazi-seed]');
    const liveEl = fugazi.querySelector('[data-fugazi-live]');
    const button = fugazi.querySelector('[data-fugazi-run]');
    let timer = 0;

    const describe = (step) => {
      if (step.opening) return `opening on “${step.opening}”`;
      const ranked = step.options.slice().sort((a, b) => b[1] - a[1]);
      const shown = ranked.slice(0, 3).map(([token, count]) => `${token} ×${count}`).join(', ');
      const more = ranked.length > 3 ? ` +${ranked.length - 3}` : '';
      return `after “${step.context}”: ${shown}${more} → ${step.token}`;
    };

    const appendToken = (token) => {
      const span = document.createElement('span');
      span.textContent = TERMINATORS.has(token) || !outputEl.childElementCount ? token : ` ${token}`;
      outputEl.append(span);
      return span;
    };

    const run = (seed, animate) => {
      window.clearTimeout(timer);
      const steps = generate(seed);
      seedEl.textContent = seed;
      outputEl.replaceChildren();
      const sentence = steps.map((step) => step.token).join(' ').replace(/\s+([.!?])/g, '$1');
      if (animate) liveEl.textContent = sentence;
      if (!animate || reducedMotion.matches) {
        steps.forEach((step) => appendToken(step.token));
        readoutEl.textContent = describe(steps[steps.length - 1]);
        return;
      }
      let index = 0;
      const tick = () => {
        outputEl.querySelector('.is-latest')?.classList.remove('is-latest');
        appendToken(steps[index].token).classList.add('is-latest');
        readoutEl.textContent = describe(steps[index]);
        index += 1;
        if (index < steps.length) timer = window.setTimeout(tick, 70);
      };
      tick();
    };

    button.addEventListener('click', () => run(Math.floor(Math.random() * 9000) + 1000, true));
    button.disabled = false;
    run(Number(seedEl.textContent) || 1, false);
  }

  /* FlashTerm: type the answer, move the card through five boxes. */

  const flash = document.querySelector('[data-flashterm]');
  if (flash) {
    const INTERVALS = [1, 3, 7, 14, 30];
    const cards = [
      { q: 'Which two bytes end a legacy boot sector?', a: '55 AA', accept: ['55aa', '0x55aa', 'aa55', '0xaa55'], note: 'Same as the footer.' },
      { q: 'Which Postgres clause lets Faultwing’s workers skip jobs another worker already holds?', a: 'SKIP LOCKED', accept: ['skiplocked', 'forupdateskiplocked'] },
      { q: 'Plan 9 speaks one file protocol. What is it called?', a: '9P', accept: ['9p', '9p2000'] },
      { q: 'In FlashTerm, how many days does a card wait in box 3?', a: '7', accept: ['7', 'seven', '7days', 'sevendays'], note: 'Boxes 1 to 5 wait 1, 3, 7, 14, and 30 days.' },
      { q: 'Which tiny virtual machine runs the Varvara computer?', a: 'Uxn', accept: ['uxn'] },
      { q: 'How many words of context does Fugazi look back on by default?', a: '2', accept: ['2', 'two'], note: 'That is --order 2.' },
    ];
    const boxes = cards.map(() => 0);

    const questionEl = flash.querySelector('[data-flash-question]');
    const countEl = flash.querySelector('[data-flash-count]');
    const form = flash.querySelector('form');
    const input = form.querySelector('input');
    const submit = form.querySelector('[data-flash-submit]');
    const hintButton = flash.querySelector('[data-flash-hint]');
    const feedback = flash.querySelector('[data-flash-feedback]');
    const boxEls = Array.from(flash.querySelectorAll('[data-flash-box]'));
    let current = 0;
    let answered = false;

    const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const distance = (a, b) => {
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i += 1) {
        let previous = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j += 1) {
          const saved = row[j];
          row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
          previous = saved;
        }
      }
      return row[b.length];
    };

    const renderBoxes = (pulse) => {
      boxEls.forEach((el, index) => {
        const count = boxes.filter((box) => box === index).length;
        el.querySelector('[data-flash-box-count]').textContent = count;
        el.classList.toggle('is-current', boxes[current] === index);
        el.classList.toggle('is-pulse', pulse && boxes[current] === index);
        el.setAttribute('aria-label', `Box ${index + 1}, review every ${INTERVALS[index]} ${INTERVALS[index] === 1 ? 'day' : 'days'}: ${count} ${count === 1 ? 'card' : 'cards'}`);
      });
    };

    const show = () => {
      answered = false;
      const cardData = cards[current];
      questionEl.textContent = cardData.q;
      countEl.textContent = `card ${current + 1} of ${cards.length}`;
      input.value = '';
      input.disabled = false;
      submit.textContent = 'Check';
      hintButton.disabled = false;
      feedback.textContent = '';
      feedback.className = 'flash-feedback';
      renderBoxes(false);
    };

    const days = (box) => (INTERVALS[box] === 1 ? 'tomorrow' : `in ${INTERVALS[box]} days`);

    const check = () => {
      const cardData = cards[current];
      const guess = normalize(input.value);
      if (!guess) {
        feedback.textContent = 'Type an answer first, or take a hint.';
        feedback.className = 'flash-feedback';
        return;
      }
      const exact = cardData.accept.includes(guess);
      const close = !exact && cardData.accept.some((answer) => answer.length >= 5 && distance(guess, answer) <= 1);
      const note = cardData.note ? ` ${cardData.note}` : '';
      if (exact || close) {
        boxes[current] = Math.min(4, boxes[current] + 1);
        const lead = close ? `Close enough: ${cardData.a}.` : 'Correct.';
        feedback.textContent = `${lead} Box ${boxes[current] + 1}, next review ${days(boxes[current])}.${note}`;
        feedback.className = 'flash-feedback is-right';
      } else {
        boxes[current] = 0;
        feedback.textContent = `Not quite. It’s ${cardData.a}. Back to box 1, review ${days(0)}.${note}`;
        feedback.className = 'flash-feedback is-wrong';
      }
      answered = true;
      input.disabled = true;
      hintButton.disabled = true;
      submit.textContent = 'Next card';
      renderBoxes(!reducedMotion.matches);
      submit.focus();
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (answered) {
        current = (current + 1) % cards.length;
        show();
        input.focus();
      } else {
        check();
      }
    });

    hintButton.addEventListener('click', () => {
      const answer = cards[current].a;
      feedback.textContent = `Hint: ${answer[0]}${answer.slice(1).replace(/[^\s]/g, '_')}`;
      feedback.className = 'flash-feedback';
      input.focus();
    });

    input.disabled = false;
    submit.disabled = false;
    show();
  }

  /* Project previews open in a lightbox instead of a new tab. */

  const lightbox = document.querySelector('.lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('figcaption');

    document.querySelectorAll('[data-lightbox]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        const figure = link.closest('figure');
        image.src = link.href;
        image.width = Number(link.dataset.width);
        image.height = Number(link.dataset.height);
        image.alt = link.dataset.alt || link.querySelector('img')?.alt || '';
        caption.textContent = link.dataset.caption || figure?.querySelector('figcaption')?.textContent.replace(/\s*·.*$/, '') || '';
        lightbox.showModal();
      });
    });

    // Clicking the dimmed backdrop closes it, like Escape does.
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', () => image.removeAttribute('src'));
  }

  document.querySelector('[data-play]')?.removeAttribute('hidden');
})();
