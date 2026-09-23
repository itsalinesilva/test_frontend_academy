// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { SettingsScreen } from '../../src/ui/screens/settings/SettingsScreen';
import { PracticeTab } from '../../src/ui/components/profile/tabs/PracticeTab';
import { SkillsTab } from '../../src/ui/components/profile/tabs/SkillsTab';
import { BadgesTab } from '../../src/ui/components/profile/tabs/BadgesTab';
import { medirPerfil } from '../../src/domain/perfil-medido';
import {
  aplicarPreferencias,
  lerPreferencias,
  salvarPreferencias,
  PREFERENCIAS_PADRAO,
} from '../../src/repositories/preferencias.repository';
import { motorDoNavegador } from '../../src/infrastructure/audio/motor-da-mesa';
import { audienciaDaRota } from '../../src/ui/navigation/audiencia';
import { AdminAuditScreen } from '../../src/ui/screens/admin/AdminAuditScreen';
import { adminService } from '../../src/services/application/admin.service';
import type { UnifiedProfileRecord } from '../../src/domain/profile';
import type { PracticeResult } from '../../src/domain/practice';

/**
 * AUD-6, AUD-7, AUD-8 — o que a tela dizia e não fazia.
 *
 *  - Configurações: "Salvar Preferências" só trocava o rótulo; os
 *    interruptores de acessibilidade não mudavam nada; o microfone escolhido
 *    não chegava à mesa; o token da sessão aparecia na tela.
 *  - Perfil: 32 h, 15 sessões, 3/14 dias e 8 conexões nasciam do nada; as
 *    abas davam a toda conta insígnias, habilidades "Mestre" e sessões de
 *    cravo que ninguém fez.
 *  - "atualizadas no servidor!" sobre o que grava no navegador.
 */

vi.mock('../../src/services/application/auth.service', async () => {
  const real = await vi.importActual<typeof import('../../src/services/application/auth.service')>(
    '../../src/services/application/auth.service'
  );
  real.authService.getActiveSession = (async () => ({
    accessToken: 'TOKEN-SECRETO-123',
    expiresAt: new Date(Date.now() + 1e8).toISOString(),
    isAdmin: false,
    mode: 'ADULT',
    user: { id: 'u1', name: 'Aluna', email: 'a@x.org', primaryRole: 'STUDENT', assignedRoles: ['STUDENT'] },
  })) as never;
  return real;
});

beforeEach(() => {
  localStorage.clear();
  cleanup();
  aplicarPreferencias(PREFERENCIAS_PADRAO);
});

describe('AUD-6 — as preferências valem e ficam', () => {
  it('sem nada guardado, vale o padrão; guardado, volta igual', () => {
    expect(lerPreferencias()).toEqual(PREFERENCIAS_PADRAO);
    salvarPreferencias({ ...PREFERENCIAS_PADRAO, altoContraste: true, microfoneId: 'mic-2' });
    expect(lerPreferencias()).toMatchObject({ altoContraste: true, microfoneId: 'mic-2' });
  });

  it('cada preferência vira marca no <html>, e desligar tira a marca', () => {
    const html = document.documentElement;
    aplicarPreferencias({ ...PREFERENCIAS_PADRAO, altoContraste: true, reduzirMovimento: true, leituraEspacada: true });
    expect(html.hasAttribute('data-alto-contraste')).toBe(true);
    expect(html.hasAttribute('data-reduzir-movimento')).toBe(true);
    expect(html.hasAttribute('data-leitura-espacada')).toBe(true);
    aplicarPreferencias(PREFERENCIAS_PADRAO);
    expect(html.hasAttribute('data-alto-contraste')).toBe(false);
  });

  it('o CSS responde a cada marca — marca sem regra seria o mesmo defeito', () => {
    const css = readFileSync('src/index.css', 'utf8');
    for (const marca of ['data-alto-contraste', 'data-reduzir-movimento', 'data-leitura-espacada']) {
      expect(css, marca).toContain(`html[${marca}]`);
    }
  });

  it('🔴 na tela: ligar o alto contraste muda a página e sobrevive a reabrir', async () => {
    const user = userEvent.setup();
    const montar = () =>
      render(
        <RouterProvider>
          <SettingsScreen />
        </RouterProvider>
      );
    montar();
    await user.click(screen.getByRole('button', { name: /Acessibilidade/ }));
    await user.click(screen.getByRole('checkbox', { name: /Alto Contraste/i }));
    expect(document.documentElement.hasAttribute('data-alto-contraste')).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent(/guardada/);

    cleanup();
    montar();
    await user.click(screen.getByRole('button', { name: /Acessibilidade/ }));
    expect(screen.getByRole('checkbox', { name: /Alto Contraste/i })).toBeChecked();
  });

  it('não há mais botão que finge salvar, caixa solta, nem token na tela', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RouterProvider>
        <SettingsScreen />
      </RouterProvider>
    );
    expect(screen.queryByRole('button', { name: /Salvar Preferências/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Conta & Autenticação/ }));
    await screen.findByText('Ativa neste navegador');
    expect(container.textContent).not.toContain('TOKEN-SECRETO-123');
    await user.click(screen.getByRole('button', { name: /Privacidade/ }));
    expect(container.textContent).not.toMatch(/Notificar por e-mail/);
    const fonte = codigo('src/ui/screens/settings/SettingsScreen.tsx');
    expect(fonte).not.toMatch(/defaultChecked|Focusrite|5\.8 ms/);
  });

  it('🔴 o microfone escolhido chega à gravação da mesa', async () => {
    salvarPreferencias({ ...PREFERENCIAS_PADRAO, microfoneId: 'mic-2' });
    const getUserMedia = vi.fn(async () => ({ getTracks: () => [] }));
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
    (globalThis as Record<string, unknown>).MediaRecorder = class {
      start() {}
    };
    await motorDoNavegador.gravar();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: { deviceId: { exact: 'mic-2' } } });
  });
});

