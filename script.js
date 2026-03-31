const WORDS = [
    "the","quick","brown","fox","jumps","over","lazy","dog","a","is","in",
    "to","and","of","it","that","was","he","for","on","are","as","with",
    "his","they","at","be","this","from","or","had","by","hot","word",
    "but","what","some","we","can","out","other","were","all","there",
    "when","up","use","your","how","said","an","each","which","she","do",
    "their","time","if","will","way","about","many","then","them","write",
    "would","like","so","these","her","long","make","thing","see","him",
    "two","has","look","more","day","could","go","come","did","number",
    "sound","no","most","people","my","over","know","water","than","call",
    "first","who","may","down","side","been","now","find","any","new","work",
    "part","take","get","place","made","live","where","after","back","little",
    "only","round","man","year","came","show","every","good","me","give",
    "our","under","name","very","through","just","form","sentence","great",
    "think","say","help","low","line","differ","turn","cause","much","mean",
    "before","move","right","boy","old","too","same","tell","following",
    "want","show","also","around","form","three","small","set","put","end",
    "does","another","well","large","need","big","high","such","next","open"
  ];

  function generatePassage(wordCount = 60) {
    let words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    return words.join(' ');
  }

  let passage = '';
  let userInput = '';
  let startTime = null;
  let timerInterval = null;
  let testDuration = 30;
  let timeLeft = 30;
  let testActive = false;
  let testFinished = false;
  let correctChars = 0;
  let errorCount = 0;

  const passageEl    = document.getElementById('passage');
  const hiddenInput  = document.getElementById('hidden-input');
  const typingBox    = document.getElementById('typing-box');
  const statWpm      = document.getElementById('stat-wpm');
  const statAcc      = document.getElementById('stat-acc');
  const statErr      = document.getElementById('stat-err');
  const statTime     = document.getElementById('stat-time');
  const ringFg       = document.getElementById('ring-fg');
  const progressFill = document.getElementById('progress-fill');
  const overlay      = document.getElementById('result-overlay');
  const RING_CIRC    = 2 * Math.PI * 22;

  function renderPassage() {
    passageEl.innerHTML = '';
    for (let i = 0; i < passage.length; i++) {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = passage[i] === ' ' ? '\u00A0' : passage[i];
      span.dataset.index = i;
      passageEl.appendChild(span);
    }
    updateCursor(0);
  }

  function updateCursor(pos) {
    document.querySelectorAll('.char.cursor').forEach(el => el.classList.remove('cursor'));
    const chars = passageEl.querySelectorAll('.char');
    if (pos < chars.length) chars[pos].classList.add('cursor');
  }

  hiddenInput.addEventListener('input', onInput);
  hiddenInput.addEventListener('keydown', onKeyDown);

  function onKeyDown(e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (userInput.length === 0) return;
      userInput = userInput.slice(0, -1);
      refreshChars();
    }
  }

  function onInput(e) {
    if (testFinished) return;
    const val = hiddenInput.value;
    hiddenInput.value = '';
    if (!testActive && val.trim() !== '') startTest();
    if (!testActive) return;
    for (const ch of val) {
      if (userInput.length < passage.length) {
        userInput += ch;
      }
    }
    refreshChars();
    if (userInput.length >= passage.length) {
      finishTest();
    }
  }

  function refreshChars() {
    const chars = passageEl.querySelectorAll('.char');
    correctChars = 0;
    errorCount = 0;
    for (let i = 0; i < chars.length; i++) {
      chars[i].classList.remove('correct', 'incorrect', 'cursor');
      if (i < userInput.length) {
        if (userInput[i] === passage[i]) {
          chars[i].classList.add('correct');
          correctChars++;
        } else {
          chars[i].classList.add('incorrect');
          errorCount++;
        }
      }
    }
    updateCursor(userInput.length);
    const pct = (userInput.length / passage.length) * 100;
    progressFill.style.width = pct + '%';
    statErr.textContent = errorCount;
    const total = userInput.length;
    const acc = total > 0 ? Math.round((correctChars / total) * 100) : 0;
    statAcc.innerHTML = acc + '<span class="stat-unit">%</span>';
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 60000;
      const wpm = elapsed > 0 ? Math.round((correctChars / 5) / elapsed) : 0;
      statWpm.textContent = wpm;
    }
  }

  function startTest() {
    testActive = true;
    startTime = Date.now();
    typingBox.classList.add('active');
    timerInterval = setInterval(tick, 1000);
  }

  function tick() {
    timeLeft--;
    statTime.textContent = timeLeft;
    const pct = timeLeft / testDuration;
    ringFg.style.strokeDashoffset = RING_CIRC * (1 - pct);
    if (pct < 0.33) ringFg.style.stroke = 'var(--incorrect)';
    else if (pct < 0.6) ringFg.style.stroke = 'var(--accent2)';
    else ringFg.style.stroke = 'var(--accent)';
    if (timeLeft <= 0) finishTest();
  }

  function finishTest() {
    if (testFinished) return;
    testFinished = true;
    clearInterval(timerInterval);
    testActive = false;
    hiddenInput.blur();
    const elapsed = startTime ? (Date.now() - startTime) / 60000 : (testDuration / 60);
    const wpm = elapsed > 0 ? Math.round((correctChars / 5) / elapsed) : 0;
    const total = userInput.length;
    const acc = total > 0 ? Math.round((correctChars / total) * 100) : 0;
    document.getElementById('res-wpm').textContent = wpm;
    document.getElementById('res-acc-pct').textContent = acc + '%';
    document.getElementById('res-acc-bar').style.width = acc + '%';
    document.getElementById('res-correct').textContent = correctChars;
    document.getElementById('res-errors').textContent = errorCount;
    document.getElementById('res-chars').textContent = total;
    overlay.classList.add('show');
  }

  function resetTest(newText = false) {
    clearInterval(timerInterval);
    testActive = false;
    testFinished = false;
    userInput = '';
    correctChars = 0;
    errorCount = 0;
    startTime = null;
    timeLeft = testDuration;
    typingBox.classList.remove('active');
    statWpm.textContent = '0';
    statAcc.innerHTML = '—';
    statErr.textContent = '0';
    statTime.textContent = testDuration;
    progressFill.style.width = '0%';
    ringFg.style.strokeDashoffset = 0;
    ringFg.style.stroke = 'var(--accent)';
    if (newText) passage = generatePassage(70);
    renderPassage();
    overlay.classList.remove('show');
    hiddenInput.value = '';
    hiddenInput.focus();
  }

  document.getElementById('btn-restart').addEventListener('click', () => resetTest(false));
  document.getElementById('btn-new').addEventListener('click', () => resetTest(true));
  document.getElementById('res-restart').addEventListener('click', () => resetTest(true));

  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      testDuration = parseInt(tab.dataset.time);
      resetTest(false);
    });
  });

  typingBox.addEventListener('click', () => hiddenInput.focus());

  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('show')) return;
    if (e.key === 'Tab') { e.preventDefault(); resetTest(false); return; }
    if (!testFinished) hiddenInput.focus();
  });

  passage = generatePassage(70);
  renderPassage();
  hiddenInput.focus();
