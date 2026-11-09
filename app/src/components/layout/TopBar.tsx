import { AccountConnectionContext } from '@/lib/backup/account-connection-context';
import { AccountConnectionCard } from '@/components/backup/AccountConnectionCard';
import { UserRound } from 'lucide-react';
import React from 'react';
import { ElementalTopBar, AccountSeal } from './ElementalTopBar';
import { AllRoutesSheet } from './AllRoutesSheet';
import './elemental-topbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { isSupabaseAuthEnabled } from '@/lib/supabase';
import { useWeekStartsOnPreference } from '@/lib/temporal';
import { SANCTUARY_CITIES, useSanctuaryCityPreference } from '@/lib/temporal/sanctuary-city';
import { useZodiacPreference } from '@/lib/sanctuary/zodiac';

const ELEMENTO_DA_AURA: Record<string, string> = {
  fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água',
};
import {
  getGoogleCalendarConnectUrl,
  getGoogleCalendarConnection,
  getGoogleCalendarSyncUrl,
  isGoogleCalendarIntegrationEnabled,
} from '@/services/googleCalendarIntegration';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TopBarProps {
  accountOnly?: boolean;
  title?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  accountOnly = false,
  showBackButton = false,
  rightAction,
}) => {
  const sync = React.useContext(AccountConnectionContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts, currentAccountId, createAccount, switchAccount } = useAppStore();
  const {
    user: authUser,
    session,
    signOut,
  } = useAuthStore();
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);
  const [routesOpen, setRoutesOpen] = React.useState(false);
  const [newAccountName, setNewAccountName] = React.useState('');
  const [googleStatus, setGoogleStatus] = React.useState<
    'idle' | 'loading' | 'connected' | 'disconnected' | 'unavailable' | 'error'
  >('idle');
  const [isGoogleSyncing, setIsGoogleSyncing] = React.useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = React.useState(false);
  const [googleEmail, setGoogleEmail] = React.useState<string | null>(null);
  const [googleStatusMessage, setGoogleStatusMessage] = React.useState<string>('');
  const { weekStartsOn, setWeekStartsOn } = useWeekStartsOnPreference();
  const { cityId: sanctuaryCityId, setCity: setSanctuaryCity } = useSanctuaryCityPreference();
  // Only the first open asks for this, and whoever already had progress never
  // saw that survey: without it here their aura would stay gold for good.
  const { profile: signo, birthDate: nascimento, setBirthDate: setNascimento } = useZodiacPreference();
  const googleConnectUrl = React.useMemo(() => getGoogleCalendarConnectUrl(), []);
  const googleSyncUrl = React.useMemo(() => getGoogleCalendarSyncUrl(), []);

  const activeAccount = React.useMemo(
    () => accounts.find((account) => account.id === currentAccountId) || null,
    [accounts, currentAccountId]
  );

  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/santuario': 'Santuário',
      '/rituais': 'Rituais',
      '/ciclos': 'Ciclos',
      '/jornadas': 'Jornadas',
      '/grandes-obras': 'Grandes Obras',
      '/forja': 'Forja',
      '/astrolabio': 'Astrolábio',
      '/lua': 'Lua',
      '/estacoes': 'Estações',
      '/cassino-arcano': 'Cassino Arcano',
      '/grimorio': 'Grimório',
      '/invocar': 'Invocar',
      '/dominios': 'Domínios',
      '/pilares': 'Pilares Elementais',
      '/mapa': 'Mapa de páginas',
      '/temporal/semana': 'Temporal - Semana',
      '/temporal/mes': 'Temporal - Mês',
      '/temporal/ano': 'Temporal - Ano',
      '/temporal/calendario': 'Temporal - Calendário',
    };
    
    return titles[path] || 'Conselho Elemental';
  };

  React.useEffect(() => {
    if (!isAccountModalOpen) return;

    const loadGoogleConnection = async () => {
      if (!isGoogleCalendarIntegrationEnabled()) {
        setGoogleStatus('unavailable');
        setGoogleStatusMessage('Habilite Supabase Auth para conectar Google Agenda.');
        setGoogleEmail(null);
        return;
      }

      setGoogleStatus('loading');
      setGoogleStatusMessage('');

      try {
        const connection = await getGoogleCalendarConnection();
        if (connection?.is_active) {
          setGoogleStatus('connected');
          setGoogleEmail(connection.google_email ?? null);
          setGoogleStatusMessage('Conexao ativa.');
          return;
        }

        setGoogleStatus('disconnected');
        setGoogleEmail(null);
        setGoogleStatusMessage('Nenhuma conexao ativa encontrada.');
      } catch (error) {
        setGoogleStatus('error');
        setGoogleEmail(null);
        setGoogleStatusMessage(
          error instanceof Error ? error.message : 'Erro ao verificar conexao Google Agenda.'
        );
      }
    };

    void loadGoogleConnection();
  }, [isAccountModalOpen]);

  const handleGoogleConnect = React.useCallback(async () => {
    if (!googleConnectUrl || !session?.access_token) return;

    setIsGoogleConnecting(true);
    setGoogleStatusMessage('Iniciando OAuth Google...');

    try {
      const response = await fetch(googleConnectUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload = (await response.json()) as { authUrl?: string; error?: string };
      if (!response.ok || !payload.authUrl) {
        throw new Error(payload.error || 'Falha ao iniciar conexão Google');
      }

      window.open(payload.authUrl, '_blank', 'noopener,noreferrer');
      setGoogleStatusMessage('Consentimento aberto em nova aba. Complete o login e depois sincronize.');
    } catch (error) {
      setGoogleStatusMessage(error instanceof Error ? error.message : 'Erro ao iniciar conexão Google');
      setGoogleStatus('error');
    } finally {
      setIsGoogleConnecting(false);
    }
  }, [googleConnectUrl, session?.access_token]);

  const handleGoogleSync = React.useCallback(async () => {
    if (!googleSyncUrl || !session?.access_token) return;

    setIsGoogleSyncing(true);
    setGoogleStatusMessage('Sincronizando Google Agenda...');

    try {
      const response = await fetch(googleSyncUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = (await response.json()) as { syncedCount?: number; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Falha na sincronização Google Agenda');
      }

      setGoogleStatus('connected');
      setGoogleStatusMessage(`Sincronização concluída. ${payload.syncedCount ?? 0} eventos atualizados.`);
    } catch (error) {
      setGoogleStatusMessage(error instanceof Error ? error.message : 'Erro na sincronização Google Agenda');
      setGoogleStatus('error');
    } finally {
      setIsGoogleSyncing(false);
    }
  }, [googleSyncUrl, session?.access_token]);

  return (
    <>
      {accountOnly ? <button type="button" className="elemental-account-button" onClick={() => setIsAccountModalOpen(true)} aria-label="Abrir conta" aria-haspopup="dialog" aria-expanded={isAccountModalOpen}><AccountSeal /></button> : <>
        <ElementalTopBar title={getPageTitle()} onBack={showBackButton ? () => navigate(-1) : undefined} onExplore={() => setRoutesOpen(true)} exploreOpen={routesOpen}>
          {rightAction || <button type="button" className="elemental-account-button" onClick={() => setIsAccountModalOpen(true)} aria-label="Abrir conta" aria-haspopup="dialog" aria-expanded={isAccountModalOpen}><AccountSeal /></button>}
        </ElementalTopBar>
        <AllRoutesSheet open={routesOpen} onOpenChange={setRoutesOpen} />
      </>}

      <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <DialogContent className="account-hub-dialog">
          <DialogHeader>
            <DialogTitle>Minha conta</DialogTitle>
            <DialogDescription>
              Conta pessoal e preferências da sua jornada.
            </DialogDescription>
          </DialogHeader>

          {(sync || !authUser) && <AccountConnectionCard sync={sync} profileName={activeAccount?.name ?? 'Jornada neste aparelho'} />}

          {!sync && isSupabaseAuthEnabled && authUser && (
            <div className="space-y-2 rounded-lg border border-white/15 p-3">
              <p className="text-sm font-medium text-white">Conclua a conexão da sua jornada</p>
              <p className="text-xs text-white/70">
                {authUser?.email || 'Conta autenticada'} · entre novamente na tela segura para escolher e sincronizar os dados deste aparelho.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    void (async () => {
                      await signOut();
                      setIsAccountModalOpen(false);
                      window.location.replace('/auth');
                    })();
                  }}
                >
                  Conectar esta jornada
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    void (async () => {
                      await signOut();
                      setIsAccountModalOpen(false);
                      window.location.replace('/auth');
                    })();
                  }}
                >
                  Sair
                </Button>
              </div>
            </div>
          )}

          <details><summary>Perfis neste aparelho</summary><p className="mb-3 text-sm text-white/60">Perfis organizam jornadas dentro deste aparelho. Eles não são contas de acesso online.</p>
          <div className="space-y-2">
            {accounts.length === 0 ? (
              <p className="text-sm text-white/70">Nenhuma conta criada ainda.</p>
            ) : (
              accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => switchAccount(account.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    account.id === currentAccountId
                      ? 'border-mystic-gold bg-mystic-gold/10'
                      : 'border-white/15 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <UserRound size={18} aria-hidden="true" className="mr-2 inline-block" />
                  <span className="font-medium">{account.name}</span>
                </button>
              ))
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-white/15 p-3">
            <Label htmlFor="new-account-name">Novo perfil local</Label>
            <Input
              id="new-account-name"
              value={newAccountName}
              onChange={(event) => setNewAccountName(event.target.value)}
              placeholder="Nome do perfil"
              className="border-white/20 bg-white/5"
            />
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                if (!newAccountName.trim()) return;
                createAccount(newAccountName, false);
                setNewAccountName('');
              }}
            >
              Criar e ativar perfil
            </Button>
          </div>

          </details>
          <details><summary>Preferências e integrações</summary>
          <div className="space-y-3 rounded-lg border border-white/15 p-3">
            <p className="text-sm font-medium text-white">Início da semana</p>
            <div className="inline-flex rounded-lg border border-white/20 bg-white/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setWeekStartsOn(0)}
                className={`rounded-md px-2 py-1 ${weekStartsOn === 0 ? 'bg-mystic-gold/20 text-mystic-gold' : 'text-white/70'}`}
              >
                Domingo
              </button>
              <button
                type="button"
                onClick={() => setWeekStartsOn(1)}
                className={`rounded-md px-2 py-1 ${weekStartsOn === 1 ? 'bg-mystic-gold/20 text-mystic-gold' : 'text-white/70'}`}
              >
                Segunda
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-white/15 p-3">
            <p className="text-sm font-medium text-white">Cidade do santuário</p>
            <p className="text-xs text-white/70">O sol, a lua e a estação da cena são calculados para ela.</p>
            <div className="inline-flex rounded-lg border border-white/20 bg-white/5 p-1 text-xs">
              {SANCTUARY_CITIES.map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => setSanctuaryCity(opcao.id)}
                  aria-pressed={sanctuaryCityId === opcao.id}
                  className={`rounded-md px-2 py-1 ${sanctuaryCityId === opcao.id ? 'bg-mystic-gold/20 text-mystic-gold' : 'text-white/70'}`}
                >
                  {opcao.name}
                </button>
              ))}
            </div>
            <a href="/despertar" className="inline-flex min-h-[44px] items-center text-xs text-white/70 underline underline-offset-4">
              Rever a introdução
            </a>
          </div>

          <div className="space-y-3 rounded-lg border border-white/15 p-3">
            <p className="text-sm font-medium text-white">Sua aura</p>
            <p className="text-xs text-white/70">
              O seu signo dá a cor da aura em volta do personagem, e ela cresce com o seu
              nível. A data fica neste aparelho e não serve a mais nada.
            </p>
            <label className="block text-xs text-white/70">
              <span className="mb-1 block">Data de nascimento</span>
              <input
                type="date"
                value={nascimento ?? ''}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setNascimento(event.target.value || null)}
                className="min-h-[44px] w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm text-white"
              />
            </label>
            <p className="text-xs" aria-live="polite">
              {signo ? (
                <span style={{ color: signo.colour }}>
                  {signo.icon} {signo.name} · {ELEMENTO_DA_AURA[signo.element]}
                </span>
              ) : (
                <span className="text-white/60">Sem data, a aura fica dourada.</span>
              )}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-white/15 p-3">
            <p className="text-sm font-medium text-white">Google Agenda (beta)</p>
            <p className="text-xs text-white/70">
              {googleStatus === 'loading' && 'Verificando conexao...'}
              {googleStatus === 'connected' && (googleEmail ? `Conectado: ${googleEmail}` : 'Conectado')}
              {googleStatus === 'disconnected' && 'Desconectado'}
              {googleStatus === 'unavailable' && 'Indisponivel neste ambiente'}
              {googleStatus === 'error' && 'Falha ao carregar status'}
              {googleStatus === 'idle' && 'Aguardando verificacao'}
            </p>
            {googleStatusMessage ? <p className="text-[11px] text-white/55">{googleStatusMessage}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!googleConnectUrl || !session?.access_token || isGoogleConnecting}
                onClick={() => {
                  void handleGoogleConnect();
                }}
              >
                {isGoogleConnecting ? 'Conectando...' : 'Conectar Google'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!googleSyncUrl || !session?.access_token || googleStatus !== 'connected' || isGoogleSyncing}
                onClick={() => {
                  void handleGoogleSync();
                }}
              >
                {isGoogleSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
              </Button>
            </div>
            {!googleConnectUrl ? (
              <p className="text-[11px] text-white/55">
                A conexão com a agenda ainda não está disponível neste ambiente.
              </p>
            ) : null}
          </div>


          </details>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => navigate('/grimorio')}>
              Abrir Grimório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
