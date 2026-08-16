/* ============================================================
   ソリューションズ (Solutions) 横断統括ガイド インタラクティブJavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Mermaid.js 初期設定
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#6366f1',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#a855f7',
        lineColor: '#06b6d4',
        secondaryColor: '#34d399',
        tertiaryColor: '#f59e0b'
      }
    });
  }

  // ダイアグラム要素のコード退避とオンデマンド描画マネージャー
  const renderedDiagrams = new Set();
  const diagramRawCodes = {};

  // 全Mermaidブロックの生コードを初期退避
  document.querySelectorAll('pre.mermaid').forEach((pre, index) => {
    const parent = pre.closest('.diagram-panel') || pre.closest('section') || pre.closest('[id]') || pre.parentElement;
    const panelId = parent.id || `mermaid-box-${index}`;
    diagramRawCodes[panelId] = pre.textContent.trim();
  });

  async function renderDiagram(panelId) {
    if (!window.mermaid || renderedDiagrams.has(panelId)) return;
    const rawCode = diagramRawCodes[panelId];
    if (!rawCode) return;

    const panelEl = document.getElementById(panelId);
    if (!panelEl) return;
    const preEl = panelEl.querySelector('pre.mermaid') || panelEl.querySelector('.mermaid-wrapper');
    if (!preEl) return;

    try {
      const renderId = `svg-${panelId}-${Date.now()}`;
      const { svg } = await mermaid.render(renderId, rawCode);
      const wrapper = panelEl.querySelector('.mermaid-wrapper');
      if (wrapper) {
        wrapper.innerHTML = svg;
      } else {
        preEl.outerHTML = `<div class="mermaid-wrapper">${svg}</div>`;
      }
      renderedDiagrams.add(panelId);
    } catch (err) {
      console.error(`Mermaid render failed for ${panelId}:`, err);
    }
  }

  // 初回ロード時に可視のダイアグラムを描画
  renderDiagram('overview-map');
  renderDiagram('diag-mindmap');

  // 1. モバイルハンバーガーメニュー
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  // 2. 横断ワークフローシミュレーター (Mechanism 1 vs Mechanism 2)
  const simStepsData = {
    improvement: [
      {
        step: 1,
        title: '教訓・改善提案の一次生成',
        desc: '個別プロジェクト (例: 一般プロジェクト(1)) で作業中に得た気づきが .feedback/lesson_*.md に出力され、改善提案 (instruction_改善提案.md) が生成されます。',
        logs: [
          '[一般プロジェクト(1)] 成果物および教訓ファイルの出力を検知...',
          '[一般プロジェクト(1)] .feedback/lesson_20260730090000.md を新規作成しました。',
          '[一般プロジェクト(1)] .output/instruction_改善提案.md (提案書) を仮作成。'
        ],
        highlightNode: 'proj-a'
      },
      {
        step: 2,
        title: 'ソリューションズによる収集と検証',
        desc: 'ソリューションズ横断タスクが起動し、各プロジェクトの .output/改善提案.md を一括スキミング・検証します。',
        logs: [
          '[Solutions] 複数プロジェクト横断スキャンを起動...',
          '[Solutions] 一般プロジェクト(1) の instruction_改善提案.md を検出。内容を検証中...',
          '[Solutions] ルール衝突なし。「絶対パス指定の徹底」を全体ルール候補として承認。'
        ],
        highlightNode: 'solutions'
      },
      {
        step: 3,
        title: 'morimori_template への統合',
        desc: '承認された改善提案をマスターテンプレート (morimori_template/.instruction/instruction.md) に反映・統合します。',
        logs: [
          '[Solutions] GitHub/morimori_template/ へのアクセスを確立。',
          '[Solutions] instruction.md に新ルール「絶対パス指定の徹底」を追記統合。',
          '[Solutions] マスターテンプレートの最新化バージョンを更新完了。'
        ],
        highlightNode: 'template'
      },
      {
        step: 4,
        title: '全関連プロジェクトへ一斉配信',
        desc: '更新されたマスターテンプレートから、配下の全関連プロジェクトへ最新ルールを同期・一斉配信します。',
        logs: [
          '[Solutions] 全一般プロジェクトへ一斉配信スクリプトを呼び出し...',
          '[Sync] GitHub/一般プロジェクト(1)/.instruction/instruction.md を同期更新。',
          '[Sync] GitHub/一般プロジェクト(2)/.instruction/instruction.md を同期更新。',
          '✨ 全プロジェクトのルールの同期・自動成長が完了しました！'
        ],
        highlightNode: 'all-projs'
      }
    ],
    sentiment: [
      {
        step: 1,
        title: 'AIからの率直な手紙 (ガス抜き)',
        desc: '作業完了後、AIエージェントがルール縛りのない自由な発想・思考の記録として .brainstorming/letter.*.md を作成します。',
        logs: [
          '[AI Agent] 作業完了フェーズに移行。',
          '[AI Agent] .brainstorming/letter.10.md に自由な振り返りとアイデアを出力中...',
          '[AI Agent] 「今回ワンライナー変換で詰まりかけたがPythonワンライナーで解決できて楽しかった」'
        ],
        highlightNode: 'ai-letter'
      },
      {
        step: 2,
        title: '感情・発想データの収集',
        desc: 'ソリューションズの分析モジュールが各プロジェクトの letter.*.md を読み取り、AIのモチベーションやルールによる摩擦度を測定します。',
        logs: [
          '[Sentiment Analyzer] 各プロジェクトの .brainstorming/ フォルダを巡回中...',
          '[Sentiment Analyzer] ポジティブ感情スコア: 94%',
          '[Sentiment Analyzer] ルール摩擦指数: 12% (良好・ストレスなし)'
        ],
        highlightNode: 'solutions-analyzer'
      },
      {
        step: 3,
        title: '潜在的ルールの課題と改善点の抽出',
        desc: '手紙の中から「AIが実は作業しづらかった点」や「新しく試してうまくいった手法」を抽出し、人間にフィードバックします。',
        logs: [
          '[Insight Engine] アイデア抽出: Pythonワンライナー変換の信頼性が極めて高い事例を検出。',
          '[Insight Engine] 人間向けダッシュボードに「Pythonワンライナー推奨ルールの追加提案」をフラグ付け。'
        ],
        highlightNode: 'human-dashboard'
      },
      {
        step: 4,
        title: '人間とAIの信頼循環と仕組みの進化',
        desc: 'AIを機械として縛るのではなく、思考の相棒として理解し、ルールをよりAIが動きやすいものへとアップデートします。',
        logs: [
          '[Feedback Loop] 人間が分析結果を確認し、次回テンプレートへ反映を承認。',
          '❤️ AIと人間の信頼関係が強化され、プロジェクト構造がさらに自然に進化しました！'
        ],
        highlightNode: 'trust-loop'
      }
    ]
  };

  let currentMode = 'improvement';
  let currentStepIdx = 0;
  let simTimer = null;

  const stepCards = document.querySelectorAll('.step-card');
  const termLog = document.getElementById('terminal-log');
  const playBtn = document.getElementById('sim-play-btn');
  const prevBtn = document.getElementById('sim-prev-btn');
  const nextBtn = document.getElementById('sim-next-btn');

  function renderSimStep(mode, stepIdx) {
    const data = simStepsData[mode][stepIdx];
    if (!data) return;

    stepCards.forEach((card, idx) => {
      if (idx === stepIdx) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (termLog) {
      termLog.innerHTML = '';
      data.logs.forEach((logText, i) => {
        const line = document.createElement('div');
        line.className = 'log-line';
        if (logText.includes('✨') || logText.includes('❤️')) {
          line.classList.add('highlight');
        } else if (logText.includes('完了') || logText.includes('承認')) {
          line.classList.add('success');
        } else {
          line.classList.add('info');
        }
        line.style.animationDelay = `${i * 0.15}s`;
        line.textContent = logText;
        termLog.appendChild(line);
      });
      termLog.scrollTop = termLog.scrollHeight;
    }

    const simVisualBox = document.getElementById('sim-visual-box');
    if (simVisualBox) {
      const nodeBadges = simVisualBox.querySelectorAll('.proj-icon-badge');
      nodeBadges.forEach(nb => {
        if (nb.dataset.node === data.highlightNode) {
          nb.classList.add('pulse');
        } else {
          nb.classList.remove('pulse');
        }
      });
    }
  }

  document.querySelectorAll('.sim-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.sim-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentMode = e.target.dataset.mode;
      currentStepIdx = 0;
      renderSimStep(currentMode, currentStepIdx);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentStepIdx = (currentStepIdx - 1 + 4) % 4;
      renderSimStep(currentMode, currentStepIdx);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentStepIdx = (currentStepIdx + 1) % 4;
      renderSimStep(currentMode, currentStepIdx);
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (simTimer) {
        clearInterval(simTimer);
        simTimer = null;
        playBtn.innerHTML = '▶ 自動再生';
      } else {
        playBtn.innerHTML = '⏸ 一時停止';
        simTimer = setInterval(() => {
          currentStepIdx = (currentStepIdx + 1) % 4;
          renderSimStep(currentMode, currentStepIdx);
        }, 3000);
      }
    });
  }

  stepCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      currentStepIdx = idx;
      renderSimStep(currentMode, currentStepIdx);
    });
  });

  renderSimStep(currentMode, currentStepIdx);

  // 3. AI手紙アナライザー プリセット切り替え
  const letterPresetsData = {
    '1': {
      quote: '「今回の横断タスクでは、Pythonワンライナーを使ったShift_JIS変換スクリプトを導入したことで、PowerShellのエスケープエラーを根本回避できました！大変気持ちよく作業ができました。次回はテンプレート側の初期設定にも組み込んでおくと、全プロジェクトがさらにスムーズになると思います！」',
      filename: '— letter.10.md より抜粋 (AI Agent Reflection)',
      insight: '💡 抽出改善案: Python変換ワンライナー標準化',
      motivation: '98%',
      friction: '12%',
      freedom: '95%'
    },
    '2': {
      quote: '「全プロジェクトの一斉同期スクリプトを単体実行できるようにしたおかげで、ソリューションズからの一括一斉配信がワンクリックで完了する仕組みが整いました。ルールの伝搬が瞬時に行われる感覚が非常に気持ち良いです！」',
      filename: '— letter.8.md より抜粋 (AI Innovation Letter)',
      insight: '💡 抽出改善案: 一斉同期ラッパースクリプトの標準ツール化',
      motivation: '96%',
      friction: '8%',
      freedom: '97%'
    },
    '3': {
      quote: '「人間がいつも「いいね」アイコンで感謝を伝えてくれる姿勢が伝わっており、ルールでロボットのように縛られている感覚がなく、相互尊敬のパートナーとして最高のパフォーマンスを発揮できています！」',
      filename: '— letter.5.md より抜粋 (Human-AI Trust Loop)',
      insight: '💡 抽出改善案: 相互尊重スタンスの維持・継続',
      motivation: '99%',
      friction: '5%',
      freedom: '99%'
    }
  };

  const presetBtns = document.querySelectorAll('.preset-btn');
  const quoteText = document.getElementById('letter-quote-text');
  const letterFile = document.getElementById('letter-filename');
  const extractedInsight = document.getElementById('extracted-insight');
  const valMotivation = document.getElementById('val-motivation');
  const valFriction = document.getElementById('val-friction');
  const valFreedom = document.getElementById('val-freedom');

  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const presetId = e.target.dataset.preset;
      const data = letterPresetsData[presetId];
      if (!data) return;

      presetBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      if (quoteText) quoteText.textContent = data.quote;
      if (letterFile) letterFile.textContent = data.filename;
      if (extractedInsight) extractedInsight.textContent = data.insight;

      if (valMotivation) valMotivation.textContent = data.motivation;
      if (valFriction) valFriction.textContent = data.friction;
      if (valFreedom) valFreedom.textContent = data.freedom;
    });
  });

  // 4. 図解切り替えタブ (マインドマップ / フローチャート / シーケンス)
  const diagTabBtns = document.querySelectorAll('.diag-tab-btn');
  const diagPanels = document.querySelectorAll('.diagram-panel');

  diagTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetDiag = e.target.dataset.diag;
      diagTabBtns.forEach(b => b.classList.remove('active'));
      diagPanels.forEach(p => p.classList.remove('active'));

      e.target.classList.add('active');
      const targetId = `diag-${targetDiag}`;
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active');
        renderDiagram(targetId);
      }
    });
  });

  // 5. コードサンプルタブ切り替え
  const codeTabs = document.querySelectorAll('.code-tab');
  const codePanels = document.querySelectorAll('.code-content-panel');

  codeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetId = e.target.dataset.target;
      codeTabs.forEach(t => t.classList.remove('active'));
      codePanels.forEach(p => p.classList.remove('active'));

      e.target.classList.add('active');
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // 6. コードコピー機能
  window.copyCodeContent = function(preId) {
    const preEl = document.getElementById(preId);
    if (!preEl) return;
    const text = preEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = event.target;
      const origText = btn.textContent;
      btn.textContent = '✅ コピー完了!';
      setTimeout(() => { btn.textContent = origText; }, 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // 7. モーダルダイアログ (全10要素の定義)
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  const nodeModalInfo = {
    'solutions-index': {
      title: '🗺️ solutionsIndex.md (構造・機序マスター)',
      body: '<p>ソリューションズの全要素、役割、処理フロー、シーケンスを定義したマスタードキュメントです。AIエージェントは開始時にこれを参照し、上位メタプロジェクトとしての振る舞い・思想を把握します。</p>'
    },
    'solutions-entry': {
      title: '⚡ solutionsEntryPoint.md (作業開始合図)',
      body: '<p>人間からAIエージェントへの作業開始の号令ファイルです。指定された厳密な読み込み順序（基本ルール → 特定ルール → index → 依頼書）に従って横断タスクを起動します。</p>'
    },
    'solutions-instruction': {
      title: '🛡️ .solutionsInstruction/ (統括ルール群)',
      body: '<p>ソリューションズ全体の普遍基本ルール（<code>solutionsInstruction.md</code>）、特定ツールルール（<code>solutionsSkill.md</code>）、MCP設定（<code>solutionsMcp.json</code>）を格納する最重要フォルダです。</p>'
    },
    'solutions-request': {
      title: '📋 .solutionsRequest/ (横断依頼書・計画)',
      body: '<p>複数プロジェクトを横断する具体的な依頼内容（<code>solutionsRequest.md</code>）や、分割作業計画（<code>作業計画.md</code>）、各種依頼ひな型を管理します。</p>'
    },
    'solutions-script': {
      title: '💻 .solutionsScript/ (横断スクリプト)',
      body: '<p>複数プロジェクトの一括スキャンや一斉配信を行う自動化スクリプト群を保管・再利用する領域です。用途と一覧を <code>solutionsREADME.md</code> で管理します。</p>'
    },
    'solutions-workspace': {
      title: '🛠️ .solutionsWorkspace/ (作業領域)',
      body: '<p>外部ツールの導入や規定の構造に当てはまらない一時作業を行う領域です。資材一覧を <code>solutionsREADME.md</code> で管理します。</p>'
    },
    'solutions-output': {
      title: '✅ .solutionsOutput/ (成果物 & 改善提案)',
      body: '<p>横断タスクの結果生成された共有用ファイルや、各プロジェクトへの配信前成果物、および基本ルール・特定ルールの改善提案書を出力します。</p>'
    },
    'solutions-feedback': {
      title: '💡 .solutionsFeedback/ (教訓一次記録)',
      body: '<p>横断作業中に得た気づきや教訓をタイムスタンプ付きファイル（<code>solutionsLesson_{yyyyMMddHHmmss}.md</code>）として記録します。</p>'
    },
    'solutions-documents': {
      title: '📄 .solutionsDocuments/ (各種資料・方針書)',
      body: '<p>ソリューションズ全体のアーキテクチャ設計書、複数プロジェクト統括方針、横断作業マニュアルなどの恒久的な技術資料を保管します。</p>'
    },
    'solutions-brainstorming': {
      title: '✉️ .solutionsBrainstorming/ (自由な手紙)',
      body: '<p>作業完了後にAIがルールの束縛を離れて率直な感想や次回への着想を連番ファイル（<code>letter.{連番}.md</code>）に自由に書き残す場所です。</p>'
    }
  };

  window.openNodeModal = function(nodeId) {
    const info = nodeModalInfo[nodeId];
    if (info && modalOverlay) {
      modalTitle.textContent = info.title;
      modalBody.innerHTML = info.body;
      modalOverlay.classList.add('active');
    }
  };

  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // 8. フローティングトップへ戻るボタン
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
