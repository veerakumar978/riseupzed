import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Copy,
  Check,
  Zap,
  Shield,
  CreditCard,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle,
  Bell,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Award,
  Search,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { AmbientBackground } from '../components/effects/AmbientBackground';
import { TiltCard } from '../components/effects/TiltCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Switch } from '../components/ui/Switch';
import { Checkbox } from '../components/ui/Checkbox';
import { RadioGroup } from '../components/ui/RadioGroup';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Tooltip } from '../components/ui/Tooltip';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Progress, CircularProgress } from '../components/ui/Progress';
import { Divider } from '../components/ui/Divider';
import { Tabs } from '../components/ui/Tabs';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { NavLink } from '../components/ui/NavLink';
import { MetricDisplay } from '../components/ui/MetricDisplay';
import { DataTablePreview } from '../components/ui/DataTablePreview';

export const DesignSystemPreview: React.FC = () => {
  const { theme, toggleTheme, isReducedMotion, toggleReducedMotion } = useTheme();
  const { showToast } = useToast();

  // State management for interactive demos
  const [activeTab, setActiveTab] = useState('components');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [motionReplayKey, setMotionReplayKey] = useState(0);

  // Sample form states
  const [textVal, setTextVal] = useState('Johnathan Sterling');
  const [emailVal, setEmailVal] = useState('j.sterling@apexcapital.io');
  const [tierVal, setTierVal] = useState('diamond');
  const [switchVal1, setSwitchVal1] = useState(true);
  const [switchVal2, setSwitchVal2] = useState(false);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('instant');
  const [activeAlert, setActiveAlert] = useState(true);

  const handleCopy = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedToken(name);
    showToast({
      title: 'Copied to Clipboard',
      message: `${name} (${hex}) copied.`,
      type: 'success',
      duration: 2500,
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const triggerReplay = () => {
    setMotionReplayKey(prev => prev + 1);
    showToast({
      title: 'Animation Presets Replayed',
      message: 'Viewport animations and card entrances re-triggered.',
      type: 'info',
      duration: 2000,
    });
  };

  // Color tokens data
  const surfaceColors = [
    { name: 'Midnight Background', token: '--bg-midnight', hex: theme === 'dark' ? '#080817' : '#F7F7FC', desc: 'Main canvas & page root' },
    { name: 'Primary Panel', token: '--bg-panel-primary', hex: theme === 'dark' ? '#101024' : '#FFFFFF', desc: 'Standard cards & containers' },
    { name: 'Secondary Panel', token: '--bg-panel-secondary', hex: theme === 'dark' ? '#17112F' : '#F0EDFA', desc: 'Section & table headers' },
    { name: 'Elevated Panel', token: '--bg-panel-elevated', hex: theme === 'dark' ? '#20183B' : '#E5DFF5', desc: 'Dropdowns, controls, modals' },
    { name: 'Strong Surface', token: '--bg-surface-strong', hex: theme === 'dark' ? '#2A1850' : '#DDD4F2', desc: 'Active badges & accents' },
  ];

  const brandColors = [
    { name: 'Royal Purple', token: '--brand-royal-purple', hex: theme === 'dark' ? '#17112F' : '#6D28D9', desc: 'Brand anchor & surfaces' },
    { name: 'Electric Violet', token: '--brand-electric-violet', hex: theme === 'dark' ? '#5520A8' : '#6D28D9', desc: 'Primary buttons & gradients' },
    { name: 'Bright Violet', token: '--brand-bright-violet', hex: theme === 'dark' ? '#8B5CF6' : '#7C3AED', desc: 'Highlights & active pills' },
    { name: 'Soft Lavender', token: '--brand-soft-lavender', hex: theme === 'dark' ? '#C4B5FD' : '#4C1D95', desc: 'Icons & subtle text' },
    { name: 'Cyber Cyan', token: '--brand-cyber-cyan', hex: theme === 'dark' ? '#22D3EE' : '#0891B2', desc: 'Secondary emphasis & trends' },
    { name: 'Cyan Hover', token: '--brand-cyan-hover', hex: theme === 'dark' ? '#67E8F9' : '#06B6D4', desc: 'Interactive cyan states' },
    { name: 'Luxury Gold', token: '--brand-luxury-gold', hex: theme === 'dark' ? '#F5C451' : '#D97706', desc: 'VIP tier & special status' },
  ];

  const textAndBorders = [
    { name: 'Primary Text', token: '--text-primary', hex: theme === 'dark' ? '#F4F2FF' : '#17112F', desc: 'Headings & primary values' },
    { name: 'Secondary Text', token: '--text-secondary', hex: theme === 'dark' ? '#C4BED8' : '#514B65', desc: 'Body copy & labels' },
    { name: 'Muted Text', token: '--text-muted', hex: theme === 'dark' ? '#938CA9' : '#78718F', desc: 'Captions & placeholders' },
    { name: 'Theme Border', token: '--border-dark', hex: theme === 'dark' ? '#302545' : '#E4DDF1', desc: 'Card & input borders' },
    { name: 'Subtle Separator', token: '--border-subtle', hex: theme === 'dark' ? '#241B36' : '#EDE7F6', desc: 'Dividers & row lines' },
  ];

  const semanticColors = [
    { name: 'Success', token: '--semantic-success', hex: theme === 'dark' ? '#34D399' : '#059669', desc: 'Completed, approved, gains' },
    { name: 'Warning', token: '--semantic-warning', hex: theme === 'dark' ? '#FBBF24' : '#D97706', desc: 'Pending, threshold alerts' },
    { name: 'Error', token: '--semantic-error', hex: theme === 'dark' ? '#FB7185' : '#E11D48', desc: 'Failed, rejected, deductions' },
    { name: 'Information', token: '--semantic-info', hex: theme === 'dark' ? '#60A5FA' : '#2563EB', desc: 'Informational callouts' },
  ];

  return (
    <AmbientBackground>
      {/* Top Fixed Header / Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-themeBorder bg-panel-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Wordmark with Official Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black/70 border border-brand-luxury-gold/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,197,65,0.35)] overflow-hidden p-1 shrink-0">
              <img src="/logo-emblem.png" alt="RiseUpZed Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  RISEUP<span className="text-brand-luxury-gold">ZED</span>
                </span>
                <Badge variant="active" size="sm">MODULE 1</Badge>
              </div>
              <p className="text-[11px] text-themeText-muted hidden sm:block">Design System & Visual Foundation</p>
            </div>
          </div>

          {/* Quick Section Jump Anchors (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-themeText-secondary">
            <a href="#hero" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">Overview</a>
            <a href="#palette" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">Palette</a>
            <a href="#typography" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">Typography</a>
            <a href="#cards" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">3D Cards</a>
            <a href="#buttons" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">Buttons & Forms</a>
            <a href="#feedback" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">Feedback</a>
            <a href="#data" className="px-3 py-1.5 rounded-control hover:text-themeText-primary hover:bg-panel-elevated transition-colors">Data Primitives</a>
          </nav>

          {/* Controls: Theme Toggle & Reduced Motion Simulation */}
          <div className="flex items-center gap-2">
            <Tooltip content={isReducedMotion ? 'Reduced Motion: ON (Simulated)' : 'Reduced Motion: OFF'}>
              <Button
                variant={isReducedMotion ? 'primary' : 'outline'}
                size="sm"
                onClick={toggleReducedMotion}
                aria-label="Toggle reduced motion simulation"
                className="h-9 px-2.5 text-xs font-medium"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isReducedMotion ? 'Reduced Motion' : 'Motion'}</span>
              </Button>
            </Tooltip>

            <Tooltip content={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-9 w-9 p-0"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-luxury-gold" /> : <Moon className="w-4 h-4 text-brand-bright-violet" />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Content Showcase Container */}
      <main key={motionReplayKey} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
        
        {/* ========================================================================= */}
        {/* SECTION A: VISUAL HERO & BRAND SHOWCASE */}
        {/* ========================================================================= */}
        <section id="hero" className="relative pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Typography & System Statement */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-bright-violet/30 bg-brand-bright-violet/10 text-xs font-medium text-brand-soft-lavender shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyber-cyan" />
                <span>Next-Generation Member & Wallet Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-themeText-primary leading-[1.1]">
                Precision Design for <span className="text-gradient-purple">Riseupzed</span>
              </h1>

              <p className="text-base sm:text-lg text-themeText-secondary max-w-2xl leading-relaxed">
                Visual foundation engineered with <strong className="text-themeText-primary">midnight black</strong>, <strong className="text-brand-bright-violet">royal purple</strong>, and <strong className="text-brand-cyber-cyan">electric cyan</strong>. Designed with balanced 3D card depth, restrained glowing contours, and hardware-accelerated motion.
              </p>

              {/* Visual Balance Bar (70% dark / 20% purple / 10% cyan & gold) */}
              <div className="p-4 rounded-standard border border-themeBorder bg-panel-primary/60 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between text-xs text-themeText-muted">
                  <span className="font-medium text-themeText-secondary">Design System Visual Balance</span>
                  <span className="font-mono">70% Surfaces / 20% Violet / 10% Cyan & Gold</span>
                </div>
                <div className="h-2.5 w-full rounded-full overflow-hidden flex shadow-inner">
                  <div className="w-[70%] bg-panel-elevated border-r border-black/30" title="70% Midnight / Dark surfaces" />
                  <div className="w-[20%] bg-brand-bright-violet border-r border-black/30" title="20% Purple & Violet accents" />
                  <div className="w-[7%] bg-brand-cyber-cyan border-r border-black/30" title="7% Cyber Cyan accents" />
                  <div className="w-[3%] bg-brand-luxury-gold" title="3% Luxury Gold highlights" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                  onClick={() => {
                    const el = document.getElementById('palette');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Design Tokens
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={triggerReplay}
                >
                  Replay Motion Presets
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Shield className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Inspect Architecture Dialog
                </Button>
              </div>
            </div>

            {/* Right Column: Signature 3D Tilt Member Card Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <TiltCard className="w-full max-w-md p-1 bg-gradient-to-br from-brand-electric-violet/40 via-themeBorder to-brand-cyber-cyan/30 rounded-featured shadow-2xl">
                <div className="relative overflow-hidden rounded-[18px] bg-panel-primary p-7 border border-white/10 text-left">
                  {/* Atmospheric Glow on Card */}
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand-bright-violet/25 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-brand-cyber-cyan/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="relative z-10 flex items-center justify-between pb-6 border-b border-themeBorder-subtle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-standard bg-gradient-to-br from-brand-electric-violet to-brand-bright-violet flex items-center justify-center text-white font-bold shadow-glow-purple">
                        RZ
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold tracking-tight text-white">Riseupzed Member Card</h4>
                        <span className="text-[11px] text-themeText-muted font-mono">ID: RZ-8942-ELITE</span>
                      </div>
                    </div>
                    <Badge variant="premium" size="sm">DIAMOND VIP</Badge>
                  </div>

                  {/* Card Balance Display */}
                  <div className="relative z-10 py-6">
                    <span className="text-xs uppercase font-medium tracking-wider text-themeText-muted">Available Vault Balance</span>
                    <div className="text-3xl font-bold tracking-tight text-white tabular-numbers mt-1">
                      $148,920.45 <span className="text-xs text-brand-cyber-cyan font-normal">USDT</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center text-xs font-semibold text-semantic-success bg-semantic-success/15 px-2 py-0.5 rounded">
                        <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
                      </span>
                      <span className="text-xs text-themeText-muted">Monthly yield reward</span>
                    </div>
                  </div>

                  {/* Card Micro Metric Grid */}
                  <div className="relative z-10 grid grid-cols-2 gap-3 pt-4 border-t border-themeBorder-subtle">
                    <div className="p-2.5 rounded-control bg-panel-elevated/60 border border-themeBorder/50">
                      <span className="text-[11px] text-themeText-muted block">Direct Staked</span>
                      <span className="text-sm font-semibold text-white tabular-numbers">$95,000.00</span>
                    </div>
                    <div className="p-2.5 rounded-control bg-panel-elevated/60 border border-themeBorder/50">
                      <span className="text-[11px] text-themeText-muted block">Network Size</span>
                      <span className="text-sm font-semibold text-brand-cyber-cyan tabular-numbers">1,420 Nodes</span>
                    </div>
                  </div>

                  {/* Interactive Card Action Preview */}
                  <div className="relative z-10 mt-5 flex items-center gap-2">
                    <Button variant="primary" size="sm" className="w-full">
                      Quick Deposit
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full">
                      Transfer
                    </Button>
                  </div>

                  {/* Subtle 3D Tilt Hint Badge */}
                  <div className="mt-4 text-center">
                    <span className="text-[10px] text-themeText-muted uppercase tracking-widest font-mono">
                      Hover & move cursor to test 3D tilt
                    </span>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION B: MANDATORY COLOUR PALETTE */}
        {/* ========================================================================= */}
        <section id="palette" className="space-y-8 text-left">
          <div className="border-b border-themeBorder pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Badge variant="active" size="sm">CENTRALIZED TOKENS</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary mt-2">
                  System Colour Palette
                </h2>
                <p className="text-sm text-themeText-secondary mt-1">
                  CSS custom properties exposed through Tailwind utilities. Click any swatch to copy its hex token.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleTheme} leftIcon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}>
                  {theme === 'dark' ? 'Test Light Theme' : 'Test Dark Theme'}
                </Button>
              </div>
            </div>
          </div>

          {/* 1. Primary Surfaces */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              1. Primary Surfaces (70% Dominance)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {surfaceColors.map(color => (
                <ColorSwatchCard
                  key={color.token}
                  color={color}
                  isCopied={copiedToken === color.name}
                  onCopy={() => handleCopy(color.hex, color.name)}
                />
              ))}
            </div>
          </div>

          {/* 2. Brand Colors */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              2. Brand Colors (20% Purple & Violet Accents + 10% Cyan/Gold Highlights)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {brandColors.map(color => (
                <ColorSwatchCard
                  key={color.token}
                  color={color}
                  isCopied={copiedToken === color.name}
                  onCopy={() => handleCopy(color.hex, color.name)}
                />
              ))}
            </div>
          </div>

          {/* 3. Text & Borders */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              3. Typography & Border Tokens
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {textAndBorders.map(color => (
                <ColorSwatchCard
                  key={color.token}
                  color={color}
                  isCopied={copiedToken === color.name}
                  onCopy={() => handleCopy(color.hex, color.name)}
                />
              ))}
            </div>
          </div>

          {/* 4. Semantic Status Colors */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              4. Semantic Colors (Status, Feedback & Verification)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {semanticColors.map(color => (
                <ColorSwatchCard
                  key={color.token}
                  color={color}
                  isCopied={copiedToken === color.name}
                  onCopy={() => handleCopy(color.hex, color.name)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Divider Showcase */}
        <Divider label="Visual & Structural Tokens" />

        {/* ========================================================================= */}
        {/* SECTION C: TYPOGRAPHY SYSTEM */}
        {/* ========================================================================= */}
        <section id="typography" className="space-y-8 text-left">
          <div className="border-b border-themeBorder pb-4">
            <Badge variant="active" size="sm">TYPOGRAPHY TOKENS</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary mt-2">
              Typography Scale & Hierarchy
            </h2>
            <p className="text-sm text-themeText-secondary mt-1">
              Precision sans-serif font pairing with optimized line heights, letter-spacing, and tabular numeric values.
            </p>
          </div>

          <Card variant="standard" padding="lg" className="space-y-8">
            {/* Display Heading */}
            <div className="border-b border-themeBorder-subtle pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-soft-lavender">Display Heading — text-5xl / font-bold / tracking-tight</span>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight text-themeText-primary">
                  Sovereign Member Dashboard
                </p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">48px / Line Height 1.1</span>
            </div>

            {/* Page Heading H1 */}
            <div className="border-b border-themeBorder-subtle pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-soft-lavender">Page Heading (H1) — text-3xl / font-bold</span>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary">
                  Multi-Currency Liquidity Pool Overview
                </p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">30px / Line Height 1.25</span>
            </div>

            {/* Section Heading H2 */}
            <div className="border-b border-themeBorder-subtle pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-soft-lavender">Section Heading (H2) — text-2xl / font-semibold</span>
                <p className="text-xl sm:text-2xl font-semibold tracking-tight text-themeText-primary">
                  Network Tree & Rank Hierarchy Metrics
                </p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">24px / Line Height 1.3</span>
            </div>

            {/* Card Title H3 */}
            <div className="border-b border-themeBorder-subtle pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-soft-lavender">Card Title (H3) — text-lg / font-semibold</span>
                <p className="text-lg font-semibold text-themeText-primary">
                  Instant Vault Staking Yield Distribution
                </p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">18px / Line Height 1.4</span>
            </div>

            {/* Body Text */}
            <div className="border-b border-themeBorder-subtle pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-1 max-w-3xl">
                <span className="text-xs font-mono text-brand-soft-lavender">Body Text — text-sm / text-themeText-secondary / leading-relaxed</span>
                <p className="text-sm text-themeText-secondary leading-relaxed">
                  Riseupzed delivers high-performance node tracking and automated wallet settlement for institutional members. Every transaction is cryptographically signed and settled directly in the user’s designated vault contract with full auditability.
                </p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">14px / Line Height 1.6</span>
            </div>

            {/* Caption & Micro-labels */}
            <div className="border-b border-themeBorder-subtle pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-soft-lavender">Caption / Overline — text-xs / uppercase / tracking-wider</span>
                <p className="text-xs uppercase tracking-wider font-semibold text-themeText-muted">
                  CONFIRMATION STATUS: 12 OF 12 BLOCK VALIDATIONS
                </p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">12px / Tracking +0.05em</span>
            </div>

            {/* Numeric Summaries & Tabular Numbers */}
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-brand-soft-lavender">Numeric Metric (Tabular numbers) — tabular-numbers / font-bold</span>
                <div className="text-3xl sm:text-4xl font-bold tabular-numbers text-themeText-primary tracking-tight">
                  $3,842,910.82 <span className="text-base text-semantic-success font-semibold">(+24.8%)</span>
                </div>
                <p className="text-xs text-themeText-muted">Zero monospace jitter during real-time value updates</p>
              </div>
              <span className="text-xs text-themeText-muted font-mono shrink-0">36px / Tabular-nums</span>
            </div>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* SECTION D: CARD GALLERY & 3D DEPTH SHOWCASE */}
        {/* ========================================================================= */}
        <section id="cards" className="space-y-8 text-left">
          <div className="border-b border-themeBorder pb-4">
            <Badge variant="active" size="sm">3D DEPTH SYSTEM</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary mt-2">
              Card Architecture & Surface Variations
            </h2>
            <p className="text-sm text-themeText-secondary mt-1">
              Multi-layered surfaces with subtle borders, top-edge highlights, restrained elevation shadows, and glow contours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Standard Card */}
            <Card variant="standard" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="default" size="sm">Standard Card</Badge>
                <Layers className="w-4 h-4 text-themeText-muted" />
              </div>
              <h4 className="text-base font-semibold text-themeText-primary">Restrained Midnight Surface</h4>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Background token `#101024` with fine dark border and top-edge inset highlight for balanced depth.
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono text-themeText-muted">var(--card-shadow)</span>
              </div>
            </Card>

            {/* 2. Elevated Card */}
            <Card variant="elevated" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="active" size="sm">Elevated Card</Badge>
                <Zap className="w-4 h-4 text-brand-bright-violet" />
              </div>
              <h4 className="text-base font-semibold text-themeText-primary">Elevated Panel Surface</h4>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Background token `#20183B` designed for modals, active popovers, and elevated summaries.
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono text-themeText-muted">var(--card-shadow-elevated)</span>
              </div>
            </Card>

            {/* 3. Interactive Card */}
            <Card variant="interactive" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="pending" size="sm">Interactive Card</Badge>
                <ArrowUpRight className="w-4 h-4 text-brand-cyber-cyan" />
              </div>
              <h4 className="text-base font-semibold text-themeText-primary">Hover Elevation & Border Glow</h4>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Hover to trigger subtle vertical translation (-4px) and cyan/violet contour luminance.
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono text-brand-cyber-cyan">hover:shadow-card-hover</span>
              </div>
            </Card>

            {/* 4. Glass Panel */}
            <Card variant="glass" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="default" size="sm">Glass Surface</Badge>
                <Sparkles className="w-4 h-4 text-brand-soft-lavender" />
              </div>
              <h4 className="text-base font-semibold text-themeText-primary">Frosted Glass Surface</h4>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Translucent background with `backdrop-blur-xl` and fine semi-transparent white border.
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono text-themeText-muted">backdrop-filter: blur(16px)</span>
              </div>
            </Card>

            {/* 5. Gradient Feature Card */}
            <Card variant="gradient-feature" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="premium" size="sm">Feature Highlight</Badge>
                <Award className="w-4 h-4 text-brand-luxury-gold" />
              </div>
              <h4 className="text-base font-semibold text-themeText-primary">Midnight-to-Purple Ambient</h4>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Subtle gradient from royal purple into midnight background with bright violet edge highlight.
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono text-brand-luxury-gold">gradient-to-br from-panel-secondary</span>
              </div>
            </Card>

            {/* 6. Showcase 3D Tilt Card */}
            <TiltCard maxTilt={4}>
              <Card variant="standard" padding="md" className="space-y-3 border-brand-bright-violet/40 shadow-glow-purple/20">
                <div className="flex items-center justify-between">
                  <Badge variant="active" size="sm">Interactive 3D Tilt</Badge>
                  <Activity className="w-4 h-4 text-brand-cyber-cyan" />
                </div>
                <h4 className="text-base font-semibold text-themeText-primary">Balanced 2°–4° Tilt</h4>
                <p className="text-xs text-themeText-secondary leading-relaxed">
                  Smooth spring dampening, holographic sheen reflection, and reduced-motion aware.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-mono text-brand-soft-lavender">Perspective 1200 / Spring return</span>
                </div>
              </Card>
            </TiltCard>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION E: BUTTONS & FORM CONTROLS */}
        {/* ========================================================================= */}
        <section id="buttons" className="space-y-8 text-left">
          <div className="border-b border-themeBorder pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Badge variant="active" size="sm">INPUTS & INTERACTIONS</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary mt-2">
                  Button Variants & Accessible Form Controls
                </h2>
                <p className="text-sm text-themeText-secondary mt-1">
                  Tested states: default, hover, active tap, disabled, loading, and accessible validation feedback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsButtonLoading(prev => !prev)}
                >
                  {isButtonLoading ? 'Stop Button Spinners' : 'Toggle Loading State'}
                </Button>
                <Button
                  variant={showFormErrors ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => setShowFormErrors(prev => !prev)}
                >
                  {showFormErrors ? 'Clear Validation Errors' : 'Simulate Validation Errors'}
                </Button>
              </div>
            </div>
          </div>

          {/* Button Variants Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              1. Button Variants & Sizes
            </h3>
            <Card variant="standard" padding="lg" className="space-y-6">
              {/* Large Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" isLoading={isButtonLoading} rightIcon={<ArrowUpRight className="w-5 h-5" />}>
                  Primary Action
                </Button>
                <Button variant="secondary" size="lg" isLoading={isButtonLoading}>
                  Secondary Action
                </Button>
                <Button variant="outline" size="lg" isLoading={isButtonLoading}>
                  Outline Action
                </Button>
                <Button variant="ghost" size="lg">
                  Ghost Action
                </Button>
                <Button variant="destructive" size="lg">
                  Destructive
                </Button>
              </div>

              {/* Medium Buttons (Standard) */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md" isLoading={isButtonLoading}>
                  Primary Medium
                </Button>
                <Button variant="secondary" size="md" isLoading={isButtonLoading}>
                  Secondary Medium
                </Button>
                <Button variant="outline" size="md" isLoading={isButtonLoading}>
                  Outline Medium
                </Button>
                <Button variant="ghost" size="md">
                  Ghost Medium
                </Button>
                <Button variant="destructive" size="md">
                  Destructive
                </Button>
                <Button variant="primary" size="md" disabled>
                  Disabled Button
                </Button>
              </div>

              {/* Small Buttons & Icon-only */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm" isLoading={isButtonLoading}>
                  Primary Small
                </Button>
                <Button variant="secondary" size="sm" isLoading={isButtonLoading}>
                  Secondary Small
                </Button>
                <Button variant="outline" size="sm" isLoading={isButtonLoading}>
                  Outline Small
                </Button>
                <Button variant="ghost" size="sm">
                  Ghost Small
                </Button>
                <Button variant="icon" size="sm" aria-label="Quick action">
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button variant="icon" size="md" aria-label="Notifications">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="icon" size="lg" aria-label="Settings">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Form Controls Grid */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              2. Form Controls & Interactive Inputs
            </h3>
            <Card variant="standard" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Standard Text Input */}
                <Input
                  label="Member Full Name"
                  value={textVal}
                  onChange={e => setTextVal(e.target.value)}
                  placeholder="Enter full legal name"
                  helperText={showFormErrors ? undefined : 'Matches identity verification document'}
                  error={showFormErrors ? 'Name must be at least 3 characters' : undefined}
                />

                {/* Email Input */}
                <Input
                  label="Registered Email"
                  type="email"
                  value={emailVal}
                  onChange={e => setEmailVal(e.target.value)}
                  placeholder="name@domain.com"
                  helperText={showFormErrors ? undefined : 'Used for two-factor security alerts'}
                  error={showFormErrors ? 'Invalid institutional domain provided' : undefined}
                />

                {/* Password Input with Eye Toggle */}
                <PasswordInput
                  label="Vault Access Key"
                  defaultValue="SuperSecretKey#2026"
                  helperText={showFormErrors ? undefined : 'Click the eye icon to toggle visibility'}
                  error={showFormErrors ? 'Key must contain 12+ characters and symbols' : undefined}
                />

                {/* Search Input */}
                <SearchInput
                  label="Quick Network Search"
                  placeholder="Search members, transactions..."
                  shortcut="⌘K"
                  helperText="Supports fuzzy searching across member nodes"
                />

                {/* Select Field */}
                <Select
                  label="VIP Membership Tier"
                  value={tierVal}
                  onChange={e => setTierVal(e.target.value)}
                  options={[
                    { label: 'Diamond Tier (Top 1%)', value: 'diamond' },
                    { label: 'Platinum Tier (Executive)', value: 'platinum' },
                    { label: 'Gold Tier (Standard Staker)', value: 'gold' },
                    { label: 'Silver Tier (Trial Member)', value: 'silver' },
                  ]}
                  helperText="Determines staking percentage and referral tier"
                />

                {/* Disabled Input */}
                <Input
                  label="Contract Hash (Read Only)"
                  value="0x89fB234...9482Ac"
                  disabled
                  helperText="Immutable blockchain settlement address"
                />
              </div>

              {/* Textarea */}
              <div className="mt-6">
                <Textarea
                  label="Vault Transfer Memo / Internal Note"
                  placeholder="Provide transaction context or approval notes..."
                  defaultValue="Module 1 visual foundation verification. Design tokens and components loaded successfully."
                  helperText={showFormErrors ? undefined : 'Optional 256-character memo encoded with transfer'}
                  error={showFormErrors ? 'Memo exceeds character allowance' : undefined}
                />
              </div>

              {/* Checkboxes, Switches, Radio Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-6 border-t border-themeBorder-subtle">
                {/* Switches */}
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary block">
                    Switches
                  </span>
                  <Switch
                    label="Automated Yield Compounding"
                    description="Re-stake accrued returns every 24 hours"
                    checked={switchVal1}
                    onChange={setSwitchVal1}
                  />
                  <Switch
                    label="SMS Authorization"
                    description="Request SMS code on withdrawal requests"
                    checked={switchVal2}
                    onChange={setSwitchVal2}
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary block">
                    Checkboxes
                  </span>
                  <Checkbox
                    label="Acknowledge Liquidity Terms"
                    description="I accept sovereign staking liquidity rules"
                    checked={checkboxVal}
                    onChange={setCheckboxVal}
                  />
                  <Checkbox
                    label="Audit Trail Email Summary"
                    description="Send weekly transaction digest"
                    checked={false}
                  />
                </div>

                {/* Radio Group */}
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary block">
                    Settlement Speed
                  </span>
                  <RadioGroup
                    name="settlement-speed"
                    value={radioVal}
                    onChange={setRadioVal}
                    options={[
                      { value: 'instant', label: 'Instant Priority', description: 'Zero blocks delay, instant execution', badge: 'Recommended' },
                      { value: 'standard', label: 'Standard Batch', description: 'Settled within 10–15 minutes' },
                    ]}
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION F: FEEDBACK, OVERLAYS & MOTION SHOWCASE */}
        {/* ========================================================================= */}
        <section id="feedback" className="space-y-8 text-left">
          <div className="border-b border-themeBorder pb-4">
            <Badge variant="active" size="sm">FEEDBACK & OVERLAYS</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary mt-2">
              Notifications, Dialogs & Progress Systems
            </h2>
            <p className="text-sm text-themeText-secondary mt-1">
              Test toast popups, inline alerts, shimmer loading skeletons, progress bars, and accessible modals.
            </p>
          </div>

          {/* Interactive Toast Triggers */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              1. Interactive Toast Notifications
            </h3>
            <Card variant="standard" padding="md" className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast({ title: 'Transfer Completed', message: '2,500 USDT deposited into your vault.', type: 'success' })}
                leftIcon={<CheckCircle className="w-4 h-4 text-semantic-success" />}
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast({ title: 'Network Congestion', message: 'Gas fees currently elevated (+18%).', type: 'warning' })}
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast({ title: 'Authentication Failed', message: 'Signature verification timed out.', type: 'error' })}
              >
                Trigger Error Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast({ title: 'System Notice', message: 'Scheduled maintenance in 24 hours.', type: 'info' })}
              >
                Trigger Info Toast
              </Button>
            </Card>
          </div>

          {/* Inline Alerts */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              2. Inline Alerts
            </h3>
            <div className="space-y-3">
              {activeAlert && (
                <Alert
                  type="info"
                  title="System Upgrade Notice"
                  onClose={() => setActiveAlert(false)}
                >
                  Riseupzed visual foundation module initialized. All centralized design tokens, components, and motion parameters are loaded and ready for downstream screens.
                </Alert>
              )}
              <Alert type="success" title="Security Verification Complete">
                Vault multi-signature quorum established with 3 of 5 active validators.
              </Alert>
              <Alert type="warning" title="Threshold Approaching">
                Vault balance has reached 85% of allocated daily volume limit.
              </Alert>
              <Alert type="error" title="Transaction Reverted">
                Insufficient gas allowance provided for automated smart contract execution.
              </Alert>
            </div>
          </div>

          {/* Progress Indicators & Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Progress Bars */}
            <Card variant="standard" padding="md" className="space-y-5">
              <h4 className="text-sm font-semibold text-themeText-primary">Progress Indicators</h4>
              <Progress value={78} label="Monthly Network Staking Target" showPercentage variant="gradient" />
              <Progress value={45} label="Vault Security Quorum" showPercentage variant="purple" size="sm" />
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <CircularProgress value={85} size={56} />
                  <div>
                    <span className="text-xs font-semibold text-themeText-primary block">Staking Allocation</span>
                    <span className="text-[11px] text-themeText-muted">85% of vault locked</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CircularProgress value={42} size={56} />
                  <div>
                    <span className="text-xs font-semibold text-themeText-primary block">Node Sync</span>
                    <span className="text-[11px] text-themeText-muted">42% blocks parsed</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Skeletons */}
            <Card variant="standard" padding="md" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-themeText-primary">Shimmer Loading Skeletons</h4>
                <Badge variant="default" size="sm">Animated</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={44} height={44} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="60%" height={14} />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              </div>
              <Skeleton variant="rectangular" height={52} />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
              </div>
            </Card>
          </div>

          {/* Empty State Component Showcase */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              3. Empty State Presentation Primitive
            </h3>
            <EmptyState
              icon={<Search className="w-6 h-6 stroke-[1.5]" />}
              title="No Pending Settlement Authorizations"
              description="All queued transactions have been verified by member node multi-signature consensus."
              action={
                <Button variant="secondary" size="sm" onClick={() => showToast({ title: 'Refreshed', message: 'Queue is clear.', type: 'info' })}>
                  Refresh Queue
                </Button>
              }
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION G: DATA DISPLAY & NAVIGATION PRIMITIVES */}
        {/* ========================================================================= */}
        <section id="data" className="space-y-8 text-left">
          <div className="border-b border-themeBorder pb-4">
            <Badge variant="active" size="sm">DATA PRIMITIVES</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary mt-2">
              Navigation Primitives & Table Display
            </h2>
            <p className="text-sm text-themeText-secondary mt-1">
              Reusable tabs, breadcrumbs, nav links, metric cards, and foundational table styling.
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricDisplay
              label="Total Network Value"
              value="$14,892,100"
              change="+18.4%"
              trend="up"
              timeframe="vs last month"
              icon={<Wallet className="w-4 h-4" />}
              accent="violet"
            />
            <MetricDisplay
              label="Active Staking Nodes"
              value="2,480"
              change="+52 nodes"
              trend="up"
              timeframe="this week"
              icon={<Users className="w-4 h-4" />}
              accent="cyan"
            />
            <MetricDisplay
              label="24h Yield Distributed"
              value="$48,250.00"
              change="-2.1%"
              trend="down"
              timeframe="vs yesterday"
              icon={<TrendingUp className="w-4 h-4" />}
              accent="gold"
            />
            <MetricDisplay
              label="Global Rank Standing"
              value="Diamond II"
              change="Top 0.8%"
              trend="neutral"
              timeframe="leaderboard"
              icon={<Award className="w-4 h-4" />}
              accent="violet"
            />
          </div>

          {/* Navigation Primitives: Tabs & Breadcrumb */}
          <Card variant="standard" padding="md" className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">
                Breadcrumb Navigation
              </span>
              <Breadcrumb
                items={[
                  { label: 'Riseupzed', href: '#' },
                  { label: 'Design System', href: '#' },
                  { label: 'Foundation & Tokens', isCurrent: true },
                ]}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-themeBorder-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">
                Animated Sliding Tabs (Pill & Underline)
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs
                  variant="pill"
                  tabs={[
                    { id: 'components', label: 'Component Library', badge: 16 },
                    { id: 'tokens', label: 'Design Tokens', badge: 'v1.0' },
                    { id: 'motion', label: 'Motion Specs' },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
                <Tabs
                  variant="underline"
                  tabs={[
                    { id: 'components', label: 'Overview' },
                    { id: 'tokens', label: 'Properties' },
                    { id: 'motion', label: 'Changelog' },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </div>
            </div>

            {/* NavLink Primitives */}
            <div className="space-y-2 pt-2 border-t border-themeBorder-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">
                Sidebar Navigation Item Primitives
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NavLink active icon={<CreditCard className="w-4 h-4" />} badge={<Badge variant="active" size="sm">Active</Badge>}>
                  Member Wallet
                </NavLink>
                <NavLink icon={<Users className="w-4 h-4" />} badge={<Badge variant="default" size="sm">14</Badge>}>
                  Organization Tree
                </NavLink>
                <NavLink icon={<Shield className="w-4 h-4" />}>
                  Security Vault
                </NavLink>
              </div>
            </div>
          </Card>

          {/* Data Table Preview */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-brand-soft-lavender uppercase tracking-wider">
              Table Primitive Styling & Alignment
            </h3>
            <DataTablePreview />
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-10 pb-8 border-t border-themeBorder text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-themeText-primary">RISEUPZED DESIGN FOUNDATION</span>
            <span className="text-xs text-themeText-muted">•</span>
            <span className="text-xs text-themeText-muted font-mono">MODULE 1 COMPLETE</span>
          </div>
          <p className="text-xs text-themeText-muted max-w-xl mx-auto leading-relaxed">
            Centralized design system for React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide. Foundation ready for subsequent dashboard modules.
          </p>
        </footer>
      </main>

      {/* Architecture Confirmation Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Module 1 Architecture & Specifications"
        description="Core visual parameters established for downstream screens."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                showToast({
                  title: 'Architecture Verified',
                  message: 'Module 1 ready for Module 2 expansion.',
                  type: 'success',
                });
              }}
            >
              Confirm Specifications
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-themeText-secondary leading-relaxed">
          <p>
            This modal confirms that all <strong>Module 1 visual tokens</strong> have been properly registered and decoupled from business logic:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-themeText-muted">
            <li><strong>Midnight background:</strong> #080817</li>
            <li><strong>Purple surfaces:</strong> #101024, #17112F, #20183B, #2A1850</li>
            <li><strong>Brand accents:</strong> #5520A8, #8B5CF6, #22D3EE, #F5C451</li>
            <li><strong>Motion Tokens:</strong> Fast (140ms), Standard (220ms), Emphasis (380ms)</li>
            <li><strong>Reduced Motion:</strong> Fully tested and override-able</li>
          </ul>
        </div>
      </Modal>
    </AmbientBackground>
  );
};

interface ColorSwatchProps {
  color: { name: string; token: string; hex: string; desc: string };
  isCopied: boolean;
  onCopy: () => void;
}

const ColorSwatchCard: React.FC<ColorSwatchProps> = ({ color, isCopied, onCopy }) => {
  return (
    <div
      onClick={onCopy}
      className="group relative p-3 rounded-standard border border-themeBorder bg-panel-primary hover:border-brand-bright-violet/50 hover:bg-panel-elevated/50 transition-all cursor-pointer select-none shadow-sm flex flex-col justify-between h-36"
    >
      <div>
        <div
          className="w-full h-12 rounded-control border border-black/20 shadow-inner flex items-center justify-end p-2 transition-transform group-hover:scale-[1.02]"
          style={{ backgroundColor: color.hex }}
        >
          <span className="p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {isCopied ? <Check className="w-3.5 h-3.5 text-semantic-success" /> : <Copy className="w-3.5 h-3.5" />}
          </span>
        </div>
        <h5 className="text-xs font-semibold text-themeText-primary mt-2 group-hover:text-brand-bright-violet transition-colors">
          {color.name}
        </h5>
        <p className="text-[11px] text-themeText-muted font-mono mt-0.5">{color.hex}</p>
      </div>

      <div className="text-[10px] text-themeText-muted truncate pt-1 border-t border-themeBorder-subtle">
        {color.desc}
      </div>
    </div>
  );
};
