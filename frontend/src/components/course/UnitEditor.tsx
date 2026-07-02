'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, TextField, Tooltip, Divider, Switch,
  FormControlLabel, Collapse, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  ArrowBack, Save, Close, ChevronRight, CheckCircle, Visibility, VisibilityOff,
  CalendarToday, ContentCopy, FormatBold, FormatItalic, FormatUnderlined,
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
  FormatListBulleted, FormatListNumbered, Link, Image, Code, Undo, Redo,
  FormatStrikethrough, YouTube, Add,
} from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Youtube from '@tiptap/extension-youtube';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

import { CourseUnit, useUpdateCourseUnitMutation } from '@/store/slices/courseSlice';

// ─── Toolbar Button helper ───
function ToolBtn({
  active, onClick, title, children, disabled,
}: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled}
        sx={{
          borderRadius: 1,
          width: 28, height: 28,
          bgcolor: active ? 'rgba(8,145,178,0.12)' : 'transparent',
          color: active ? '#0891b2' : '#374151',
          '&:hover': { bgcolor: 'rgba(8,145,178,0.1)' },
          '&:disabled': { opacity: 0.35 },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

// ─── Heading selector ───
function HeadingSelect({ editor }: { editor: any }) {
  const levels = ['Normal', 'H1', 'H2', 'H3', 'H4'];
  const [open, setOpen] = useState(false);

  const current = editor.isActive('heading', { level: 1 }) ? 'H1'
    : editor.isActive('heading', { level: 2 }) ? 'H2'
    : editor.isActive('heading', { level: 3 }) ? 'H3'
    : editor.isActive('heading', { level: 4 }) ? 'H4'
    : 'Normal';

  const setLevel = (label: string) => {
    if (label === 'Normal') editor.chain().focus().setParagraph().run();
    else {
      const lvl = parseInt(label[1]) as 1 | 2 | 3 | 4;
      editor.chain().focus().toggleHeading({ level: lvl }).run();
    }
    setOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        size="small"
        onClick={() => setOpen(p => !p)}
        endIcon={<ChevronRight sx={{ fontSize: 13, transform: open ? 'rotate(90deg)' : 'none', transition: '0.15s' }} />}
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
          color: '#374151', border: '1px solid #e5e7eb', borderRadius: 1.5,
          height: 28, px: 1.2, minWidth: 90,
          '&:hover': { borderColor: '#0891b2', color: '#0891b2' }
        }}
      >
        {current}
      </Button>
      {open && (
        <Box sx={{
          position: 'absolute', top: 32, left: 0, zIndex: 100,
          bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 110,
          overflow: 'hidden',
        }}>
          {levels.map(lbl => (
            <Box
              key={lbl}
              onClick={() => setLevel(lbl)}
              sx={{
                px: 2, py: 0.8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: lbl === current ? 700 : 400,
                color: lbl === current ? '#0891b2' : '#374151',
                '&:hover': { bgcolor: '#f3f4f6' }
              }}
            >
              {lbl}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Formatting Toolbar ───
function EditorToolbar({ editor, viewMode, onToggleViewMode }: { editor: any; viewMode: 'visual' | 'code'; onToggleViewMode: () => void }) {
  if (!editor) return null;

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = prompt('Enter YouTube URL:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.3,
        px: 1.5, py: 0.8,
        border: '1px solid #e5e7eb',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        bgcolor: '#f9fafb',
      }}
    >
      {/* Heading */}
      <HeadingSelect editor={editor} />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.3 }} />

      {/* Text style */}
      <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
        <FormatBold sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
        <FormatItalic sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
        <FormatUnderlined sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <FormatStrikethrough sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
        <span style={{ fontSize: 13, fontWeight: 700, color: editor.isActive('highlight') ? '#0891b2' : '#374151' }}>A</span>
      </ToolBtn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.3 }} />

      {/* Alignment */}
      <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">
        <FormatAlignLeft sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">
        <FormatAlignCenter sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">
        <FormatAlignRight sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">
        <FormatAlignJustify sx={{ fontSize: 16 }} />
      </ToolBtn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.3 }} />

      {/* Lists */}
      <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
        <FormatListBulleted sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
        <FormatListNumbered sx={{ fontSize: 16 }} />
      </ToolBtn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.3 }} />

      {/* Insert */}
      <ToolBtn onClick={addLink} title="Insert Link" active={editor.isActive('link')}>
        <Link sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn onClick={addImage} title="Insert Image">
        <Image sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn onClick={addYoutube} title="Embed YouTube Video" disabled={viewMode === 'code'}>
        <YouTube sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn active={viewMode === 'code'} onClick={onToggleViewMode} title="Toggle HTML View (Ctrl+Shift+H)">
        <Code sx={{ fontSize: 16 }} />
      </ToolBtn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.3 }} />

      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo sx={{ fontSize: 16 }} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo sx={{ fontSize: 16 }} />
      </ToolBtn>
    </Box>
  );
}

