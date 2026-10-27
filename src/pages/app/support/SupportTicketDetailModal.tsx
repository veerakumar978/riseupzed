import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  User,
  ShieldCheck,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge, BadgeVariant } from '../../../components/ui/Badge';
import { Textarea } from '../../../components/ui/Textarea';
import {
  supportApi,
  SupportTicketResponse,
} from '../../../lib/api-client';

interface SupportTicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  onTicketUpdated: () => void;
  isManager?: boolean;
}

export const SupportTicketDetailModal: React.FC<SupportTicketDetailModalProps> = ({
  ticketId,
  onClose,
  onTicketUpdated,
  isManager = false,
}) => {
  const [ticket, setTicket] = useState<SupportTicketResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [replyText, setReplyText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    try {
      const data = await supportApi.getTicketDetails(ticketId);
      setTicket(data);
      setNewStatus(data.status);
    } catch (err: unknown) {
      console.error('Failed to load ticket details:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyText.trim()) return;
    setIsSending(true);
    setErrorMsg('');
    try {
      await supportApi.postMessage(ticket.id, replyText.trim());
      setReplyText('');
      await loadTicket();
      onTicketUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) return;
    setIsUpdatingStatus(true);
    setErrorMsg('');
    try {
      await supportApi.updateStatus(ticket.id, newStatus, internalNote.trim() || undefined);
      setInternalNote('');
      await loadTicket();
      onTicketUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update ticket status');
    } finally {
      setIsUpdatingStatus(false);
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

  return (
    <Modal
      isOpen={!!ticketId}
      onClose={onClose}
      title={ticket ? `Ticket: ${ticket.ticket_number}` : 'Support Ticket Details'}
    >
      {isLoading ? (
        <div className="p-6 space-y-3">
          <div className="h-4 bg-panel-elevated animate-pulse rounded w-1/3" />
          <div className="h-16 bg-panel-elevated animate-pulse rounded" />
          <div className="h-32 bg-panel-elevated animate-pulse rounded" />
        </div>
      ) : !ticket ? (
        <div className="p-6 text-center text-xs text-semantic-error">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          {errorMsg || 'Ticket could not be loaded.'}
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Header Metadata */}
          <div className="bg-panel-secondary/40 p-4 rounded-control border border-themeBorder space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-themeText-primary">{ticket.subject}</h3>
              <div className="flex items-center gap-1.5">
                <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="sm">
                  {ticket.priority} Priority
                </Badge>
                <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm" dot>
                  {ticket.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-themeText-muted text-[11px] pt-1">
              <span>Category: <strong className="text-themeText-secondary">{ticket.category}</strong></span>
              <span>Member: <strong className="text-themeText-secondary">{ticket.member_name} ({ticket.member_code})</strong></span>
              <span>Opened: <strong className="text-themeText-secondary">{new Date(ticket.created_at).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Conversation Thread */}
          <div>
            <span className="text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider block mb-2">
              Conversation Thread
            </span>
            <div className="space-y-3 max-h-72 overflow-y-auto p-1 pr-2">
              {ticket.messages.map(msg => {
                const isStaff = msg.sender_role === 'MANAGER' || msg.sender_role === 'ADMIN';
                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-card border ${
                      msg.is_internal_note
                        ? 'bg-brand-warm-gold/10 border-brand-warm-gold/25'
                        : isStaff
                        ? 'bg-brand-bright-cyan/5 border-brand-bright-cyan/20'
                        : 'bg-panel-secondary/50 border-themeBorder-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isStaff ? 'bg-brand-bright-cyan/20 text-brand-bright-cyan' : 'bg-panel-elevated text-themeText-muted'
                        }`}>
                          {isStaff ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-semibold text-themeText-primary">{msg.sender_name}</span>
                        <Badge variant={isStaff ? 'premium' : 'default'} size="sm">
                          {isStaff ? 'Support Manager' : 'Member'}
                        </Badge>
                        {msg.is_internal_note && (
                          <Badge variant="warning" size="sm">
                            <span className="flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Internal Note
                            </span>
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-themeText-muted font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-themeText-secondary leading-relaxed whitespace-pre-wrap pl-6">
                      {msg.message_body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manager Status Controls (If User has Manager Role) */}
          {isManager && (
            <div className="p-3 bg-panel-secondary/40 rounded-control border border-brand-bright-violet/20 space-y-2.5">
              <span className="text-[11px] font-semibold text-brand-bright-violet uppercase tracking-wider block">
                Manager Resolution Controls
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-themeText-muted block mb-0.5">Status Transition</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full h-8 rounded-control px-2 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-themeText-muted block mb-0.5">Internal Review Memo</label>
                  <input
                    type="text"
                    placeholder="Optional manager note..."
                    value={internalNote}
                    onChange={e => setInternalNote(e.target.value)}
                    className="w-full h-8 rounded-control px-2 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Ticket Status'}
                </Button>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {ticket.status !== 'CLOSED' ? (
            <form onSubmit={handleSendReply} className="pt-2 border-t border-themeBorder-subtle space-y-2">
              <label className="text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider block">
                Post Reply
              </label>
              <Textarea
                placeholder="Type your reply or follow-up details..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={3}
                className="text-xs"
              />
              <div className="flex items-center justify-between">
                {errorMsg ? (
                  <span className="text-semantic-error text-[11px]">{errorMsg}</span>
                ) : <span />}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSending || !replyText.trim()}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {isSending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-panel-secondary/40 border border-themeBorder-subtle rounded-control text-center text-xs text-themeText-muted">
              This support ticket has been closed. If you require further assistance, please submit a new ticket.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