/**
 * O código sem os comentários. As guardas de fonte procuram a frase falsa na
 * TELA; o comentário que conta o defeito cita a frase e não pode reprovar.
 */
function codigo(caminho: string): string {
  return readFileSync(caminho, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

const resultado = (over: Partial<PracticeResult>): PracticeResult =>
  ({
    id: 'r',
    exerciseTitle: 'Intervalos',
    modality: 'percepcao',
    summaryScore: 800,
    durationSeconds: 600,
    createdAt: '2026-09-20T10:00:00Z',
    ...over,
  }) as PracticeResult;

describe('AUD-7 — o perfil mede, não inventa', () => {
  it('sem nada feito, tudo é zero', () => {
    const m = medirPerfil({ resultados: [], ofensiva: null, progressos: [] });
    expect(m).toMatchObject({ totalStudyHours: 0, totalPracticeSessions: 0, currentStreakDays: 0, longestStreakDays: 0 });
    expect(m.recentExercises).toEqual([]);
    expect(m.skills).toEqual([]);
  });

  it('com prática e curso, os números saem dos registros', () => {
    const m = medirPerfil({
      resultados: [resultado({ id: 'a' }), resultado({ id: 'b', createdAt: '2026-09-21T10:00:00Z', summaryScore: 950 })],
      ofensiva: { currentStreakDays: 2, longestStreakDays: 5 },
      progressos: [{ studyTimeMinutes: 40 } as never],
      dominios: [{ skillId: 's1', level: 3, scorePercentage: 71.6, totalAttempts: 9 } as never],
      nomes: new Map([['s1', 'Leitura rítmica']]),
    });
    expect(m.totalPracticeSessions).toBe(2);
    expect(m.totalStudyHours).toBe(1); // 40 min + 2 × 10 min
    expect(m.currentStreakDays).toBe(2);
    expect(m.recentExercises[0]).toMatchObject({ id: 'b', accuracyScore: 95 });
    expect(m.skills).toEqual([{ id: 's1', name: 'Leitura rítmica', currentLevel: 3, accuracyRate: 72, totalAttempts: 9 }]);
  });

  it('🔴 o serviço não semeia mais números de fachada', () => {
    const fonte = codigo('src/services/application/profile.service.ts');
    expect(fonte).not.toMatch(/\|\| 32|\|\| 15|\|\| 3,|longestStreakDays: 14|connectionsCount: 8/);
  });

  it('🔴 as abas de um perfil vazio dizem que está vazio — e não mostram a vida de outra pessoa', () => {
    const vazio = {
      practice: { totalPracticeSessions: 0, currentStreakDays: 0, longestStreakDays: 0, skills: [], repertoire: [], achievements: [], recentExercises: [] },
      worlds: { passports: [], badges: [], microcredentials: [] },
    } as unknown as UnifiedProfileRecord;
    const { container } = render(
      <>
        <PracticeTab profile={vazio} />
        <SkillsTab profile={vazio} />
        <BadgesTab profile={vazio} />
      </>
    );
    expect(container.textContent).toMatch(/Nenhuma sessão ainda/);
    expect(container.textContent).toMatch(/Nenhuma competência medida/);
    expect(container.textContent).toMatch(/Nenhuma insígnia/);
    expect(container.textContent).not.toMatch(/Cravo|Mestre da Fuga|Curador Canônico|Steinway|Auditado|Verificado/);
  });

  it('nenhum número de reserva no início do perfil', () => {
    const fonte = codigo('src/ui/components/profile/tabs/ProfileHomeTab.tsx');
    expect(fonte).not.toMatch(/\|\| (84|4|2)\}/);
  });
});

describe('AUD-3 e AUD-5 — o que a tela afirma sobre a pessoa e sobre a plataforma', () => {
  it('o boletim acadêmico exige conta, e não diz mais "Membro Oficial" nem "Auditada"', () => {
    expect(audienciaDaRota('/academia/academic-profile')).toBe('exigeLogin');
    const fonte = codigo('src/ui/screens/academy/AcademicProfileScreen.tsx');
    expect(fonte).not.toMatch(/Membro Oficial|Identidade Auditada|Horas Auditadas/);
  });

  it('AUD-2 — o catálogo de componentes é ferramenta interna', () => {
    expect(audienciaDaRota('/design-system')).toBe('exigeAdmin');
  });

  it('a Ajuda não promete docente avaliando, secretaria homologando, nem Play/Pause no Espaço', () => {
    const fonte = codigo('src/ui/screens/help/HelpScreen.tsx');
    expect(fonte).not.toMatch(/docente da sua cátedra|Secretaria Acadêmica|Play \/ Pause/);
  });
});

describe('AUD-13/14/15 — o console descreve a tela que abre', () => {
  it('os cartões não prometem homologação, denúncias contadas, nem trilha "imutável"', () => {
    const fonte = codigo('src/ui/screens/admin/AdminDashboardScreen.tsx');
    expect(fonte).not.toMatch(/homologação|0 Denúncias|Imutáve|criptográficos|auditadas e assinadas/i);
  });

  it('🔴 a trilha de auditoria lê o registro do SERVIDOR e diz se a cadeia está íntegra', async () => {
    const espiao = vi.spyOn(adminService, 'fetchAuditLogs').mockResolvedValue({
      logs: [
        {
          seq: 1,
          id: 'a1',
          timestamp: '2026-09-23T10:00:00Z',
          action: 'security.admin.denied',
          actorSubject: 's',
          actorEmail: 'x@y.org',
          severity: 'SECURITY',
          details: 'Acesso administrativo recusado.',
          signature: 'h',
          previousSignature: 'genesis',
        },
      ],
      integrity: { valid: true },
    });
    render(
      <RouterProvider>
        <AdminAuditScreen />
      </RouterProvider>
    );
    expect(await screen.findByText(/Cadeia íntegra — 1 registro\./)).toBeInTheDocument();
    expect(screen.getByText('security.admin.denied')).toBeInTheDocument();
    expect(espiao).toHaveBeenCalledWith('TOKEN-SECRETO-123', 200);
    espiao.mockRestore();
  });

  it('servidor fora do ar vira aviso, e não lista vazia que pareça "nada aconteceu"', async () => {
    const espiao = vi.spyOn(adminService, 'fetchAuditLogs').mockRejectedValue(new Error('sem rede'));
    render(
      <RouterProvider>
        <AdminAuditScreen />
      </RouterProvider>
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/não entregou o registro: sem rede/);
    espiao.mockRestore();
  });
});

describe('AUD-8 — só se diz "servidor" do que vai ao servidor', () => {
  it('o perfil não diz mais que a privacidade foi ao servidor', () => {
    const fonte = codigo('src/ui/screens/profile/ProfileOverviewScreen.tsx');
    expect(fonte).not.toMatch(/no servidor/);
  });
});
