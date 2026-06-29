'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Box,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Code as CodeIcon,
  OpenInNew as OpenInNewIcon,
  Save as SaveIcon,
  Html as HtmlIcon,
  Css as CssIcon,
  Javascript as JavascriptIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveEditorProps {
  unitId: string;
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  unitTitle: string;
  canEdit: boolean;
  onSave: (html: string, css: string, js: string) => void;
}

type TabKey = 'html' | 'css' | 'js';

type SaveStatus = 'idle' | 'saving' | 'saved';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSrcdoc(html: string, css: string, js: string): string {
  return `<html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveEditor({
  unitId,
  initialHtml,
  initialCss,
  initialJs,
  unitTitle,
  canEdit,
  onSave,
}: LiveEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('html');
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(initialHtml, initialCss, initialJs));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestHtml = useRef(html);
  const latestCss = useRef(css);
  const latestJs = useRef(js);

  // Keep latest refs in sync
  useEffect(() => { latestHtml.current = html; }, [html]);
  useEffect(() => { latestCss.current = css; }, [css]);
  useEffect(() => { latestJs.current = js; }, [js]);

  // ── Debounced Preview (500 ms) ──────────────────────────────────────────────
  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setSrcdoc(buildSrcdoc(latestHtml.current, latestCss.current, latestJs.current));
    }, 500);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [html, css, js]);

  // ── Debounced Auto-Save (1500 ms) ───────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (!canEdit) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => {
      onSave(latestHtml.current, latestCss.current, latestJs.current);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  }, [canEdit, onSave]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ── Code Change Handlers ────────────────────────────────────────────────────
  const handleChange = (value: string | undefined, lang: TabKey) => {
    const v = value ?? '';
    if (lang === 'html') setHtml(v);
    else if (lang === 'css') setCss(v);
    else setJs(v);
    triggerAutoSave();
  };

  // ── Fullscreen Preview ──────────────────────────────────────────────────────
  const openFullscreen = () => {
    const content = buildSrcdoc(latestHtml.current, latestCss.current, latestJs.current);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    }
  };

  // ── Tab Config ─────────────────────────────────────────────────────────────
  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ReactElement;
    language: string;
    value: string;
  }[] = [
    { key: 'html', label: 'HTML',       icon: <HtmlIcon sx={{ fontSize: 18 }} />,       language: 'html',       value: html },
    { key: 'css',  label: 'CSS',        icon: <CssIcon sx={{ fontSize: 18 }} />,        language: 'css',        value: css  },
    { key: 'js',   label: 'JavaScript', icon: <JavascriptIcon sx={{ fontSize: 18 }} />, language: 'javascript', value: js   },
  ];

  const activeTabConfig = tabs.find((t) => t.key === activeTab)!;

  // ── Save Status Chip ────────────────────────────────────────────────────────
  const saveChip = () => {
    if (saveStatus === 'saving') {
      return (
        <Chip
          size="small"
          icon={<CircularProgress size={10} sx={{ color: '#fbbf24 !important' }} />}
          label="Saving..."
          sx={{
            bgcolor: 'rgba(251,191,36,0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(251,191,36,0.3)',
            fontSize: 11,
            height: 24,
            fontWeight: 600,
            '& .MuiChip-icon': { ml: '6px' },
          }}
        />
      );
    }
    if (saveStatus === 'saved') {
      return (
        <Chip
          size="small"
          icon={<SaveIcon sx={{ fontSize: 12, color: '#34d399 !important' }} />}
          label="Saved ✓"
          sx={{
            bgcolor: 'rgba(52,211,153,0.15)',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.3)',
            fontSize: 11,
            height: 24,
            fontWeight: 600,
            '& .MuiChip-icon': { ml: '6px' },
          }}
        />
      );
    }
    return null;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        minHeight: 600,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(8,145,178,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '1px solid rgba(8,145,178,0.25)',
          flexShrink: 0,
          minHeight: 52,
        }}
      >
        <CodeIcon sx={{ color: '#0891b2', fontSize: 20 }} />
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            color: '#f1f5f9',
            flexGrow: 1,
            letterSpacing: 0.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {unitTitle}
        </Typography>

        {canEdit && saveChip()}

        <Tooltip title="Full-screen preview" arrow>
          <IconButton
            size="small"
            onClick={openFullscreen}
            sx={{
              color: '#94a3b8',
              bgcolor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              '&:hover': {
                color: '#0891b2',
                bgcolor: 'rgba(8,145,178,0.1)',
                borderColor: 'rgba(8,145,178,0.3)',
              },
              transition: 'all 0.2s',
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Body: Editor + Preview ───────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left: Editor Panel ─────────────────────────────────────────── */}
        {canEdit && (
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#1e1e1e',
              borderRight: '1px solid rgba(8,145,178,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Tab Bar */}
            <Box sx={{ bgcolor: '#252526', flexShrink: 0 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v: TabKey) => setActiveTab(v)}
                TabIndicatorProps={{
                  style: { backgroundColor: '#0891b2', height: 2 },
                }}
                sx={{
                  minHeight: 40,
                  '& .MuiTab-root': {
                    minHeight: 40,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'none',
                    letterSpacing: 0.3,
                    py: 0,
                    gap: 0.5,
                    '&.Mui-selected': { color: '#0891b2' },
                    '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.04)' },
                    transition: 'color 0.2s',
                  },
                }}
              >
                {tabs.map((t) => (
                  <Tab
                    key={t.key}
                    value={t.key}
                    label={t.label}
                    icon={t.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>

            {/* Monaco Editor */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Editor
                key={activeTab}
                height="100%"
                language={activeTabConfig.language}
                value={activeTabConfig.value}
                onChange={(v) => handleChange(v, activeTab)}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  readOnly: !canEdit,
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  padding: { top: 12, bottom: 12 },
                  folding: true,
                  bracketPairColorization: { enabled: true },
                  suggest: { showKeywords: true },
                  automaticLayout: true,
                }}
              />
            </Box>
          </Box>
        )}

        {/* ── Right: Preview Panel ───────────────────────────────────────── */}
        <Box
          sx={{
            width: canEdit ? '50%' : '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Preview Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 16, color: '#0891b2' }} />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: '#475569',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontSize: 10,
              }}
            >
              Live Preview
            </Typography>
            <Box
              sx={{
                ml: 'auto',
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                animation: 'lePulse 2s infinite',
                '@keyframes lePulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.35 },
                },
              }}
            />
          </Box>

          {/* Iframe */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <iframe
              srcDoc={srcdoc}
              title="Live Preview"
              sandbox="allow-scripts"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#ffffff',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
