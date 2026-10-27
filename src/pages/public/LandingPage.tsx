import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Layers,
  Users,
  ChevronDown,
  Sparkles,
  Wallet,
  Compass,
  CheckCircle2,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TiltCard } from '../../components/effects/TiltCard';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../config/routes';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      try {
        window.history.pushState(null, '', href);
      } catch {
        // ignore
      }
    }
  };

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Preview', href: '#preview' },
    { label: 'FAQ', href: '#faq' },
  ];

  const features = [
    {
      icon: <Users className="w-6 h-6 text-brand-bright-violet" />,
      title: 'Member Management Hub',
      description: 'Streamlined account profiles, real-time activation verification, and personalized member consoles.',
      tag: 'Core Platform',
    },
    {
      icon: <Layers className="w-6 h-6 text-brand-cyber-cyan" />,
      title: 'Binary Network Canvas',
      description: 'Complete organizational transparency with dual Left and Right structural placement tracking.',
      tag: 'Hierarchy',
    },
    {
      icon: <Wallet className="w-6 h-6 text-brand-luxury-gold" />,
      title: 'Dual-Vault Accounting',
      description: 'Separated Transaction and Mother Wallets for disciplined liquidity tracking and secure token custody.',
      tag: 'Multi-Wallet',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-semantic-success" />,
      title: 'VIP Staking Matrix',
      description: 'Structured membership tiers spanning Starter, Silver, Gold, Platinum, and Diamond privileges.',
      tag: 'Tiers',
    },
    {
      icon: <Activity className="w-6 h-6 text-brand-lavender" />,
      title: 'Transparent Ledger',
      description: 'Every deposit, transfer, matching incentive, and dividend logged in an immutable transaction trail.',
      tag: 'Audit Trail',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-cyber-cyan" />,
      title: 'Enterprise Security',
      description: 'Role-enforced API authorization, server-managed sessions, and cryptographic credential hashing.',
      tag: 'Security',
    },
  ];

  const faqs = [
    {
      question: 'What is the RiseUpZed Interactive Platform?',
      answer:
        'RiseUpZed is a premium wealth management and organizational incentive platform demo. It provides unified multi-wallet custody, binary team tracking, and transparent transaction reporting for modern digital asset communities.',
    },
    {
      question: 'How do I access the interactive demo?',
      answer:
        'Click the "Explore Live Demo" button or navigate to the Sign In page. Predefined Member and Manager demo accounts are provided with instant one-click login so you can evaluate the platform immediately.',
    },
    {
      question: 'What is the difference between Member and Manager roles?',
      answer:
        'Member accounts (e.g. Johnathan Sterling) have full access to personal wallets, packages, binary organization trees, and personal transaction history. Manager accounts (e.g. Alex Vance) have elevated access to platform analytics, package distribution metrics, and system-wide audit records.',
    },
    {
      question: 'Are displayed wallet balances real financial funds?',
      answer:
        'No. This is a demonstration environment backed by a local PostgreSQL sample database. Displayed balances and records are realistic test fixtures designed to demonstrate platform operations safely without real blockchain transactions.',
    },
    {
      question: 'Can I test on mobile and tablet devices?',
      answer:
        'Yes. RiseUpZed is fully responsive. The application shell adapts seamlessly to smartphones, tablets, laptops, and ultra-wide desktop displays with dedicated touch-friendly navigation drawers.',
    },
  ];

  return (
    <div
      className={`min-h-screen selection:bg-brand-bright-violet/30 selection:text-white relative overflow-x-hidden transition-colors duration-200 ${
        theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#07090e] text-themeText-primary'
      }`}
    >
      {/* ============================================================== */}
      {/* CONTINUOUS REFERENCE HOMEPAGE BACKGROUND LAYER                 */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {theme === 'dark' ? (
          <>
            {/* Deep Midnight Navy Base Layer in Dark Mode */}
            <div className="absolute inset-0 bg-[#07090e]" />

            {/* The Exact Reference Background Image Asset in Dark Mode */}
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-[center_top] sm:bg-center transition-all duration-300"
              style={{
                backgroundImage: "url('/images/riseupzed-homepage-background.png')",
              }}
            />

            {/* Subtle Dark Mode Vignette for High Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090e]/15 to-[#07090e]/50 pointer-events-none" />
          </>
        ) : (
          /* 100% Pure, Crisp Solid White in Light Mode - No dull gray opacity! */
          <div className="absolute inset-0 bg-white" />
        )}
      </div>

      {/* 1. Public Top Navigation Header */}
      <header className="sticky top-0 z-40 homepage-header transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-luxury-gold rounded-standard p-1">
            <div className="w-11 h-11 rounded-xl bg-black/70 border border-brand-luxury-gold/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,197,65,0.35)] group-hover:border-brand-luxury-gold group-hover:shadow-[0_0_20px_rgba(245,197,65,0.5)] transition-all overflow-hidden p-1 shrink-0">
              <img src="/logo-emblem.png" alt="RiseUpZed Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-brand-luxury-gold transition-colors">
                RISEUP<span className="text-brand-luxury-gold">ZED</span>
              </span>
              <span className="text-[10px] text-themeText-muted tracking-widest uppercase -mt-1 font-mono">
                Asset Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-themeText-secondary">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="hover:text-slate-900 dark:hover:text-white transition-colors py-1 focus:outline-none focus-visible:text-brand-cyber-cyan cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-standard text-themeText-muted hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-themeBorder-subtle cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.LOGIN)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Demo
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-standard text-themeText-muted hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-standard text-themeText-secondary hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/10 homepage-card px-6 py-5 space-y-4 shadow-elevation-3"
            >
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-sm font-semibold text-slate-800 dark:text-themeText-secondary hover:text-brand-bright-violet dark:hover:text-white py-2 px-1 border-b border-themeBorder-subtle/40 flex items-center justify-between cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </a>
                ))}
              </div>
              <div className="pt-4 border-t border-themeBorder-subtle flex flex-col gap-2.5">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(ROUTES.LOGIN);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(ROUTES.LOGIN);
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Live Demo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-bright-violet/30 bg-brand-bright-violet/10 text-brand-bright-violet text-xs font-semibold backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Wealth & Incentive Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-heading font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Institutional Vault & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-bright-violet via-brand-lavender to-brand-cyber-cyan">
                Strategic Incentive
              </span> Engine
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-themeText-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans"
            >
              Experience the unified interactive demonstration of RiseUpZed. Dual-vault token custody, real-time binary network volume analytics, and automated incentive distribution built for modern community platforms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(ROUTES.LOGIN)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-glow-sm"
              >
                Explore Live Demo
              </Button>

              <a
                href="#overview"
                onClick={(e) => scrollToSection(e, '#overview')}
                className="w-full sm:w-auto cursor-pointer"
              >
                <Button variant="secondary" size="lg" className="w-full">
                  Platform Architecture
                </Button>
              </a>
            </motion.div>

            {/* Quick Specs Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-themeText-muted border-t border-white/10 dark:border-white/5"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                <span>PostgreSQL 17+ Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-cyber-cyan" />
                <span>FastAPI Microservice</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-bright-violet" />
                <span>Server-Managed Sessions</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual & Interactive 3D Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <TiltCard className="rounded-card homepage-card p-6 shadow-elevation-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-bright-violet/15 rounded-full blur-2xl pointer-events-none" />

                {/* Mock Dashboard Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-standard bg-brand-bright-violet/20 text-brand-bright-violet flex items-center justify-center font-bold">
                      JS
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Johnathan Sterling</h4>
                      <p className="text-[11px] text-themeText-muted font-mono">Member ID: RZ-8942</p>
                    </div>
                  </div>
                  <Badge variant="premium" size="sm">Diamond VIP</Badge>
                </div>

                {/* Dual Wallet Display */}
                <div className="grid grid-cols-2 gap-3 pt-5">
                  <div className="p-3.5 rounded-standard border border-white/10 bg-white/5 dark:bg-white/5">
                    <span className="text-[11px] text-themeText-muted block">Transaction Wallet</span>
                    <span className="text-lg font-bold text-brand-cyber-cyan tracking-tight font-sans">
                      148,920.45
                    </span>
                    <span className="text-[10px] text-themeText-muted block mt-0.5">USDT Staked</span>
                  </div>

                  <div className="p-3.5 rounded-standard border border-white/10 bg-white/5 dark:bg-white/5">
                    <span className="text-[11px] text-themeText-muted block">Mother Wallet</span>
                    <span className="text-lg font-bold text-brand-lavender tracking-tight font-sans">
                      25,000.00
                    </span>
                    <span className="text-[10px] text-themeText-muted block mt-0.5">USDT Reserve</span>
                  </div>
                </div>

                {/* Binary Network Teaser */}
                <div className="mt-4 p-3.5 rounded-standard border border-brand-bright-violet/20 bg-brand-bright-violet/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-themeText-secondary flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-brand-bright-violet" />
                      Active Binary Nodes
                    </span>
                    <span className="text-semantic-success text-[11px]">Synced</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-white/5 dark:bg-black/30 p-2 rounded border border-white/10">
                      <span className="text-themeText-muted block text-[10px]">LEFT PLACEMENT</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Elena Rostova</span>
                    </div>
                    <div className="bg-white/5 dark:bg-black/30 p-2 rounded border border-white/10">
                      <span className="text-themeText-muted block text-[10px]">RIGHT PLACEMENT</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Marcus Chen</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-themeText-muted">Authenticated Demo Persona</span>
                  <Link to={ROUTES.LOGIN} className="text-xs text-brand-cyber-cyan font-semibold hover:underline flex items-center gap-1">
                    Sign in with this account <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Platform Architecture Pillars Section */}
      <section id="overview" className="scroll-mt-24 py-20 border-t border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="active" size="sm">Architecture</Badge>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Four Core Architectural Pillars
            </h2>
            <p className="text-sm sm:text-base text-themeText-secondary">
              Designed from the ground up for high reliability, strict separation of concerns, and clean relational data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-card homepage-card hover:border-brand-bright-violet/50 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-standard bg-brand-bright-violet/15 text-brand-bright-violet flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-bright-violet transition-colors">
                Dual-Vault Isolation
              </h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Transaction Wallet for daily operations and Mother Wallet for reserve custody maintain independent balances and clear audit trails.
              </p>
            </div>

            <div className="p-6 rounded-card homepage-card hover:border-brand-cyber-cyan/50 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-standard bg-brand-cyber-cyan/15 text-brand-cyber-cyan flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-cyber-cyan transition-colors">
                Binary Team Canvas
              </h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Deterministic Left and Right parent-child relationships with database uniqueness constraints prevent placement collisions or hierarchy cycles.
              </p>
            </div>

            <div className="p-6 rounded-card homepage-card hover:border-brand-luxury-gold/50 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-standard bg-brand-luxury-gold/15 text-brand-luxury-gold flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-luxury-gold transition-colors">
                VIP Package Progression
              </h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Rank tiers spanning Starter, Silver, Gold, Platinum, and Diamond VIP packages, each with dedicated benefits and staking thresholds.
              </p>
            </div>

            <div className="p-6 rounded-card homepage-card hover:border-brand-lavender/50 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-standard bg-brand-lavender/15 text-brand-lavender flex items-center justify-center font-bold">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-lavender transition-colors">
                Immutable Transaction Trail
              </h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                All ledger credits, debits, cashback dividends, and transfer requests are recorded with unique alphanumeric references.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="scroll-mt-24 py-24 border-t border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="pending" size="sm">Capabilities</Badge>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Precision & Transparency
            </h2>
            <p className="text-sm sm:text-base text-themeText-secondary">
              A complete suite of member management tools accessible via a high-performance, responsive web shell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-card homepage-card hover:border-brand-bright-violet/50 transition-all space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-standard bg-white/10 dark:bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-mono text-themeText-muted">{item.tag}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-bright-violet transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-themeText-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="scroll-mt-24 py-20 border-t border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="active" size="sm">Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Three Steps to Experience the Platform
            </h2>
            <p className="text-sm sm:text-base text-themeText-secondary">
              Jump straight into the live interactive demo using verified demo credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-card homepage-card space-y-3 relative">
              <span className="text-3xl font-black text-brand-bright-violet/60 font-mono">01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Demo Account</h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Choose between a Member account (Johnathan Sterling) or Executive Manager account (Alex Vance) to test role-specific views.
              </p>
            </div>

            <div className="p-6 rounded-card homepage-card space-y-3 relative">
              <span className="text-3xl font-black text-brand-cyber-cyan/60 font-mono">02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Authenticate Securely</h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Click one-click autofill to authenticate against the FastAPI server and receive a server-managed session.
              </p>
            </div>

            <div className="p-6 rounded-card homepage-card space-y-3 relative">
              <span className="text-3xl font-black text-brand-luxury-gold/60 font-mono">03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Explore Live Balances</h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">
                Inspect real PostgreSQL wallet balances, binary organization placements, package status, and ledger records.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(ROUTES.LOGIN)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Demo Now
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Dashboard Preview Banner Section */}
      <section id="preview" className="scroll-mt-24 py-20 border-t border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-card homepage-card p-8 md:p-12 relative overflow-hidden shadow-elevation-3 border border-brand-bright-violet/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <Badge variant="premium" size="sm">Interactive Console</Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                  A High-Fidelity Member Dashboard Built on Real Data
                </h2>
                <p className="text-sm text-themeText-secondary leading-relaxed">
                  No mocked balances or synthetic numbers on the client. The authenticated dashboard queries real PostgreSQL tables via SQLAlchemy 2.0 and FastAPI, providing responsive multi-device fidelity.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(ROUTES.LOGIN)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open Live Dashboard
                  </Button>
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="secondary" size="md">
                      Manager Console
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-standard border border-white/10 bg-black/40 dark:bg-black/50 backdrop-blur-md flex items-center justify-between text-xs">
                  <span className="text-themeText-secondary">Transaction Wallet</span>
                  <span className="font-bold text-brand-cyber-cyan font-mono">148,920.45 USDT</span>
                </div>
                <div className="p-4 rounded-standard border border-white/10 bg-black/40 dark:bg-black/50 backdrop-blur-md flex items-center justify-between text-xs">
                  <span className="text-themeText-secondary">Mother Wallet</span>
                  <span className="font-bold text-brand-lavender font-mono">25,000.00 USDT</span>
                </div>
                <div className="p-4 rounded-standard border border-white/10 bg-black/40 dark:bg-black/50 backdrop-blur-md flex items-center justify-between text-xs">
                  <span className="text-themeText-secondary">Staking Vault</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">95,000.00 USDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Demo Notice & Transparency */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="p-4 rounded-standard border border-brand-cyber-cyan/30 bg-brand-cyber-cyan/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-cyber-cyan shrink-0" />
            <p className="text-themeText-secondary">
              <strong className="text-slate-900 dark:text-white">Demonstration Environment Notice:</strong> RiseUpZed is an interactive software demonstration. Displayed balances and members are deterministic sample data. No real cryptocurrency transfers or payments occur.
            </p>
          </div>
          <Badge variant="pending" size="sm">Interactive Demo</Badge>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="scroll-mt-24 py-20 border-t border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="active" size="sm">Clarifications</Badge>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-themeText-secondary">
              Common questions regarding platform demonstration, roles, and session access.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-card homepage-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-bright-violet"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-themeText-muted transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-brand-bright-violet' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-5 text-xs sm:text-sm text-themeText-secondary leading-relaxed border-t border-white/10 pt-3"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Structured Footer */}
      <footer className="homepage-footer py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/70 border border-brand-luxury-gold/40 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(245,197,65,0.3)] shrink-0">
              <img src="/logo-emblem.png" alt="RiseUpZed" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                RISEUP<span className="text-brand-luxury-gold">ZED</span>
              </span>
              <p className="text-[11px] text-themeText-muted">Interactive Digital Asset Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-themeText-secondary">
            <a href="#overview" className="hover:text-slate-900 dark:hover:text-white transition-colors">Overview</a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</a>
            <Link to={ROUTES.LOGIN} className="text-brand-cyber-cyan hover:underline">
              Demo Login
            </Link>
          </div>

          <div className="text-xs text-themeText-muted text-center md:text-right">
            <span>© {new Date().getFullYear()} RiseUpZed Demonstration Platform. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
