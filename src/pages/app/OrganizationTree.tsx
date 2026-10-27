import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitBranch,
  Search,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  UserPlus,
  Eye,
  AlertTriangle,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  api,
  TreeNodeItem,
  MemberNodeDetails,
  UnplacedMemberItem,
  ApiError,
} from '../../lib/api-client';
import { ROUTES } from '../../config/routes';

interface NavigationStep {
  code: string;
  name: string;
  level: number;
}

export const OrganizationTree: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlRootCode = searchParams.get('root_code');
  const defaultCode = user?.member_code || 'RZ-8942';
  const defaultName = user?.display_name || 'Johnathan Sterling';

  const [currentRootCode, setCurrentRootCode] = useState<string>(urlRootCode || defaultCode);
  const [searchInput, setSearchInput] = useState('');

  // Step-by-step navigation trail (Level 0 -> Level 1 -> Level 2 -> Level 3)
  const [trail, setTrail] = useState<NavigationStep[]>([
    { code: currentRootCode, name: defaultName, level: 0 },
  ]);

  const [treeData, setTreeData] = useState<TreeNodeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Node Details Modal
  const [memberDetails, setMemberDetails] = useState<MemberNodeDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Add Member to Vacant Position Modal
  const [placementSlot, setPlacementSlot] = useState<{ parentCode: string; position: 'LEFT' | 'RIGHT' } | null>(null);
  const [unplacedMembers, setUnplacedMembers] = useState<UnplacedMemberItem[]>([]);
  const [selectedPlacementMember, setSelectedPlacementMember] = useState<string>('');
  const [loadingUnplaced, setLoadingUnplaced] = useState(false);
  const [submittingPlacement, setSubmittingPlacement] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  // Mobile touch scroll container reference & branch navigation
  const treeScrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToLeftLeg = useCallback(() => {
    if (treeScrollContainerRef.current) {
      treeScrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToCenter = useCallback(() => {
    if (treeScrollContainerRef.current) {
      const el = treeScrollContainerRef.current;
      const target = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, []);

  const scrollToRightLeg = useCallback(() => {
    if (treeScrollContainerRef.current) {
      const el = treeScrollContainerRef.current;
      el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
    }
  }, []);

  // Interactive drag-to-pan state for desktop/laptop mouse users
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) {
      return;
    }
    if (!treeScrollContainerRef.current) return;
    setIsDragging(true);
    setDragStartX(e.pageX - treeScrollContainerRef.current.offsetLeft);
    setDragScrollLeft(treeScrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !treeScrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - treeScrollContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.6;
    treeScrollContainerRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Window-level dragging listener so fast mouse movements outside canvas remain active
  useEffect(() => {
    if (!isDragging) return;
    const onWindowMove = (e: MouseEvent) => {
      if (!treeScrollContainerRef.current) return;
      const x = e.pageX - treeScrollContainerRef.current.offsetLeft;
      const walk = (x - dragStartX) * 1.6;
      treeScrollContainerRef.current.scrollLeft = dragScrollLeft - walk;
    };
    const onWindowUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup', onWindowUp);
    };
  }, [isDragging, dragStartX, dragScrollLeft]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!treeScrollContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
      treeScrollContainerRef.current.scrollLeft += e.deltaY * 0.9;
    }
  };

  const loadTree = useCallback(async (rootCode?: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const targetCode = rootCode || currentRootCode;
    try {
      const data = await api.getOrganizationTree(targetCode, 3);
      setTreeData(data);

      // Update trail current name if root node matches
      if (data.member_code) {
        setTrail((prev) => {
          if (prev.length === 0) {
            return [{ code: data.member_code!, name: data.display_name || data.member_code!, level: 0 }];
          }
          const last = prev[prev.length - 1];
          if (last.code === data.member_code && last.name !== data.display_name) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, name: data.display_name || last.code };
            return updated;
          }
          return prev;
        });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : `Failed to load organization tree for ${targetCode}.`;
      setError(msg);
      showToast({ title: 'Tree Load Failed', message: msg, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentRootCode, showToast]);

  useEffect(() => {
    if (urlRootCode && urlRootCode !== currentRootCode) {
      setCurrentRootCode(urlRootCode);
    }
  }, [urlRootCode, currentRootCode]);

  useEffect(() => {
    loadTree(currentRootCode);
  }, [currentRootCode, loadTree]);

  // Auto-center horizontal scroll on tree load / level change so mobile users start centered on the root
  useEffect(() => {
    if (!loading && treeData && treeScrollContainerRef.current) {
      const el = treeScrollContainerRef.current;
      const timer = setTimeout(() => {
        const target = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
        el.scrollLeft = target;
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [loading, treeData, currentRootCode]);

  // Search User ID
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim().toUpperCase();
    if (!trimmed) return;

    // Drill down to searched node
    const nextLevel = trail.length;
    setTrail((prev) => [...prev, { code: trimmed, name: trimmed, level: nextLevel }]);
    setCurrentRootCode(trimmed);
    setSearchParams({ root_code: trimmed });
  };

  // Step-by-step BACK navigation: Level 3 -> Level 2 -> Level 1 -> Level 0
  const handleBackOneLevel = () => {
    if (trail.length > 1) {
      const newTrail = trail.slice(0, trail.length - 1);
      const targetStep = newTrail[newTrail.length - 1];
      setTrail(newTrail);
      setCurrentRootCode(targetStep.code);
      if (targetStep.level === 0 && targetStep.code === defaultCode) {
        setSearchParams({});
      } else {
        setSearchParams({ root_code: targetStep.code });
      }
    } else if (treeData?.parent_code) {
      // Direct jump up to parent if loaded without previous trail
      const pCode = treeData.parent_code;
      const pName = treeData.parent_name || pCode;
      setTrail([{ code: pCode, name: pName, level: 0 }]);
      setCurrentRootCode(pCode);
      if (pCode === defaultCode) {
        setSearchParams({});
      } else {
        setSearchParams({ root_code: pCode });
      }
    }
  };

  // Jump to specific level in breadcrumb trail
  const handleJumpToLevel = (index: number) => {
    if (index >= trail.length - 1) return;
    const newTrail = trail.slice(0, index + 1);
    const targetStep = newTrail[index];
    setTrail(newTrail);
    setCurrentRootCode(targetStep.code);
    if (targetStep.level === 0 && targetStep.code === defaultCode) {
      setSearchParams({});
    } else {
      setSearchParams({ root_code: targetStep.code });
    }
  };

  // Reset to root (Level 0)
  const handleResetToMyRoot = () => {
    const myCode = user?.member_code || 'RZ-8942';
    const myName = user?.display_name || 'Johnathan Sterling';
    setTrail([{ code: myCode, name: myName, level: 0 }]);
    setCurrentRootCode(myCode);
    setSearchParams({});
    setSearchInput('');
  };

  // Drill down into child node (Level +1)
  const handleDrillDown = (code: string, name: string) => {
    if (code === currentRootCode) return;
    const existingIndex = trail.findIndex((s) => s.code === code);
    if (existingIndex >= 0) {
      handleJumpToLevel(existingIndex);
      return;
    }
    const nextLevel = trail.length;
    setTrail((prev) => [...prev, { code, name, level: nextLevel }]);
    setCurrentRootCode(code);
    setSearchParams({ root_code: code });
  };

  // Open details modal
  const handleOpenDetails = async (code: string) => {
    setLoadingDetails(true);
    setIsDetailsModalOpen(true);
    try {
      const details = await api.getMemberNodeDetails(code);
      setMemberDetails(details);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not fetch member details.';
      showToast({ title: 'Details Error', message: msg, type: 'error' });
      setIsDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open placement modal
  const handleOpenPlacement = async (parentCode: string, position: 'LEFT' | 'RIGHT') => {
    setPlacementSlot({ parentCode, position });
    setSelectedPlacementMember('');
    setLoadingUnplaced(true);
    setIsPlacementModalOpen(true);
    try {
      const unplaced = await api.getUnplacedMembers();
      setUnplacedMembers(unplaced);
      if (unplaced.length > 0) {
        setSelectedPlacementMember(unplaced[0].member_code);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch unplaced members.';
      showToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoadingUnplaced(false);
    }
  };

  const handleSubmitPlacement = async () => {
    if (!placementSlot || !selectedPlacementMember) return;
    setSubmittingPlacement(true);
    try {
      const res = await api.placeMember({
        parent_code: placementSlot.parentCode,
        position: placementSlot.position,
        member_code: selectedPlacementMember,
      });
      showToast({
        title: 'Member Placed Successfully',
        message: res.message,
        type: 'success',
      });
      setIsPlacementModalOpen(false);
      loadTree(currentRootCode, true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to place member.';
      showToast({ title: 'Placement Failed', message: msg, type: 'error' });
    } finally {
      setSubmittingPlacement(false);
    }
  };

  // Rank badge styling helper
  const getRankBadgeInfo = (packageName?: string) => {
    const pkg = (packageName || '').toLowerCase();
    if (pkg.includes('diamond')) {
      return {
        icon: '💎',
        label: packageName || 'Diamond Ambassador',
        color: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      };
    }
    if (pkg.includes('platinum')) {
      return {
        icon: '👑',
        label: packageName || 'Platinum Director',
        color: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
      };
    }
    if (pkg.includes('gold')) {
      return {
        icon: '🥇',
        label: packageName || 'Gold Executive',
        color: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30',
      };
    }
    if (pkg.includes('silver')) {
      return {
        icon: '🥈',
        label: packageName || 'Silver Staker',
        color: 'text-slate-200 bg-slate-500/10 border-slate-500/30',
      };
    }
    return {
      icon: '⚡',
      label: packageName || 'Standard Staker',
      color: 'text-brand-cyber-cyan bg-brand-cyber-cyan/10 border-brand-cyber-cyan/30',
    };
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RZ';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Clean, structured card renderer with pristine alignment
  const renderNode = (node: TreeNodeItem, isRoot = false) => {
    if (!node.is_occupied) {
      // VACANT NODE: Clean, structured neutral card
      const pos = (node.position as 'LEFT' | 'RIGHT') || 'LEFT';
      const parentCode = node.parent_code || currentRootCode;

      return (
        <div className="w-[280px] h-[220px] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 border-2 border-dashed border-themeBorder/80 bg-gradient-to-b from-[#160d26]/90 to-[#0e071a]/95 shadow-lg hover:border-brand-luxury-gold/70 group shrink-0 relative">
          {/* Top connector notch indicator */}
          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-brand-luxury-gold/50" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-panel-secondary text-themeText-muted border border-themeBorder flex items-center gap-1">
              <span>{pos === 'LEFT' ? '◀' : '▶'}</span> {pos} SLOT
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Vacant
            </span>
          </div>

          {/* Center Identity Section */}
          <div className="flex items-center gap-3 my-auto text-left">
            <div className="w-12 h-12 rounded-xl bg-panel-secondary/80 border-2 border-dashed border-themeBorder flex items-center justify-center text-themeText-muted group-hover:border-brand-luxury-gold/60 group-hover:text-brand-luxury-gold transition-colors shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-themeText-primary truncate">
                Available Position
              </h4>
              <p className="text-[11px] text-themeText-muted mt-0.5 font-mono">
                Open Placement Slot
              </p>
            </div>
          </div>

          {/* Middle Info Banner */}
          <div className="px-2.5 py-1 rounded-lg bg-panel-secondary/50 border border-themeBorder/60 text-center">
            <span className="text-[11px] font-medium text-themeText-muted truncate block">
              Slot under <span className="font-mono text-brand-cyber-cyan font-bold">{parentCode}</span>
            </span>
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-themeBorder/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenPlacement(parentCode, pos)}
              className="w-full text-xs h-8 flex items-center justify-center gap-1.5 border-brand-luxury-gold/50 text-brand-luxury-gold hover:bg-brand-luxury-gold hover:text-black font-bold transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Member</span>
            </Button>
          </div>
        </div>
      );
    }

    // OCCUPIED NODE: Clean, structured Gold/Yellow highlighted card
    const rankInfo = getRankBadgeInfo(node.package_name);
    const initials = getInitials(node.display_name);

    return (
      <div
        className={`w-[280px] h-[220px] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 border-2 shrink-0 relative ${
          isRoot
            ? 'bg-gradient-to-b from-[#22133a] to-[#120824] border-brand-luxury-gold shadow-[0_0_25px_rgba(245,197,65,0.4)] ring-1 ring-brand-luxury-gold/30'
            : 'bg-gradient-to-b from-[#1c1032] to-[#0f071d] border-brand-luxury-gold/60 shadow-[0_0_15px_rgba(245,197,65,0.18)] hover:border-brand-luxury-gold hover:shadow-[0_0_22px_rgba(245,197,65,0.35)]'
        }`}
      >
        {/* Top connector notch indicator */}
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-brand-luxury-gold shadow-[0_0_6px_rgba(245,197,65,0.8)]" />

        {/* Header: Leg Position Badge & Status */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isRoot
                ? 'bg-brand-luxury-gold/20 text-brand-luxury-gold border-brand-luxury-gold/40 shadow-sm'
                : node.position === 'LEFT'
                ? 'bg-brand-bright-violet/20 text-brand-soft-lavender border-brand-bright-violet/40'
                : 'bg-brand-cyber-cyan/20 text-brand-cyber-cyan border-brand-cyber-cyan/40'
            }`}
          >
            {isRoot ? '★ ROOT MEMBER' : `${node.position || 'NODE'} LEG`}
          </span>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Center Identity Section */}
        <div className="flex items-center gap-3 my-auto text-left">
          {/* Avatar with initials */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border-2 shadow-inner ${
              isRoot
                ? 'bg-gradient-to-br from-amber-500/30 to-purple-800/40 border-brand-luxury-gold text-brand-luxury-gold shadow-[0_0_10px_rgba(245,197,65,0.3)]'
                : 'bg-gradient-to-br from-purple-900/40 to-slate-900/60 border-brand-luxury-gold/60 text-white'
            }`}
          >
            {initials}
          </div>

          {/* Member Details */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate tracking-tight">
              {node.display_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-brand-cyber-cyan/15 text-brand-cyber-cyan border border-brand-cyber-cyan/30">
                {node.member_code}
              </span>
            </div>
          </div>
        </div>

        {/* Rank & Package Tier Chip */}
        <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${rankInfo.color}`}>
          <span className="text-sm">{rankInfo.icon}</span>
          <span className="truncate">{rankInfo.label}</span>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-2 border-t border-brand-luxury-gold/20 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => node.member_code && handleOpenDetails(node.member_code)}
            className="flex-1 text-xs py-1 h-7 text-themeText-secondary hover:text-white hover:bg-white/10 border border-themeBorder font-semibold"
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-brand-cyber-cyan" />
            Details
          </Button>

          {!isRoot && node.member_code ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                node.member_code &&
                handleDrillDown(node.member_code, node.display_name || node.member_code)
              }
              className="flex-1 text-xs py-1 h-7 border-brand-luxury-gold text-brand-luxury-gold hover:bg-brand-luxury-gold hover:text-black font-bold transition-all shadow-sm"
              title={`Explore ${node.display_name}'s downline subtree`}
            >
              <GitBranch className="w-3.5 h-3.5 mr-1" />
              View Tree
            </Button>
          ) : isRoot ? (
            <div className="flex-1 text-center py-1 text-[11px] font-bold text-brand-luxury-gold/90 bg-brand-luxury-gold/10 rounded border border-brand-luxury-gold/20">
              Focus Node
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Safe children extraction
  const leftChild = treeData?.children?.[0];
  const rightChild = treeData?.children?.[1];

  const leftLeftChild = leftChild?.children?.[0];
  const leftRightChild = leftChild?.children?.[1];

  const rightLeftChild = rightChild?.children?.[0];
  const rightRightChild = rightChild?.children?.[1];

  const currentLevelIndex = trail.length - 1;
  const previousStep =
    trail.length > 1
      ? trail[trail.length - 2]
      : treeData?.parent_code
      ? {
          code: treeData.parent_code,
          name: treeData.parent_name || treeData.parent_code,
          level: Math.max(0, currentLevelIndex - 1),
        }
      : null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-12">
      {/* Top Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Users' },
          { label: 'Tree View' },
        ]}
      />

      {/* Main Header & Search Form */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-themeBorder pb-4 sm:pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-luxury-gold/15 border border-brand-luxury-gold/30 flex items-center justify-center text-brand-luxury-gold shadow-glow-purple shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-themeText-primary">
                  Organization Tree View
                </h1>
                <Badge variant="premium">Interactive Binary Tree</Badge>
              </div>
              <p className="text-xs sm:text-sm text-themeText-muted mt-0.5">
                Explore downline nodes level-by-level, inspect member rank details, and place unassigned stakers.
              </p>
            </div>
          </div>
        </div>

        {/* Search by User ID */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-themeText-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search User ID (e.g. RZ-8943)"
                className="w-full sm:w-56 bg-panel-secondary border border-themeBorder rounded-lg pl-9 pr-3 py-1.5 text-xs text-themeText-primary placeholder:text-themeText-muted focus:outline-none focus:border-brand-luxury-gold font-mono"
              />
            </div>
            <Button variant="primary" size="sm" type="submit" className="text-xs font-semibold shrink-0">
              View Tree
            </Button>
          </form>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTree(currentRootCode, true)}
            disabled={refreshing}
            className="text-xs shrink-0"
            title="Refresh current view"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Access Notice">
          {error}
        </Alert>
      )}

      {/* Visual Tree Viewport Card */}
      <Card variant="standard" padding="none" className="relative overflow-hidden bg-panel-primary/50 border border-themeBorder">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* ============================================================== */}
        {/* STICKY LEVEL NAVIGATION & STEP-BY-STEP BREADCRUMB BAR          */}
        {/* ============================================================== */}
        <div className="bg-panel-secondary/95 backdrop-blur-md border-b border-themeBorder p-2.5 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-20">
          {/* Left: Prominent Back Button & Step-by-Step Level Trail */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap max-w-full">
            {previousStep ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleBackOneLevel}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.5)] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shrink-0"
                title={`Return up to Level ${previousStep.level}`}
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="truncate max-w-[140px] sm:max-w-none">
                  Back to L{previousStep.level} ({previousStep.name})
                </span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-themeText-muted px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-panel-primary border border-themeBorder shrink-0">
                <Shield className="w-3.5 h-3.5 text-brand-luxury-gold" />
                <span className="font-semibold text-[11px] sm:text-xs">Top Level (Root)</span>
              </div>
            )}

            {/* Clickable Level Breadcrumb Trail */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto max-w-full py-1 px-2 rounded-xl bg-panel-primary/90 border border-themeBorder shadow-inner scrollbar-none">
              {trail.map((step, idx) => {
                const isCurrent = idx === trail.length - 1;
                return (
                  <div key={step.code + idx} className="flex items-center gap-1 shrink-0">
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-brand-luxury-gold shrink-0 opacity-80" />}
                    <button
                      type="button"
                      onClick={() => handleJumpToLevel(idx)}
                      disabled={isCurrent}
                      className={`flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                        isCurrent
                          ? 'bg-brand-luxury-gold/20 text-brand-luxury-gold border border-brand-luxury-gold/50 shadow-[0_0_10px_rgba(245,197,65,0.3)] cursor-default'
                          : 'bg-panel-secondary hover:bg-panel-secondary/80 text-themeText-secondary hover:text-brand-cyber-cyan border border-themeBorder hover:border-brand-cyber-cyan/50 cursor-pointer'
                      }`}
                      title={isCurrent ? 'Current Level Focus' : `Jump back to Level ${step.level}`}
                    >
                      <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold ${isCurrent ? 'bg-brand-luxury-gold text-black' : 'bg-panel-primary text-themeText-muted'}`}>
                        {step.level}
                      </span>
                      <span className="truncate max-w-[90px] sm:max-w-[130px]">{step.name}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Depth Counter & Reset Root */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Badge variant="premium" size="sm">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
              Level {currentLevelIndex}
            </Badge>

            {trail.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToMyRoot}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-brand-cyber-cyan border-brand-cyber-cyan/40 hover:bg-brand-cyber-cyan/10 rounded-xl px-2.5 py-1"
                title="Jump directly back to your root node (Level 0)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Return to Top Root</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Visual Map Legend */}
        <div className="p-2 sm:p-3 border-b border-themeBorder/40 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-themeText-muted bg-panel-secondary/20">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-brand-luxury-gold border border-brand-luxury-gold/50 shadow-[0_0_6px_rgba(245,197,65,0.6)] inline-block" />
              Occupied Member
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded border-2 border-dashed border-themeBorder inline-block" />
              Vacant Position
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 sm:w-4 h-0.5 bg-brand-luxury-gold shadow-[0_0_6px_rgba(245,197,65,0.8)] inline-block" />
              Lineage Connector
            </span>
          </div>

          <span className="hidden md:inline text-xs text-themeText-muted italic">
            Tip: Scroll horizontally inside the canvas below to explore wide binary branches
          </span>
        </div>

        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* QUICK-JUMP NAVIGATION & INTERACTIVE CANVAS CONTROLS            */}
        {/* ============================================================== */}
        <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#1c0f33] to-[#0d0718] border-b border-brand-luxury-gold/30 flex flex-wrap items-center justify-between gap-2 sticky top-[48px] z-20 shadow-md">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-brand-luxury-gold uppercase tracking-wider shrink-0">
            <span>⚡ Canvas Navigation:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollToLeftLeg}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-bright-violet/25 hover:bg-brand-bright-violet/40 text-brand-soft-lavender border border-brand-bright-violet/50 flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Scroll directly to Left Leg branch"
            >
              <span>◀</span> Left Leg
            </button>
            <button
              type="button"
              onClick={scrollToCenter}
              className="px-3.5 py-1 rounded-lg text-xs font-bold bg-brand-luxury-gold/25 hover:bg-brand-luxury-gold/40 text-brand-luxury-gold border border-brand-luxury-gold/60 flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Center view on Root Node"
            >
              ★ Center Root
            </button>
            <button
              type="button"
              onClick={scrollToRightLeg}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-cyber-cyan/25 hover:bg-brand-cyber-cyan/40 text-brand-cyber-cyan border border-brand-cyber-cyan/50 flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Scroll directly to Right Leg branch"
            >
              Right Leg <span>▶</span>
            </button>
          </div>
          <span className="text-[11px] text-themeText-muted font-medium hidden md:inline">
            💡 Click and drag canvas or use mouse wheel to scroll left & right
          </span>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE TREE CANVAS WITH PRISTINE CONNECTING LINES        */}
        {/* ============================================================== */}
        <div
          ref={treeScrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`w-full overflow-x-auto p-3 sm:p-8 min-h-[500px] sm:min-h-[600px] touch-auto overscroll-x-contain scrollbar-thin select-none transition-colors ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {loading ? (
            <div className="text-center py-28 text-themeText-muted w-full">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-luxury-gold" />
              <p className="text-sm font-semibold">Loading binary organization tree...</p>
            </div>
          ) : !treeData ? (
            <div className="text-center py-28 text-themeText-muted w-full">
              <AlertTriangle className="w-10 h-10 text-themeText-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold text-themeText-primary">No Tree Data Available</p>
            </div>
          ) : (
            <div className="flex flex-col items-center min-w-[1240px] pb-10 pt-4 mx-auto w-max">
              {/* If viewing a child level (Level > 0), show prominent Up-to-Parent connector! */}
              {currentLevelIndex > 0 && previousStep && (
                <div className="flex flex-col items-center mb-4">
                  <button
                    type="button"
                    onClick={handleBackOneLevel}
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-950/80 to-purple-950/80 hover:from-violet-900 hover:to-purple-900 border-2 border-brand-bright-violet/70 hover:border-brand-bright-violet text-xs text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] cursor-pointer"
                    title={`Click to go back to Level ${previousStep.level}`}
                  >
                    <ArrowLeft className="w-4 h-4 text-brand-soft-lavender group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
                    <span>
                      ↑ Return to Level {previousStep.level}: {previousStep.name} ({previousStep.code})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-bright-violet/30 font-bold uppercase tracking-wider text-brand-soft-lavender">
                      Parent
                    </span>
                  </button>

                  {/* Upward Line Connector into Parent */}
                  <div className="w-[3px] h-6 border-l-[3px] border-dashed border-brand-bright-violet/80" />
                </div>
              )}

              {/* ============================================================== */}
              {/* LEVEL 0: ROOT NODE                                            */}
              {/* ============================================================== */}
              <div className="flex flex-col items-center relative">
                {renderNode(treeData, true)}

                {/* Vertical Stem down from Root */}
                <div className="w-[3px] h-8 bg-brand-luxury-gold shadow-[0_0_12px_rgba(245,197,65,0.9)]" />

                {/* Split Junction Pulse Node */}
                <div className="w-5 h-5 rounded-full bg-[#120a22] border-2 border-brand-luxury-gold shadow-[0_0_12px_rgba(245,197,65,0.9)] flex items-center justify-center -my-2.5 z-10">
                  <div className="w-2 h-2 rounded-full bg-brand-luxury-gold animate-pulse" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* LEVEL 0 -> LEVEL 1 HORIZONTAL CONNECTOR (Span 25% to 75%)     */}
              {/* ============================================================== */}
              <div className="w-full flex justify-center">
                <div className="w-1/2 flex items-center relative">
                  {/* Left Branch Half */}
                  <div className="flex-1 h-8 border-t-[3px] border-l-[3px] border-brand-luxury-gold rounded-tl-2xl shadow-[-3px_-3px_10px_rgba(245,197,65,0.3)] relative">
                    <span className="absolute -top-3.5 left-8 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#120a22] text-brand-soft-lavender border border-brand-bright-violet/50 shadow-md flex items-center gap-1">
                      <span>◀</span> LEFT LEG
                    </span>
                  </div>

                  {/* Right Branch Half */}
                  <div className="flex-1 h-8 border-t-[3px] border-r-[3px] border-brand-luxury-gold rounded-tr-2xl shadow-[3px_-3px_10px_rgba(245,197,65,0.3)] relative">
                    <span className="absolute -top-3.5 right-8 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#120a22] text-brand-cyber-cyan border border-brand-cyber-cyan/50 shadow-md flex items-center gap-1">
                      RIGHT LEG <span>▶</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* LEVEL 1: LEFT & RIGHT SUBTREES                                 */}
              {/* ============================================================== */}
              <div className="w-full flex">
                {/* ----------------- LEFT CHILD COLUMN ----------------- */}
                <div className="w-1/2 flex flex-col items-center">
                  {/* Left Child Node Card */}
                  {leftChild ? (
                    renderNode(leftChild, false)
                  ) : (
                    renderNode(
                      {
                        node_id: 'empty-left',
                        status: 'VACANT',
                        position: 'LEFT',
                        is_occupied: false,
                        parent_code: treeData.member_code,
                        children: [],
                      },
                      false
                    )
                  )}

                  {/* Stem & Split to Level 2 Grandchildren */}
                  <div className="w-full flex flex-col items-center">
                    {/* Vertical Stem */}
                    <div className="w-[3px] h-8 bg-brand-luxury-gold shadow-[0_0_12px_rgba(245,197,65,0.9)]" />

                    {/* Junction Node */}
                    <div className="w-4 h-4 rounded-full bg-[#120a22] border-2 border-brand-luxury-gold shadow-[0_0_10px_rgba(245,197,65,0.9)] flex items-center justify-center -my-2 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-luxury-gold" />
                    </div>

                    {/* Level 1 Left -> Level 2 Grandchildren Horizontal Connector */}
                    <div className="w-full flex justify-center">
                      <div className="w-1/2 flex items-center relative">
                        <div className="flex-1 h-8 border-t-[3px] border-l-[3px] border-brand-luxury-gold rounded-tl-xl shadow-[-2px_-2px_8px_rgba(245,197,65,0.25)] relative">
                          <span className="absolute -top-3 left-4 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#120a22] text-themeText-muted border border-themeBorder">
                            L-SLOT
                          </span>
                        </div>
                        <div className="flex-1 h-8 border-t-[3px] border-r-[3px] border-brand-luxury-gold rounded-tr-xl shadow-[2px_-2px_8px_rgba(245,197,65,0.25)] relative">
                          <span className="absolute -top-3 right-4 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#120a22] text-themeText-muted border border-themeBorder">
                            R-SLOT
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Level 2 Grandchildren under Left Child */}
                    <div className="w-full flex">
                      {/* Left-Left Column */}
                      <div className="w-1/2 flex flex-col items-center">
                        {leftLeftChild ? (
                          renderNode(leftLeftChild, false)
                        ) : (
                          renderNode(
                            {
                              node_id: 'empty-left-left',
                              status: 'VACANT',
                              position: 'LEFT',
                              is_occupied: false,
                              parent_code: leftChild?.member_code || treeData.member_code,
                              children: [],
                            },
                            false
                          )
                        )}
                      </div>

                      {/* Left-Right Column */}
                      <div className="w-1/2 flex flex-col items-center">
                        {leftRightChild ? (
                          renderNode(leftRightChild, false)
                        ) : (
                          renderNode(
                            {
                              node_id: 'empty-left-right',
                              status: 'VACANT',
                              position: 'RIGHT',
                              is_occupied: false,
                              parent_code: leftChild?.member_code || treeData.member_code,
                              children: [],
                            },
                            false
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ----------------- RIGHT CHILD COLUMN ----------------- */}
                <div className="w-1/2 flex flex-col items-center">
                  {/* Right Child Node Card */}
                  {rightChild ? (
                    renderNode(rightChild, false)
                  ) : (
                    renderNode(
                      {
                        node_id: 'empty-right',
                        status: 'VACANT',
                        position: 'RIGHT',
                        is_occupied: false,
                        parent_code: treeData.member_code,
                        children: [],
                      },
                      false
                    )
                  )}

                  {/* Stem & Split to Level 2 Grandchildren */}
                  <div className="w-full flex flex-col items-center">
                    {/* Vertical Stem */}
                    <div className="w-[3px] h-8 bg-brand-luxury-gold shadow-[0_0_12px_rgba(245,197,65,0.9)]" />

                    {/* Junction Node */}
                    <div className="w-4 h-4 rounded-full bg-[#120a22] border-2 border-brand-luxury-gold shadow-[0_0_10px_rgba(245,197,65,0.9)] flex items-center justify-center -my-2 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-luxury-gold" />
                    </div>

                    {/* Level 1 Right -> Level 2 Grandchildren Horizontal Connector */}
                    <div className="w-full flex justify-center">
                      <div className="w-1/2 flex items-center relative">
                        <div className="flex-1 h-8 border-t-[3px] border-l-[3px] border-brand-luxury-gold rounded-tl-xl shadow-[-2px_-2px_8px_rgba(245,197,65,0.25)] relative">
                          <span className="absolute -top-3 left-4 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#120a22] text-themeText-muted border border-themeBorder">
                            L-SLOT
                          </span>
                        </div>
                        <div className="flex-1 h-8 border-t-[3px] border-r-[3px] border-brand-luxury-gold rounded-tr-xl shadow-[2px_-2px_8px_rgba(245,197,65,0.25)] relative">
                          <span className="absolute -top-3 right-4 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#120a22] text-themeText-muted border border-themeBorder">
                            R-SLOT
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Level 2 Grandchildren under Right Child */}
                    <div className="w-full flex">
                      {/* Right-Left Column */}
                      <div className="w-1/2 flex flex-col items-center">
                        {rightLeftChild ? (
                          renderNode(rightLeftChild, false)
                        ) : (
                          renderNode(
                            {
                              node_id: 'empty-right-left',
                              status: 'VACANT',
                              position: 'LEFT',
                              is_occupied: false,
                              parent_code: rightChild?.member_code || treeData.member_code,
                              children: [],
                            },
                            false
                          )
                        )}
                      </div>

                      {/* Right-Right Column */}
                      <div className="w-1/2 flex flex-col items-center">
                        {rightRightChild ? (
                          renderNode(rightRightChild, false)
                        ) : (
                          renderNode(
                            {
                              node_id: 'empty-right-right',
                              status: 'VACANT',
                              position: 'RIGHT',
                              is_occupied: false,
                              parent_code: rightChild?.member_code || treeData.member_code,
                              children: [],
                            },
                            false
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* MODAL 1: Member Node Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={memberDetails ? `${memberDetails.display_name} (${memberDetails.member_code})` : 'Member Node Details'}
        description="Comprehensive authorized member information and network metrics."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            {memberDetails && memberDetails.member_code !== currentRootCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleDrillDown(memberDetails.member_code, memberDetails.display_name);
                  setIsDetailsModalOpen(false);
                }}
                className="text-xs text-brand-luxury-gold border-brand-luxury-gold/50 hover:bg-brand-luxury-gold/20 font-semibold"
              >
                <GitBranch className="w-3.5 h-3.5 mr-1" />
                View Subtree
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {loadingDetails ? (
          <div className="py-8 text-center text-themeText-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-cyber-cyan" />
            <p className="text-xs">Fetching authorized member details...</p>
          </div>
        ) : memberDetails ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-panel-secondary/40 p-3 rounded-lg border border-themeBorder">
                <span className="text-themeText-muted">User ID</span>
                <p className="font-mono font-bold text-brand-cyber-cyan mt-1">{memberDetails.member_code}</p>
              </div>
              <div className="bg-panel-secondary/40 p-3 rounded-lg border border-themeBorder">
                <span className="text-themeText-muted">Package Tier</span>
                <p className="font-bold text-themeText-primary mt-1">{memberDetails.package_name}</p>
              </div>
              <div className="bg-panel-secondary/40 p-3 rounded-lg border border-themeBorder">
                <span className="text-themeText-muted">Parent Placement</span>
                <p className="font-semibold text-themeText-primary mt-1">
                  {memberDetails.parent_code
                    ? `${memberDetails.parent_name} (${memberDetails.parent_code})`
                    : 'Root Position'}
                </p>
              </div>
              <div className="bg-panel-secondary/40 p-3 rounded-lg border border-themeBorder">
                <span className="text-themeText-muted">Binary Position</span>
                <p className="font-bold text-brand-luxury-gold mt-1">{memberDetails.position} Position</p>
              </div>
            </div>

            {/* Team Metrics */}
            <div className="space-y-1.5 pt-2 border-t border-themeBorder">
              <span className="text-xs font-semibold text-themeText-muted uppercase tracking-wider">
                Downline Organization Stats
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-panel-secondary/40 p-2.5 rounded-lg border border-themeBorder">
                  <p className="text-[11px] text-themeText-muted">Total Downline</p>
                  <p className="text-base font-bold text-themeText-primary mt-0.5">
                    {memberDetails.team_metrics.total_downline}
                  </p>
                </div>
                <div className="bg-brand-bright-violet/10 p-2.5 rounded-lg border border-brand-bright-violet/20">
                  <p className="text-[11px] text-brand-soft-lavender">Left Count</p>
                  <p className="text-base font-bold text-brand-bright-violet mt-0.5">
                    {memberDetails.team_metrics.left_organization}
                  </p>
                </div>
                <div className="bg-brand-cyber-cyan/10 p-2.5 rounded-lg border border-brand-cyber-cyan/20">
                  <p className="text-[11px] text-brand-cyber-cyan">Right Count</p>
                  <p className="text-base font-bold text-brand-cyber-cyan mt-0.5">
                    {memberDetails.team_metrics.right_organization}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Placements */}
            <div className="space-y-1.5 pt-2 border-t border-themeBorder">
              <span className="text-xs font-semibold text-themeText-muted uppercase tracking-wider">
                Direct Child Placements
              </span>
              {memberDetails.direct_children.length === 0 ? (
                <p className="text-xs text-themeText-muted italic bg-panel-secondary/20 p-2.5 rounded-lg">
                  No direct children placed under this node yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {memberDetails.direct_children.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-panel-secondary/30 border border-themeBorder text-xs"
                    >
                      <span className="font-semibold text-themeText-primary">
                        {c.display_name} ({c.member_code})
                      </span>
                      <Badge variant={c.position === 'LEFT' ? 'active' : 'pending'} size="sm">
                        {c.position}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* MODAL 2: Add Member to Vacant Position Modal */}
      <Modal
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        title="Place Member in Vacant Position"
        description={`Assign an unplaced registered member to the ${placementSlot?.position} position under ${placementSlot?.parentCode}.`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsPlacementModalOpen(false)} disabled={submittingPlacement}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitPlacement}
              disabled={submittingPlacement || unplacedMembers.length === 0 || !selectedPlacementMember}
            >
              {submittingPlacement ? 'Assigning...' : 'Confirm Placement'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-panel-secondary/40 p-3.5 rounded-lg border border-themeBorder space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-themeText-muted">Target Parent Node:</span>
              <span className="font-mono font-bold text-themeText-primary">{placementSlot?.parentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-themeText-muted">Assigned Slot:</span>
              <span className="font-bold text-brand-luxury-gold">{placementSlot?.position} Position</span>
            </div>
          </div>

          {loadingUnplaced ? (
            <div className="py-6 text-center text-themeText-muted">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-cyber-cyan" />
              <p className="text-xs">Checking available unplaced members...</p>
            </div>
          ) : unplacedMembers.length === 0 ? (
            <Alert type="warning" title="No Unplaced Members Available">
              All active demo members are currently placed in the organization tree. You can inspect existing positions or explore downline branches.
            </Alert>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-themeText-primary block">
                Select Member to Place
              </label>
              <select
                value={selectedPlacementMember}
                onChange={(e) => setSelectedPlacementMember(e.target.value)}
                className="w-full bg-panel-secondary border border-themeBorder rounded-lg px-3 py-2 text-sm text-themeText-primary focus:outline-none focus:border-brand-luxury-gold"
              >
                {unplacedMembers.map((m) => (
                  <option key={m.id} value={m.member_code}>
                    {m.display_name} ({m.member_code}) — {m.package_name || 'Standard'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Alert type="info" title="Placement Policy Notice">
            Node placement in the binary organization is permanent once committed. The member will immediately be bound to this position in the PostgreSQL relationship matrix.
          </Alert>
        </div>
      </Modal>
    </div>
  );
};
