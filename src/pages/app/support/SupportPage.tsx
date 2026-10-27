import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  RotateCcw,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge, BadgeVariant } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SupportTicketDetailModal } from './SupportTicketDetailModal';
import {
  supportApi,
  SupportTicketResponse,
  SupportTicketCreate,
} from '../../../lib/api-client';
import { ROUTES } from '../../../config/routes';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('ACCOUNT');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Selected Ticket for Conversation Thread Modal
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supportApi.getTickets(
        statusFilter || undefined,
        searchQuery.trim() || undefined
      );
      setTickets(data);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newSubject.trim()) {
      setCreateError('Please enter a ticket subject.');
      return;
    }
    if (!newDescription.trim() || newDescription.trim().length < 5) {
      setCreateError('Please enter a detailed description of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SupportTicketCreate = {
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        description: newDescription.trim(),
      };
      const created = await supportApi.createTicket(payload);

      // Close modal and reset form
      setShowCreateModal(false);
      setNewSubject('');
      setNewDescription('');
      setNewCategory('ACCOUNT');
      setNewPriority('MEDIUM');

      // Refresh tickets and immediately open the newly created ticket thread!
      await loadTickets();
      setActiveTicketId(created.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create support ticket';
      setCreateError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (st: string): BadgeVariant => {
    switch (st.toUpperCase()) {
      case 'OPEN':
        return 'pending';
      case 'IN_PROGRESS':
        return 'active';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityBadgeVariant = (pr: string): BadgeVariant => {
    switch (pr.toUpperCase()) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  // Ticket Summary Counts
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Member Support' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-themeText-primary tracking-tight">
                Support & Helpdesk
              </h1>
              <Badge variant="premium" size="sm">24/7 Priority Support</Badge>
            </div>
            <p className="text-xs sm:text-sm text-themeText-secondary mt-1 max-w-2xl">
              Open technical tickets, inquire about token allocations, or resolve account inquiries with dedicated support managers.
            </p>
          </div>
          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Open New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="standard" padding="md" className="border border-themeBorder bg-panel-elevated/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">Total Tickets</p>
          <h3 className="text-xl sm:text-2xl font-bold text-themeText-primary mt-1 font-mono">{totalCount}</h3>
          <p className="text-[11px] text-themeText-muted mt-0.5">All tickets logged</p>
        </Card>

        <Card variant="standard" padding="md" className="border border-brand-warm-gold/25 bg-panel-elevated/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">Open</p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-warm-gold mt-1 font-mono">{openCount}</h3>
          <p className="text-[11px] text-themeText-muted mt-0.5">Awaiting manager review</p>
        </Card>

        <Card variant="standard" padding="md" className="border border-brand-bright-cyan/25 bg-panel-elevated/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">In Progress</p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-bright-cyan mt-1 font-mono">{inProgressCount}</h3>
          <p className="text-[11px] text-themeText-muted mt-0.5">Active investigation</p>
        </Card>

        <Card variant="standard" padding="md" className="border border-semantic-success/25 bg-panel-elevated/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">Resolved</p>
          <h3 className="text-xl sm:text-2xl font-bold text-semantic-success mt-1 font-mono">{resolvedCount}</h3>
          <p className="text-[11px] text-themeText-muted mt-0.5">Completed inquiries</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="standard" padding="none" className="border border-themeBorder overflow-hidden">
        <div className="p-4 bg-panel-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search ticket # or subject..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-control pl-8 pr-3 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-themeText-muted absolute left-2.5 top-3" />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadTickets}
            disabled={isLoading}
            leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Ticket List Table */}
      <Card variant="standard" padding="none" className="overflow-hidden border border-themeBorder">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 px-4">
            <EmptyState
              title="No Support Tickets Found"
              description="You have no support tickets matching your current search or status filter."
              icon={<LifeBuoy className="w-6 h-6 stroke-[1.5]" />}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  Create Support Ticket
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-themeBorder bg-panel-elevated/40 text-themeText-secondary uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Ticket Number</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4">Opened</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder-subtle">
                {tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-panel-elevated/30 transition-colors group cursor-pointer"
                    onClick={() => setActiveTicketId(ticket.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-bright-cyan whitespace-nowrap">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-themeText-primary max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-3.5 px-4 text-themeText-secondary">
                      {ticket.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="sm">
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-themeText-muted whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-themeText-muted whitespace-nowrap">
                      {new Date(ticket.updated_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm" dot>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveTicketId(ticket.id);
                        }}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                      >
                        View Thread
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Open New Support Ticket"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <p className="text-themeText-secondary">
              Describe your question or issue in detail. A support manager will review your ticket and respond in the conversation thread.
            </p>

            {createError && (
              <div className="p-2.5 bg-semantic-error/15 border border-semantic-error/30 rounded-control flex items-center gap-2 text-semantic-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                Ticket Subject *
              </label>
              <Input
                type="text"
                placeholder="e.g. Inconsistency in weekly cashback volume dividend"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
                >
                  <option value="ACCOUNT">Account & Profile</option>
                  <option value="WALLET">Wallet & Balances</option>
                  <option value="PACKAGE_RANK">Package & Rank Upgrades</option>
                  <option value="ORGANIZATION">Organization & Placement</option>
                  <option value="REPORTS">Reports & Incentive Accounting</option>
                  <option value="TECHNICAL_ISSUE">Technical Platform Issue</option>
                  <option value="OTHER">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Urgency Priority *
                </label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="w-full h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
                >
                  <option value="LOW">Low (General guidance)</option>
                  <option value="MEDIUM">Medium (Standard inquiry)</option>
                  <option value="HIGH">High (Urgent account inquiry)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <Textarea
                placeholder="Provide complete context, transaction references, or screenshots description..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={4}
                required
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-themeBorder-subtle">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Ticket Details / Thread Modal */}
      {activeTicketId && (
        <SupportTicketDetailModal
          ticketId={activeTicketId}
          onClose={() => setActiveTicketId(null)}
          onTicketUpdated={loadTickets}
          isManager={false}
        />
      )}
    </div>
  );
};