// ─── Right Sidebar Panel ───
function SidebarPanel({
  title, children,
}: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
      <Box
        onClick={() => setOpen(p => !p)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 2, cursor: 'pointer', bgcolor: '#fff',
          '&:hover': { bgcolor: '#f9fafb' }
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#111827' }}>
          {title}
        </Typography>
        <ChevronRight sx={{ fontSize: 18, color: '#6b7280', transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2.5, pb: 2, pt: 0.5, bgcolor: '#fafafa', borderTop: '1px solid #f3f4f6' }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Main Unit Editor Component ───
export interface UnitEditorProps {
  unit: CourseUnit;
  unitIndex: number;
  onBack: () => void;
}

export default function UnitEditor({ unit, unitIndex, onBack }: UnitEditorProps) {
  const [updateUnit, { isLoading: saving }] = useUpdateCourseUnitMutation();
  const [title, setTitle] = useState(unit.title);
  const [dueDate, setDueDate] = useState('');
  const [isPublished, setIsPublished] = useState(unit.isPublished);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [rawHtml, setRawHtml] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      Highlight,
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: unit.htmlContent || '<p>Start typing your unit content here…</p>',
    editorProps: {
      attributes: {
        class: 'unit-prose-editor',
      },
    },
  });

  // Update editor content if unit changes
  useEffect(() => {
    if (editor && unit.htmlContent && editor.getHTML() !== unit.htmlContent) {
      editor.commands.setContent(unit.htmlContent || '');
      if (codeDialogOpen) setRawHtml(unit.htmlContent || '');
    }
    setTitle(unit.title);
    setIsPublished(unit.isPublished);
  }, [unit.id]);

  const openCodeDialog = useCallback(() => {
    setRawHtml(editor?.getHTML() || '');
    setCodeDialogOpen(true);
  }, [editor]);

  const closeCodeDialog = useCallback((save: boolean) => {
    if (save && editor) {
      editor.commands.setContent(rawHtml);
    }
    setCodeDialogOpen(false);
  }, [editor, rawHtml]);

  // Keyboard shortcut Ctrl+Shift+H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        openCodeDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCodeDialog]);

  const handleSave = useCallback(async (andClose = false) => {
    if (!title.trim()) { toast.error('Page title is required'); return; }
    try {
      await updateUnit({
        unitId: unit.id,
        body: {
          title,
          htmlContent: editor?.getHTML() || '',
          isPublished,
        },
      }).unwrap();
      setSavedAt(new Date());
      toast.success('Unit saved!');
      if (andClose) onBack();
    } catch {
      toast.error('Failed to save unit');
    }
  }, [unit.id, title, isPublished, editor, updateUnit, onBack]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (title && editor) {
        updateUnit({ unitId: unit.id, body: { title, htmlContent: editor.getHTML(), isPublished } });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [title, isPublished, editor, unit.id]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>

      {/* ═══ Top Header Bar ═══ */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: 3, py: 1.5,
        borderBottom: '1px solid #e5e7eb',
        bgcolor: '#fff',
      }}>
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
          onClick={onBack}
          size="small"
          sx={{
            textTransform: 'none', color: '#374151', fontWeight: 600, fontSize: '0.85rem',
            '&:hover': { color: '#0891b2', bgcolor: 'rgba(8,145,178,0.06)' }
          }}
        >
          Back
        </Button>
        <Divider orientation="vertical" flexItem />
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827' }}>
          Edit Unit {unitIndex + 1}
        </Typography>
        {savedAt && (
          <Chip
            icon={<CheckCircle sx={{ fontSize: 13 }} />}
            label={`Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            size="small"
            sx={{ ml: 'auto', bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: '0.72rem' }}
          />
        )}
      </Box>

      {/* ═══ Body ═══ */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── Main editing area ─── */}
        <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 5 }, py: 4 }}>

          {/* Page Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', mb: 0.5, display: 'block' }}>
              Page Title <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Unit title"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#0891b2' },
                  '&.Mui-focused fieldset': { borderColor: '#0891b2' },
                },
                '& input': { fontSize: '0.9rem', fontWeight: 500 }
              }}
            />
          </Box>

          {/* Due Date */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', mb: 0.5, display: 'block' }}>
              Due Date
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 18, color: '#6b7280' }} />
              <TextField
                type="date"
                size="small"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                placeholder="DD/MM/YYYY"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' },
                  width: 200,
                }}
              />
            </Box>
          </Box>

          {/* Page Content label + Select Template */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151' }}>
              Page Content
            </Typography>
            <Button
              size="small"
              endIcon={<ChevronRight sx={{ fontSize: 14 }} />}
              sx={{ textTransform: 'none', color: '#0891b2', fontWeight: 600, fontSize: '0.78rem' }}
            >
              Select Template
            </Button>
          </Box>

          {/* WYSIWYG Editor */}
          <Box sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            '& .unit-prose-editor': {
              minHeight: 380,
              px: 3,
              py: 2.5,
              outline: 'none',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#111827',
              fontFamily: 'inherit',
              '& h1': { fontSize: '1.6rem', fontWeight: 800, mb: 1, mt: 1.5 },
              '& h2': { fontSize: '1.3rem', fontWeight: 700, mb: 1, mt: 1.5 },
              '& h3': { fontSize: '1.1rem', fontWeight: 700, mb: 0.8 },
              '& p': { mb: 0.8, mt: 0 },
              '& ul, & ol': { pl: 3, mb: 1 },
              '& li': { mb: 0.3 },
              '& a': { color: '#0891b2', textDecoration: 'underline' },
              '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
              '& blockquote': { borderLeft: '4px solid #0891b2', pl: 2, color: '#6b7280', my: 1.5, fontStyle: 'italic' },
              '& code': { bgcolor: '#f3f4f6', borderRadius: 0.5, px: 0.5, fontFamily: 'monospace', fontSize: '0.88em' },
              '& pre': { bgcolor: '#1e1e2e', color: '#cdd6f4', p: 2, borderRadius: 2, overflow: 'auto', my: 1.5, '& code': { bgcolor: 'transparent', color: 'inherit', p: 0 } },
              '& iframe': { width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 2, my: 1.5 },
              '& mark': { bgcolor: '#fef9c3', borderRadius: 0.5, px: 0.3 },
            },
          }}>
            <Box>
              <EditorToolbar editor={editor} viewMode="visual" onToggleViewMode={openCodeDialog} />
            </Box>
            <Box sx={{ bgcolor: '#fff', position: 'relative' }}>
              <EditorContent editor={editor} />
            </Box>
            {/* Resize handle visual */}
            <Box sx={{ height: 8, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1 }}>
              <Box sx={{ width: 12, height: 6, opacity: 0.4, backgroundImage: 'repeating-linear-gradient(45deg, #888 0, #888 1px, transparent 0, transparent 50%)', backgroundSize: '4px 4px' }} />
            </Box>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {editor?.storage?.characterCount?.characters?.() ?? ''} characters · Auto-saves every 30 seconds
            </Typography>
          </Box>
        </Box>

        {/* ─── Right Sidebar ─── */}
        <Box sx={{
          width: 280, flexShrink: 0,
          borderLeft: '1px solid #e5e7eb',
          p: 2.5,
          overflowY: 'auto',
          bgcolor: '#fafafa',
        }}>
          <SidebarPanel title="Availability Dates & Conditions">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Always available
            </Typography>
          </SidebarPanel>

          <SidebarPanel title="Completion">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Complete when opened
            </Typography>
          </SidebarPanel>

          <SidebarPanel title="Tags & Labels">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              No tags added
            </Typography>
          </SidebarPanel>
        </Box>
      </Box>

      {/* ═══ Bottom Action Bar ═══ */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 3, py: 1.5,
        borderTop: '2px solid #e5e7eb',
        bgcolor: '#fff',
        position: 'sticky', bottom: 0, zIndex: 10,
      }}>
        <Button
          variant="contained"
          onClick={() => handleSave(true)}
          disabled={saving}
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2,
            background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            px: 3,
            '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0891b2)' },
          }}
        >
          {saving ? 'Saving…' : 'Save and Close'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSave(false)}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#d1d5db', color: '#374151' }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#d1d5db', color: '#374151' }}
        >
          Cancel
        </Button>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#0891b2' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0891b2' },
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: isPublished ? '#0891b2' : '#9ca3af', fontSize: '0.85rem' }}>
            {isPublished ? 'Visible' : 'Hidden'}
          </Typography>
        </Box>
      </Box>

      {/* Code Editor Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => closeCodeDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '80vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Source Code Editor</Typography>
          <IconButton onClick={() => closeCodeDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ flex: 1, p: 0, overflow: 'hidden' }}>
          <Editor
            height="100%"
            language="html"
            theme="vs-dark"
            value={rawHtml}
            onChange={(value) => setRawHtml(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              formatOnPaste: true,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={() => closeCodeDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={() => closeCodeDialog(true)} variant="contained" sx={{ bgcolor: '#0891b2', '&:hover': { bgcolor: '#0e7490' }, fontWeight: 600 }}>
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
