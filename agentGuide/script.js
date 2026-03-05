/**
 * もりもり自己流 AIエージェント開発構造 解説サイト
 * メインスクリプト
 * 文字コード: UTF-8 (BOMなし)
 */

/* ============================================================
   Mermaid.js 初期化
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Mermaid 設定 (ダークテーマ + フォント)
  mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    themeVariables: {
      background: '#0a0e1a',
      primaryColor: '#2563eb',
      primaryTextColor: '#e2e8f0',
      primaryBorderColor: '#2563eb',
      lineColor: '#94a3b8',
      secondaryColor: '#06b6d4',
      tertiaryColor: '#0f1e3d',
      fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
      fontSize: '13px',
      edgeLabelBackground: '#111827',
    },
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      padding: 16,
    },
    sequence: {
      diagramMarginX: 16,
      diagramMarginY: 16,
      actorMargin: 40,
      activationWidth: 10,
      noteFontSize: 12,
    },
  });

  /* ----------------------------------------------------------
     フォルダカード インタラクション
     ---------------------------------------------------------- */
  const folderCards = document.querySelectorAll('.folder-card');
  folderCards.forEach(card => {
    card.addEventListener('click', () => {
      const isActive = card.classList.contains('active');
      // 開いているものを全部閉じる
      folderCards.forEach(c => c.classList.remove('active'));
      // 自分自身を開く (既に開いていたら閉じる)
      if (!isActive) card.classList.add('active');
    });
  });

  /* ----------------------------------------------------------
     フロー図タブ切替
     ---------------------------------------------------------- */
  const flowTabs = document.querySelectorAll('.flow-tab');
  const flowPanels = document.querySelectorAll('.flow-panel');

  flowTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      flowTabs.forEach(t => t.classList.remove('active'));
      flowPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target)?.classList.add('active');

      // タブ切替後にMermaid図を再レンダリング（必要な場合）
      const panel = document.getElementById(target);
      if (panel) {
        const mermaidEls = panel.querySelectorAll('.mermaid:not([data-processed])');
        if (mermaidEls.length > 0) {
          mermaid.run({ nodes: mermaidEls });
        }
      }
    });
  });

  /* ----------------------------------------------------------
     シーケンス図 ステップハイライト
     ---------------------------------------------------------- */
  const seqSteps = document.querySelectorAll('.seq-step');
  seqSteps.forEach(step => {
    step.addEventListener('click', () => {
      seqSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  /* ----------------------------------------------------------
     スクロール連動フェードイン (Intersection Observer)
     ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ----------------------------------------------------------
     ナビバー スクロール時スタイル変化
     ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.style.background = 'rgba(10,14,26,0.97)';
    } else {
      navbar.style.background = 'rgba(10,14,26,0.85)';
    }
  }, { passive: true });

  /* ----------------------------------------------------------
     ナビバー: アクティブリンクの追跡
     ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('active-nav');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-nav');
            link.style.color = 'var(--color-text)';
          } else {
            link.style.color = '';
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ----------------------------------------------------------
     ハンバーガーメニュー
     ---------------------------------------------------------- */
  const hamburger = document.getElementById('nav-hamburger');
  const navLinksEl = document.querySelector('.nav-links');

  hamburger?.addEventListener('click', () => {
    navLinksEl?.classList.toggle('open');
  });

  // メニュー内リンクをクリックしたら閉じる
  navLinksEl?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
    });
  });

  /* ----------------------------------------------------------
     ヒーローカード タイピングアニメーション（ステータス表示）
     ---------------------------------------------------------- */
  const statusEl = document.getElementById('hero-status-text');
  if (statusEl) {
    const messages = [
      '🤖 AIエージェントが依頼を読み込み中...',
      '📁 資材フォルダを全て走査中...',
      '⚙️ 成果物を生成しています...',
      '✅ フィードバックを記録しました！',
    ];
    let msgIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeLoop() {
      const current = messages[msgIndex];
      if (!isDeleting) {
        statusEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(typeLoop, 2000);
          return;
        }
      } else {
        statusEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          msgIndex = (msgIndex + 1) % messages.length;
        }
      }
      setTimeout(typeLoop, isDeleting ? 30 : 55);
    }

    setTimeout(typeLoop, 1000);
  }

  /* ----------------------------------------------------------
     ファイルサンプルタブ切り替え
     ---------------------------------------------------------- */
  const sampleTabs = document.querySelectorAll('.sample-tab');
  const samplePanels = document.querySelectorAll('.sample-panel');

  sampleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.sample;
      sampleTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      samplePanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

}); // DOMContentLoaded 終了
