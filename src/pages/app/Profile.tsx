import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Wallet,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Lock,
  Calendar,
  Phone,
  Mail,
  Award,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { api, ProfileData } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';

export const Profile: React.FC = () => {
  const { refreshUser } = useAuth();

  // State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Personal Info Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [personalDirty, setPersonalDirty] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState<string | null>(null);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // Nominee Form State
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [isEditingNominee, setIsEditingNominee] = useState(false);
  const [isSavingNominee, setIsSavingNominee] = useState(false);
  const [nomineeSuccess, setNomineeSuccess] = useState<string | null>(null);
  const [nomineeError, setNomineeError] = useState<string | null>(null);

  // Wallet Address State
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Riseup Key State
  const [currentKey, setCurrentKey] = useState('');
  const [newRiseupKey, setNewRiseupKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySuccess, setKeySuccess] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Fetch initial profile data
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProfile();
      setProfile(data);
      setDisplayName(data.display_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setPersonalDirty(false);

      if (data.nominee) {
        setNomineeName(data.nominee.full_name);
        setNomineeRelation(data.nominee.relationship);
        setNomineePhone(data.nominee.contact_number);
      } else {
        setNomineeName('');
        setNomineeRelation('');
        setNomineePhone('');
      }

      if (data.wallet_address) {
        setNewWalletAddress(data.wallet_address.wallet_address);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle personal info changes
  const handleNameChange = (val: string) => {
    setDisplayName(val);
    setPersonalDirty(true);
  };
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setPersonalDirty(true);
  };
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setPersonalDirty(true);
  };

  const handleResetPersonal = () => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setPersonalDirty(false);
      setPersonalError(null);
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalDirty) return;
    setIsSavingPersonal(true);
    setPersonalSuccess(null);
    setPersonalError(null);

    try {
      const updated = await api.updateProfile({
        display_name: displayName,
        email: email || undefined,
        phone: phone || undefined,
      });
      setProfile(updated);
      setPersonalDirty(false);
      setPersonalSuccess('Profile information updated and saved successfully.');
      await refreshUser();
      setTimeout(() => setPersonalSuccess(null), 4000);
    } catch (err: unknown) {
      setPersonalError(err instanceof Error ? err.message : 'Failed to update personal details');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Handle Nominee Save
  const handleSaveNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName || !nomineeRelation || !nomineePhone) {
      setNomineeError('Please fill in all nominee fields.');
      return;
    }
    setIsSavingNominee(true);
    setNomineeSuccess(null);
    setNomineeError(null);

    try {
      const updatedNominee = await api.updateNominee({
        full_name: nomineeName,
        relationship: nomineeRelation,
        contact_number: nomineePhone,
      });
      setProfile((prev) => (prev ? { ...prev, nominee: updatedNominee } : null));
      setIsEditingNominee(false);
      setNomineeSuccess('Nominee information saved successfully.');
      setTimeout(() => setNomineeSuccess(null), 4000);
    } catch (err: unknown) {
      setNomineeError(err instanceof Error ? err.message : 'Failed to save nominee details');
    } finally {
      setIsSavingNominee(false);
    }
  };

  // Handle Wallet Address Save
  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newWalletAddress.trim();
    if (!clean.startsWith('0x') || clean.length !== 42) {
      setWalletError('USDT BEP20 address must be a valid 42-character hexadecimal string starting with 0x.');
      return;
    }

    setIsSavingWallet(true);
    setWalletSuccess(null);
    setWalletError(null);

    try {
      const updatedWallet = await api.updateWalletAddress({
        network: 'USDT_BEP20',
        wallet_address: clean,
      });
      setProfile((prev) => (prev ? { ...prev, wallet_address: updatedWallet } : null));
      setIsEditingWallet(false);
      setWalletSuccess('USDT BEP20 payout destination address saved.');
      setTimeout(() => setWalletSuccess(null), 4000);
    } catch (err: unknown) {
      setWalletError(err instanceof Error ? err.message : 'Failed to save wallet address');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const copyAddress = () => {
    if (profile?.wallet_address?.wallet_address) {
      navigator.clipboard.writeText(profile.wallet_address.wallet_address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Handle Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Riseup Key Save
  const handleSaveRiseupKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRiseupKey.length < 4) {
      setKeyError('Riseup Key must be at least 4 characters/digits.');
      return;
    }

    setIsSavingKey(true);
    setKeySuccess(null);
    setKeyError(null);

    try {
      await api.updateRiseupKey({
        current_key: currentKey || undefined,
        new_key: newRiseupKey,
      });
      setKeySuccess('Riseup transaction key configured successfully.');
      setProfile((prev) => (prev ? { ...prev, has_riseup_key: true } : null));
      setCurrentKey('');
      setNewRiseupKey('');
      setIsEditingKey(false);
      setTimeout(() => setKeySuccess(null), 4000);
    } catch (err: unknown) {
      setKeyError(err instanceof Error ? err.message : 'Failed to update Riseup Key');
    } finally {
      setIsSavingKey(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1 rounded-xl" />
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <Alert type="error" title="Failed to Load Profile">
          {error || 'Unable to communicate with the Riseupzed profile service.'}
        </Alert>
        <div className="mt-4">
          <Button onClick={loadProfile} variant="secondary">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-themeBorder-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-themeText-primary">
              Profile & Settings
            </h1>
            <Badge variant="active" className="uppercase text-[10px] tracking-wider">
              {profile.role}
            </Badge>
          </div>
          <p className="text-sm text-themeText-secondary">
            Manage your authenticated personal details, nominee beneficiary, USDT BEP20 payout address, and security parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-themeText-muted bg-themeSurface-card px-3 py-1.5 rounded-lg border border-themeBorder-subtle">
          <Shield className="w-3.5 h-3.5 text-semantic-success" />
          <span>Server Authenticated: {profile.member_code}</span>
        </div>
      </div>

      {/* Main Grid Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Member Summary & Wallet Address & Security Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Member Summary Card */}
          <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-themeBrand-violet/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-themeBrand-violet to-themeBrand-cyan flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-themeBrand-violet/20">
                {profile.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-themeText-primary leading-tight">
                  {profile.display_name}
                </h3>
                <span className="font-mono text-xs text-themeBrand-cyan">
                  {profile.member_code}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="success" className="text-[10px] py-0 px-1.5">
                    {profile.status}
                  </Badge>
                  {profile.package_name && (
                    <span className="text-[11px] text-themeText-muted flex items-center gap-1">
                      <Award className="w-3 h-3 text-themeBrand-gold" />
                      {profile.package_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-themeBorder-subtle text-xs">
              <div className="flex items-center justify-between text-themeText-secondary">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-themeText-muted" /> Email
                </span>
                <span className="font-medium text-themeText-primary truncate max-w-[170px]">
                  {profile.email || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between text-themeText-secondary">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-themeText-muted" /> Contact
                </span>
                <span className="font-medium text-themeText-primary">
                  {profile.phone || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between text-themeText-secondary">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-themeText-muted" /> Activation Date
                </span>
                <span className="font-medium text-themeText-primary">
                  {profile.activation_date
                    ? new Date(profile.activation_date).toLocaleDateString()
                    : 'Active Demo'}
                </span>
              </div>
            </div>
          </Card>

          {/* USDT BEP20 Wallet Address Card */}
          <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-themeBrand-cyan/10 text-themeBrand-cyan">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-themeText-primary">
                    Payout Wallet Address
                  </h3>
                  <p className="text-[11px] text-themeText-muted font-mono">USDT BEP20 Only</p>
                </div>
              </div>
              <Badge variant="pending" className="text-[10px]">
                BEP20
              </Badge>
            </div>

            {walletSuccess && (
              <Alert type="success" className="py-2 text-xs">
                {walletSuccess}
              </Alert>
            )}
            {walletError && (
              <Alert type="error" className="py-2 text-xs">
                {walletError}
              </Alert>
            )}

            {!isEditingWallet ? (
              <div className="space-y-3">
                {profile.wallet_address ? (
                  <div className="p-3 bg-themeSurface-elevated rounded-lg border border-themeBorder-subtle space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-themeText-muted">Configured Destination</span>
                      <span className="text-semantic-success flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-themeText-primary break-all select-all">
                        {showFullAddress
                          ? profile.wallet_address.wallet_address
                          : profile.wallet_address.masked_address}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setShowFullAddress(!showFullAddress)}
                          className="p-1 text-themeText-muted hover:text-themeText-primary transition-colors"
                          title={showFullAddress ? 'Mask address' : 'Reveal full address'}
                        >
                          {showFullAddress ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={copyAddress}
                          className="p-1 text-themeText-muted hover:text-themeBrand-cyan transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <Check className="w-3.5 h-3.5 text-semantic-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-themeSurface-elevated/50 rounded-lg border border-dashed border-themeBorder-subtle text-center text-xs text-themeText-muted">
                    No payout address saved. Withdrawals require a USDT BEP20 destination address.
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setNewWalletAddress(profile.wallet_address?.wallet_address || '');
                    setIsEditingWallet(true);
                  }}
                >
                  {profile.wallet_address ? 'Update Payout Address' : 'Set BEP20 Address'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveWallet} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-themeText-secondary">
                    USDT BEP20 Address (Hex 0x...)
                  </label>
                  <Input
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    placeholder="0x71C8F7965F4d55b8e9b11cf298B30e462d142B29"
                    className="font-mono text-xs"
                    required
                  />
                  <p className="text-[10px] text-themeText-muted">
                    Note: Simulated address only. No real crypto transactions occur in this demonstration environment.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 text-xs"
                    isLoading={isSavingWallet}
                  >
                    Save Address
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setIsEditingWallet(false);
                      setWalletError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Riseup Key & Transaction Security */}
          <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-themeBrand-gold/10 text-themeBrand-gold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-themeText-primary">Riseup Key (PIN)</h3>
                  <p className="text-[11px] text-themeText-muted">Transaction Security Secret</p>
                </div>
              </div>
              <Badge
                variant={profile.has_riseup_key ? 'success' : 'default'}
                className="text-[10px]"
              >
                {profile.has_riseup_key ? 'Active' : 'Unset'}
              </Badge>
            </div>

            {keySuccess && (
              <Alert type="success" className="py-2 text-xs">
                {keySuccess}
              </Alert>
            )}
            {keyError && (
              <Alert type="error" className="py-2 text-xs">
                {keyError}
              </Alert>
            )}

            {!isEditingKey ? (
              <div className="space-y-3">
                <div className="p-3 bg-themeSurface-elevated rounded-lg border border-themeBorder-subtle flex items-center justify-between text-xs">
                  <span className="text-themeText-muted">Secret Status:</span>
                  <span className="font-mono text-themeText-primary">
                    {profile.has_riseup_key ? '•••••••• (Masked)' : 'Not Configured'}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsEditingKey(true)}
                >
                  {profile.has_riseup_key ? 'Update Riseup Key' : 'Configure Riseup Key'}
                </Button>
                <p className="text-[10px] text-themeText-muted text-center italic">
                  Key is hashed securely via bcrypt on the server; never returned or logged.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveRiseupKey} className="space-y-3">
                {profile.has_riseup_key && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-themeText-secondary">
                      Current Riseup Key
                    </label>
                    <Input
                      type="password"
                      value={currentKey}
                      onChange={(e) => setCurrentKey(e.target.value)}
                      placeholder="Enter current PIN"
                      className="text-xs"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-themeText-secondary">
                    New Riseup Key
                  </label>
                  <Input
                    type="password"
                    value={newRiseupKey}
                    onChange={(e) => setNewRiseupKey(e.target.value)}
                    placeholder="Enter 4-32 digit PIN"
                    className="text-xs"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 text-xs"
                    isLoading={isSavingKey}
                  >
                    Save Key
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setIsEditingKey(false);
                      setKeyError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Right Column: Personal Information Form & Nominee Beneficiary */}
        <div className="space-y-8 lg:col-span-2">
          {/* Personal Information Form */}
          <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBorder-subtle space-y-6">
            <div className="flex items-center justify-between border-b border-themeBorder-subtle pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-themeBrand-violet/10 text-themeBrand-violet">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-themeText-primary">Personal Details</h2>
                  <p className="text-xs text-themeText-muted">
                    Update your account identity. Changes persist to PostgreSQL database immediately.
                  </p>
                </div>
              </div>
              {personalDirty && (
                <Badge variant="warning" className="text-[10px] animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
            </div>

            {personalSuccess && (
              <Alert type="success" className="animate-fade-in">
                {personalSuccess}
              </Alert>
            )}
            {personalError && (
              <Alert type="error" className="animate-fade-in">
                {personalError}
              </Alert>
            )}

            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Full Display Name <span className="text-semantic-error">*</span>
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Member Identifier
                  </label>
                  <Input
                    value={profile.member_code}
                    disabled
                    className="font-mono text-sm bg-themeSurface-elevated/40 opacity-80 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-themeText-muted">
                    Public system identifier assigned during registration.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="member@riseupdemo.io"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Contact Phone Number
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+1-555-0144"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-themeBorder-subtle">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPersonal}
                  disabled={!personalDirty || isSavingPersonal}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!personalDirty}
                  isLoading={isSavingPersonal}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Nominee Beneficiary Section */}
          <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBorder-subtle space-y-6">
            <div className="flex items-center justify-between border-b border-themeBorder-subtle pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-themeBrand-gold/10 text-themeBrand-gold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-themeText-primary">Nominee Details</h2>
                  <p className="text-xs text-themeText-muted">
                    Nominated beneficiary for emergency contact and member portfolio succession.
                  </p>
                </div>
              </div>
              {profile.nominee && !isEditingNominee && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => setIsEditingNominee(true)}
                >
                  Edit Nominee
                </Button>
              )}
            </div>

            {nomineeSuccess && (
              <Alert type="success" className="animate-fade-in">
                {nomineeSuccess}
              </Alert>
            )}
            {nomineeError && (
              <Alert type="error" className="animate-fade-in">
                {nomineeError}
              </Alert>
            )}

            {!profile.nominee && !isEditingNominee ? (
              <div className="p-8 text-center bg-themeSurface-elevated/40 rounded-xl border border-dashed border-themeBorder-subtle space-y-3">
                <Users className="w-8 h-8 mx-auto text-themeText-muted" />
                <h4 className="font-semibold text-sm text-themeText-primary">
                  No Nominee Registered Yet
                </h4>
                <p className="text-xs text-themeText-muted max-w-sm mx-auto">
                  Protect your portfolio continuity by registering your designated nominee and contact information.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsEditingNominee(true)}
                >
                  Add Nominee Details
                </Button>
              </div>
            ) : !isEditingNominee && profile.nominee ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-themeSurface-elevated rounded-xl border border-themeBorder-subtle">
                <div>
                  <span className="text-[11px] text-themeText-muted block mb-0.5">Nominee Full Name</span>
                  <span className="font-semibold text-sm text-themeText-primary">
                    {profile.nominee.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-themeText-muted block mb-0.5">Relationship</span>
                  <span className="font-semibold text-sm text-themeBrand-cyan">
                    {profile.nominee.relationship}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-themeText-muted block mb-0.5">Contact Number</span>
                  <span className="font-semibold text-sm text-themeText-primary">
                    {profile.nominee.contact_number}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveNominee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-themeText-secondary">
                      Nominee Full Name <span className="text-semantic-error">*</span>
                    </label>
                    <Input
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      placeholder="e.g. Eleanor Sterling"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-themeText-secondary">
                      Relationship <span className="text-semantic-error">*</span>
                    </label>
                    <Input
                      value={nomineeRelation}
                      onChange={(e) => setNomineeRelation(e.target.value)}
                      placeholder="e.g. Spouse, Child, Sibling"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-themeText-secondary">
                      Contact Phone <span className="text-semantic-error">*</span>
                    </label>
                    <Input
                      value={nomineePhone}
                      onChange={(e) => setNomineePhone(e.target.value)}
                      placeholder="+1-555-0199"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingNominee(false);
                      setNomineeError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={isSavingNominee}
                  >
                    Save Nominee
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Password Security Card */}
          <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBorder-subtle space-y-6">
            <div className="flex items-center gap-2 border-b border-themeBorder-subtle pb-4">
              <div className="p-2 rounded-lg bg-themeBrand-violet/10 text-themeBrand-violet">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-themeText-primary">Password Management</h2>
                <p className="text-xs text-themeText-muted">
                  Update your authentication password. Requires verification of your current password.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <Alert type="success" className="animate-fade-in">
                {passwordSuccess}
              </Alert>
            )}
            {passwordError && (
              <Alert type="error" className="animate-fade-in">
                {passwordError}
              </Alert>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  isLoading={isSavingPassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
