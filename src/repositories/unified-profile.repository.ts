import {
  UnifiedProfileRecord,
  Evidence,
  PortfolioItem,
  ProfileSectionConfig,
} from '../domain/profile';
import { UserRole } from '../domain/types';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';

export interface UnifiedProfileRepository {
  findByUserId(userId: string): Promise<UnifiedProfileRecord | null>;
  save(profile: UnifiedProfileRecord): Promise<UnifiedProfileRecord>;
  addEvidence(evidence: Evidence): Promise<Evidence>;
  getEvidencesByUserId(userId: string): Promise<Evidence[]>;
  savePortfolioItem(item: PortfolioItem): Promise<PortfolioItem>;
  deletePortfolioItem(userId: string, itemId: string): Promise<boolean>;
  getPublicProjection(userId: string): Promise<UnifiedProfileRecord | null>;
  listPublicDirectory(): Promise<UnifiedProfileRecord[]>;
}

export class PersistentUnifiedProfileRepository implements UnifiedProfileRepository {
  private storage: StorageAdapter;
  private profilesKey = 'canonical_unified_profiles_v1';
  private evidencesKey = 'canonical_evidences_collection_v1';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private getDefaultSectionsConfig(): ProfileSectionConfig[] {
    return [
      { key: 'home', label: 'Visão Geral (Profile Home)', enabled: true, visibility: 'public', order: 1 },
      { key: 'about', label: 'Sobre & Trajetória (About)', enabled: true, visibility: 'public', order: 2 },
      { key: 'activity', label: 'Atividade Recente (Activity)', enabled: true, visibility: 'public', order: 3 },
      { key: 'experience', label: 'Experiência & Docência (Experience)', enabled: true, visibility: 'public', order: 4 },
      { key: 'skills', label: 'Habilidades & Competências (Skills)', enabled: true, visibility: 'public', order: 5 },
      { key: 'education', label: 'Formação & Titulações (Education)', enabled: true, visibility: 'public', order: 6 },
      { key: 'achievements', label: 'Conquistas & Premiações (Achievements)', enabled: true, visibility: 'public', order: 7 },
      { key: 'credentials', label: 'Credenciais & Certificados (Credentials)', enabled: true, visibility: 'public', order: 8 },
      { key: 'portfolio', label: 'Portfólio & Obras (Portfolio)', enabled: true, visibility: 'public', order: 9 },
      { key: 'projects', label: 'Projetos de Investigação (Projects)', enabled: true, visibility: 'public', order: 10 },
      { key: 'recordings', label: 'Gravações & Áudio (Recordings)', enabled: true, visibility: 'public', order: 11 },
      { key: 'scores', label: 'Partituras & Edições (Scores)', enabled: true, visibility: 'public', order: 12 },
      { key: 'practice', label: 'Rotina de Prática (Practice)', enabled: true, visibility: 'public', order: 13 },
      { key: 'learning_history', label: 'Histórico de Aprendizagem (Learning History)', enabled: true, visibility: 'public', order: 14 },
      { key: 'passports', label: 'Passaportes de Mundos (Passports)', enabled: true, visibility: 'public', order: 15 },
      { key: 'badges', label: 'Distinções & Selos (Badges)', enabled: true, visibility: 'public', order: 16 },
      { key: 'community', label: 'Comunidade & Fóruns (Community)', enabled: true, visibility: 'public', order: 17 },
      { key: 'rooms', label: 'Salas Virtuais & Cátedras (Rooms)', enabled: true, visibility: 'public', order: 18 },
      { key: 'events', label: 'Eventos & Masterclasses (Events)', enabled: true, visibility: 'public', order: 19 },
      // Compatibility keys
      { key: 'academic', label: 'Academia & Cursos', enabled: true, visibility: 'public', order: 20 },
      { key: 'studio', label: 'Estúdio & Produção', enabled: true, visibility: 'public', order: 21 },
      { key: 'worlds', label: 'Mundos Históricos', enabled: true, visibility: 'public', order: 22 },
      { key: 'teacher', label: 'Cátedra Docente', enabled: true, visibility: 'public', order: 23 },
    ];
  }

  private async initializeSeedData(): Promise<Record<string, UnifiedProfileRecord>> {
    const founderProfile: UnifiedProfileRecord = {
      userId: 'usr_founder_1',
      displayName: 'Aline Silva',
      title: 'Fundadora, Curadora & Professora Catedrática',
      headline: 'Música de Concerto • Polifonia Barroca • Performance ao Teclado',
      biography:
        'Pianista, cravista e pesquisadora dedicada à literatura polifônica dos séculos XVII e XVIII. Fundadora da Academia Musical Digital, orientadora de análise morfológica e defensora da prática informada.',
      avatarSource: 'google',
      avatarUrl: undefined,
      primaryRole: UserRole.PROFESSOR,
      assignedRoles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO],
      instruments: ['Piano', 'Cravo Histórico', 'Órgão de Tubos', 'Violino'],
      specialties: [
        'Contraponto Bachiano & Fuga Rigorosa',
        'Prática Informada no Cravo e Teclado',
        'Harmonia Tonal & Morfologia Musical',
        'Música de Câmara dos Séculos XVII–XIX',
        'Edições Críticas e Tratados Históricos',
      ],
      location: 'São Paulo, Brasil • Conservatório de Tatuí / Royal Academy',
      currentStatus: '🟢 Preparando recital do Cravo Bem Temperado (Livro I) • Aberta a cooperações camerísticas',
      capabilities: [
        'Cátedra Docente',
        'Concertista ao Teclado',
        'Avaliadora Institucional',
        'Curadora de Repertório',
        'Pesquisadora CNPq',
      ],
      musicalInterests: [
        'Contraponto Rigoroso',
        'Fuga a Quatro Vozes',
        'Harmonia Funcional',
        'Prática Historicamente Informada',
        'Ornamentação Barroca',
      ],
      experienceLevel: 'conservatorio',
      overallVisibility: 'public',
      sectionsConfig: this.getDefaultSectionsConfig(),
      officialLinks: [
        {
          id: 'lnk-1',
          type: 'website',
          label: 'Portal Pessoal & Gravações',
          url: 'https://alinesilva.mus.br',
          isPublic: true,
        },
        {
          id: 'lnk-2',
          type: 'lattes',
          label: 'Currículo Lattes / CNPq',
          url: 'http://lattes.cnpq.br/4920194820194012',
          isPublic: true,
        },
        {
          id: 'lnk-3',
          type: 'imslp',
          label: 'Edições Críticas no IMSLP',
          url: 'https://imslp.org/wiki/User:AlineSilvaEditions',
          isPublic: true,
        },
        {
          id: 'lnk-4',
          type: 'youtube',
          label: 'Canal de Recitais & Aulas Abertas',
          url: 'https://youtube.com/@AlineSilvaPiano',
          isPublic: true,
        },
      ],

      // Modern Professional Dimension Lists
      experiences: [
        {
          id: 'exp-1',
          role: 'Professora Catedrática de Análise & Polifonia',
          organization: 'Academia Musical Digital',
          location: 'Remoto / Plataforma Canônica',
          startDate: '2023',
          endDate: 'Presente',
          isCurrent: true,
          description: 'Responsável pela concepção curricular dos Cursos de Fuga e Contraponto, mentoria de mais de 80 estudantes e bancas de avaliação de repertório.',
          skills: ['Contraponto Rigoroso', 'Pedagogia Musical', 'Mentoria'],
          category: 'docencia',
        },
        {
          id: 'exp-2',
          role: 'Cravista e Continuísta Convidada',
          organization: 'Orquestra Barroca do Festival Internacional',
          location: 'São Paulo / Curitiba',
          startDate: '2019',
          endDate: 'Presente',
          isCurrent: true,
          description: 'Execução de baixo contínuo em óperas de Purcell e Händel e concertos de Brandenburgo de J.S. Bach ao cravo flamengo.',
          skills: ['Baixo Cifrado', 'Música de Câmara', 'Performance ao Vivo'],
          category: 'performance',
        },
        {
          id: 'exp-3',
          role: 'Coordenadora de Música de Câmara & Prática Histórica',
          organization: 'Conservatório de Música Antiga',
          location: 'São Paulo, Brasil',
          startDate: '2016',
          endDate: '2022',
          isCurrent: false,
          description: 'Direção artística de recitais temáticos, coordenação de oficinas de ornamentação barroca e supervisão de acervo de instrumentos históricos.',
          skills: ['Curadoria Artística', 'Docência', 'Afinação Histórica'],
          category: 'docencia',
        },
      ],

      educationList: [
        {
          id: 'edu-1',
          institution: 'Universidade de São Paulo (USP) / Royal Academy of Music',
          degree: 'Doutorado em Música (Práticas Interpretativas & Musicologia)',
          fieldOfStudy: 'A Retórica Musical e a Estrutura da Fuga em Johann Sebastian Bach',
          startYear: 2017,
          endYear: 2021,
          advisor: 'Prof. Dr. Ricardo Medeiros / Dr. Julian Perkins',
          honors: 'Aprovada com Distinção e Louvor Unânime da Banca',
        },
        {
          id: 'edu-2',
          institution: 'Universidade Estadual de Campinas (UNICAMP)',
          degree: 'Mestrado em Artes / Performance ao Teclado Histórico',
          fieldOfStudy: 'A Prática do Baixo Contínuo e Ornamentação nos Tratados do Século XVIII',
          startYear: 2013,
          endYear: 2015,
          honors: 'Bolsista FAPESP de Excelência Acadêmica',
        },
        {
          id: 'edu-3',
          institution: 'Conservatório Dramático e Musical',
          degree: 'Bacharelado em Instrumento (Piano e Cravo)',
          fieldOfStudy: 'Formação Erudita em Teclado, Harmonia e Contraponto',
          startYear: 2008,
          endYear: 2012,
        },
      ],

      achievementsList: [
        {
          id: 'ach-1',
          title: '1º Lugar no Concurso Latino-Americano de Cravo e Música Antiga',
          issuer: 'Sociedade de Música Barroca Ibero-Americana',
          year: 2022,
          category: 'concurso',
          description: 'Interpretação premiada das Variações Goldberg (seleção) e sonatas de Domenico Scarlatti.',
        },
        {
          id: 'ach-2',
          title: 'Prêmio de Distinção Acadêmica com Louvor de Tese',
          issuer: 'Congresso Internacional de Musicologia',
          year: 2021,
          category: 'premio',
          description: 'Reconhecimento pelo rigor analítico sobre o contraponto invertível nas obras tardias de Bach.',
        },
        {
          id: 'ach-3',
          title: 'Bolsa de Mérito Artístico e Circulação Internacional',
          issuer: 'Fundação de Amparo à Cultura e Música',
          year: 2018,
          category: 'bolsa',
          description: 'Recitais e residência artística em Leipzig e Amsterdã com foco em fontes manuscritas primárias.',
        },
      ],

      recordingsList: [
        {
          id: 'rec-1',
          title: 'J.S. Bach - Prelúdio e Fuga em Dó Menor (BWV 847)',
          workReference: 'O Cravo Bem Temperado, Livro I',
          composer: 'Johann Sebastian Bach',
          duration: '3:42',
          audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
          waveformSnippet: [12, 24, 45, 67, 85, 92, 78, 64, 48, 70, 95, 88, 72, 50, 30, 42, 60, 80, 75, 40],
          recordingDate: '15/04/2024',
          acousticSpace: 'Capela Histórica do Colégio Santa Cruz (Tempo de reverberação 1.8s)',
          instrumentUsed: 'Cravo Histórico Francês de 2 Manuais (Afinação Valotti 415 Hz)',
          visibility: 'public',
        },
        {
          id: 'rec-2',
          title: 'D. Scarlatti - Sonata em Ré Menor K. 141 (Toccata com Notas Repetidas)',
          workReference: 'Sonatas para Teclado',
          composer: 'Domenico Scarlatti',
          duration: '3:15',
          audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg',
          waveformSnippet: [30, 50, 75, 90, 88, 80, 95, 100, 85, 70, 65, 80, 90, 75, 60, 45, 70, 85, 60, 35],
          recordingDate: '02/02/2024',
          acousticSpace: 'Estúdio Auditório Clara Schumann (Tratamento acústico de difusão QRD)',
          instrumentUsed: 'Piano Steinway & Sons Model B (Afinação Igual 440 Hz)',
          visibility: 'public',
        },
        {
          id: 'rec-3',
          title: 'François Couperin - Les Barricades Mystérieuses (Rondeau)',
          workReference: 'Second Livre de pièces de clavecin (6e Ordre)',
          composer: 'François Couperin',
          duration: '2:58',
          audioUrl: 'https://actions.google.com/sounds/v1/water/creek_water_fast.ogg',
          waveformSnippet: [15, 25, 40, 55, 65, 70, 72, 68, 60, 55, 62, 68, 70, 65, 50, 40, 35, 45, 50, 20],
          recordingDate: '20/11/2023',
          acousticSpace: 'Sala de Música Antiga (Ambiente intimista)',
          instrumentUsed: 'Cravo Flamengo de 1 Manual (Afinação Meio-Tom 415 Hz)',
          visibility: 'public',
        },
      ],

      scoresList: [
        {
          id: 'scr-1',
          title: 'Edição Crítica Analítica: J.S. Bach - Fuga a 4 Vozes em Sol Menor BWV 861',
          workReference: 'BWV 861 (Livro I do Cravo Bem Temperado)',
          composer: 'Johann Sebastian Bach',
          type: 'edicao_critica',
          keySignature: 'Sol Menor (2 bemóis)',
          timeSignature: '4/4',
          pagesCount: 6,
          previewUrl: 'https://imslp.org/wiki/BWV_861',
          clefs: ['Clave de Sol (2ª linha)', 'Clave de Fá (4ª linha)'],
          visibility: 'public',
          publishedAt: '2023-11-10T10:00:00Z',
        },
        {
          id: 'scr-2',
          title: 'Realização de Baixo Cifrado: H. Purcell - Sonata em Ré Menor para Violino e Continuo',
          workReference: 'Z. 793',
          composer: 'Henry Purcell',
          type: 'arranjo',
          keySignature: 'Ré Menor (1 bemol)',
          timeSignature: '3/2',
          pagesCount: 8,
          clefs: ['Clave de Sol', 'Clave de Dó (3ª linha)', 'Clave de Fá'],
          visibility: 'public',
          publishedAt: '2024-01-15T14:30:00Z',
        },
      ],

      projectsList: [
        {
          id: 'prj-1',
          title: 'Dossiê do Cravo Bem Temperado: Gravação & Análise Polifônica Integral',
          subtitle: 'Pesquisa interpretativa comparando temperamentos históricos e modernas gravações',
          status: 'em_andamento',
          role: 'Pesquisadora Líder & Cravista Solo',
          collaborators: ['Gabriel Carvalho (Análise Schenkeriana)', 'Arthur Moreira (Áudio e Engenharia)'],
          description: 'Documentação dos 24 pares de Prelúdios e Fugas gravados em cravo histórico, acompanhados de cadernos explicativos com marcação formal de sujeitos, contrassujeitos e episódios modulantes.',
          startDate: 'Janeiro de 2023',
          endDate: 'Dezembro de 2025',
          externalLink: 'https://alinesilva.mus.br/cravo-bem-temperado',
        },
        {
          id: 'prj-2',
          title: 'Arquivo Aberto de Edições de Música Barroca Ibero-Americana',
          subtitle: 'Resgate de manuscritos do século XVIII em Minas Gerais e Bahia para notação digital',
          status: 'concluido',
          role: 'Editora Crítica & Transcritora',
          collaborators: ['Acervo Histórico de Ouro Preto', 'Orquestra Barroca'],
          description: 'Digitalização e transcrição crítica de obras sacras polifônicas para livre consulta acadêmica e execução em recitais de conservatório.',
          startDate: '2021',
          endDate: '2023',
        },
      ],

      // As quatro conexoes semeadas aqui (usr_gabriel_1, usr_clara_1,
      // usr_arthur_1, usr_helena_1) referenciavam perfis que NAO EXISTEM no
      // repositorio. Enquanto nao havia rota por usuario ninguem percebia;
      // com /profile/:userId cada uma vira um link morto. Foram removidas por
      // isso — o recurso de conexoes continua inteiro, o que saiu foi dado
      // fabricado (CLAUDE_AUDIT.md P-04). A rede real se forma com os
      // usuarios que entrarem.
      connectionsList: [],

      // Academic Lens
      academic: {
        totalStudyHours: 420,
        enrolledCourses: [
          {
            id: 'crs-polifonia-bach',
            title: 'Contraponto Rigoroso e Fuga a 4 Vozes',
            instructor: 'Prof. Gabriel Carvalho',
            progressPercentage: 100,
            hoursStudied: 120,
            status: 'concluido',
          },
          {
            id: 'crs-harmonia-funcional',
            title: 'Harmonia Funcional e Encademento de Vozes',
            instructor: 'Profa. Clara Schumann',
            progressPercentage: 100,
            hoursStudied: 90,
            status: 'concluido',
          },
          {
            id: 'crs-orquestracao',
            title: 'Instrumentação e Tratamento de Madeiras',
            instructor: 'Maestro Heitor Villa',
            progressPercentage: 85,
            hoursStudied: 65,
            status: 'em_andamento',
          },
        ],
        learningPaths: [
          {
            pathId: 'path-composicao-mestre',
            title: 'Trilha do Mestre de Capela: Do Canto Gregoriano à Fuga Dupla',
            totalModules: 8,
            completedModules: 8,
            percentage: 100,
            status: 'concluida',
          },
          {
            pathId: 'path-cravo-acustico',
            title: 'Trilha de Prática Histórica ao Teclado',
            totalModules: 6,
            completedModules: 5,
            percentage: 83,
            status: 'em_andamento',
          },
        ],
        certificates: [
          {
            id: 'cert-bacharelado-piano',
            courseTitle: 'Bacharelado em Piano & Teclados Históricos',
            issueDate: '2025-12-15T00:00:00.000Z',
            workloadHours: 2400,
            digitalSignatureHash: 'sha256:7e91f0a28b12c5943efaa98104d9c72e61a498b3c990bfa1',
            institution: 'Conservatório Superior da Academia Musical Digital',
            status: 'valido',
          },
          {
            id: 'cert-contraponto-fuga',
            courseTitle: 'Especialização Avançada em Fuga e Cânone Instrumental',
            issueDate: '2026-03-20T00:00:00.000Z',
            workloadHours: 180,
            digitalSignatureHash: 'sha256:4a38cc9110dbbf59281e5920ac3417bfa0092147ae5b4931',
            institution: 'Cátedra de Composição Polifônica',
            status: 'valido',
          },
        ],
        competencies: [
          {
            id: 'comp-1',
            name: 'Contraponto a 4 Vozes no Estilo Estrito',
            domain: 'contraponto',
            level: 'mestre',
            evaluatedScore: 98,
            verifiedBy: 'Conselho Docente de Composição',
          },
          {
            id: 'comp-2',
            name: 'Encadeamento Harmônico e Modulação Avançada',
            domain: 'harmonia',
            level: 'mestre',
            evaluatedScore: 96,
            verifiedBy: 'Banca Examinadora',
          },
          {
            id: 'comp-3',
            name: 'Análise Estrutural e Arquitetura da Forma Sonata',
            domain: 'analise',
            level: 'avancado',
            evaluatedScore: 94,
            verifiedBy: 'Instituto de Pesquisa Musicológica',
          },
          {
            id: 'comp-4',
            name: 'Percepção e Transcrição Polifônica Simultânea',
            domain: 'percepcao',
            level: 'avancado',
            evaluatedScore: 92,
            verifiedBy: 'Laboratório Voice/Ear da Academia',
          },
          {
            id: 'comp-5',
            name: 'Acústica de Instrumentos de Cordas e Teclados',
            domain: 'acustica',
            level: 'avancado',
            evaluatedScore: 90,
            verifiedBy: 'Laboratório de Física Musical',
          },
        ],
      },

      // Practice Lens
      practice: {
        totalPracticeSessions: 180,
        currentStreakDays: 45,
        longestStreakDays: 92,
        skills: [
          {
            id: 'sk-1',
            name: 'Independência Polifônica das Mãos',
            category: 'polifonia',
            currentLevel: 10,
            accuracyRate: 98.6,
            weeklyMinutes: 240,
          },
          {
            id: 'sk-2',
            name: 'Estabilidade Métrica & Andamentos Vivos',
            category: 'ritmo',
            currentLevel: 9,
            accuracyRate: 97.4,
            weeklyMinutes: 180,
          },
          {
            id: 'sk-3',
            name: 'Afinação em Afinações Históricas (Valotti / Werckmeister)',
            category: 'afinacao',
            currentLevel: 9,
            accuracyRate: 96.8,
            weeklyMinutes: 120,
          },
          {
            id: 'sk-4',
            name: 'Leitura à Primeira Vista de Partituras Orquestrais',
            category: 'leitura_primeira_vista',
            currentLevel: 9,
            accuracyRate: 94.5,
            weeklyMinutes: 150,
          },
        ],
        repertoire: [
          {
            id: 'rep-1',
            workTitle: 'O Cravo Bem Temperado, Livro I: Prelúdio e Fuga em Dó Menor BWV 847',
            composer: 'J.S. Bach',
            instrument: 'Cravo Histórico / Piano',
            status: 'gravado',
            recordedEvidenceId: 'evi-bach-bwv847',
            lastPracticedAt: '2026-09-14T10:30:00.000Z',
          },
          {
            id: 'rep-2',
            workTitle: 'Partita No. 2 em Ré Menor para Violino Solo BWV 1004: Chaconne',
            composer: 'J.S. Bach',
            instrument: 'Violino Acústico',
            status: 'apresentado',
            recordedEvidenceId: 'evi-chaconne-solo',
            lastPracticedAt: '2026-09-13T14:00:00.000Z',
          },
          {
            id: 'rep-3',
            workTitle: 'Sonata No. 8 em Dó Menor Op. 13 "Patética"',
            composer: 'L. van Beethoven',
            instrument: 'Piano de Cauda',
            status: 'polido',
            lastPracticedAt: '2026-09-11T16:20:00.000Z',
          },
          {
            id: 'rep-4',
            workTitle: 'Variações sobre um Tema de Paganini Op. 35 (Livro I)',
            composer: 'Johannes Brahms',
            instrument: 'Piano de Cauda',
            status: 'em_estudo',
            lastPracticedAt: '2026-09-15T08:00:00.000Z',
          },
        ],
        achievements: [
          {
            id: 'ach-1',
            title: 'Guardiã da Polifonia Estrita',
            description: 'Mais de 100 horas de prática contrapontística auditadas com precisão >95%.',
            badgeIcon: 'Scroll',
            unlockedAt: '2026-02-10T00:00:00.000Z',
          },
          {
            id: 'ach-2',
            title: 'Sequência Imperial: 45 Dias',
            description: 'Prática diária ininterrupta no simulador acústico da Academia.',
            badgeIcon: 'Flame',
            unlockedAt: '2026-09-15T00:00:00.000Z',
          },
          {
            id: 'ach-3',
            title: 'Ouvido Absoluto & Transcritor',
            description: 'Acurácia de 98% no laboratório de percepção e ditado tonal.',
            badgeIcon: 'Ear',
            unlockedAt: '2026-05-18T00:00:00.000Z',
          },
        ],
        recentExercises: [
          {
            id: 'ex-1',
            title: 'Exercício de Ditado Polifônico a 3 Vozes',
            toolUsed: 'Voice & Ear Lab',
            accuracyScore: 97,
            completedAt: '2026-09-14T11:15:00.000Z',
          },
          {
            id: 'ex-2',
            title: 'Treinamento de Articulação Staccato e Legato Barroco',
            toolUsed: 'Simulador de Teclado',
            accuracyScore: 98,
            completedAt: '2026-09-13T16:00:00.000Z',
          },
        ],
      },

      // Studio & Portfolio Lens
      portfolio: [
        {
          id: 'port-1',
          userId: 'usr_founder_1',
          title: 'Gravação Acústica: J.S. Bach - Chaconne em Ré Menor (BWV 1004)',
          category: 'gravacao',
          context: 'Recital acústico gravado em capela histórica com acústica natural de 2.2s de reverberação.',
          objective: 'Demonstrar execução contrapontística em violino barroco com arco histórico e cordas de tripa.',
          userRoleInProject: 'Violinista Solo e Engenheira de Captação Acústica',
          skills: ['Interpretação Barroca', 'Acústica Arquitetural', 'Afinação Histórica 415Hz'],
          instruments: ['Violino Barroco'],
          workReferences: 'J.S. Bach - Partita No. 2 em Ré Menor, BWV 1004',
          processNotes:
            'Captação estéreo com par espaçado de microfones valvulados omnidirecionais a 2.5m do instrumento. Sem compressão dinâmica na cadeia.',
          resultSummary: 'Registro de referência com clareza polifônica e sustentação de vozes ocultas.',
          evidenceIds: ['evi-chaconne-solo'],
          artifactUrl: '/audio/chaconne_bwv1004_master.wav',
          audioPreviewUrl: 'https://cdn.example.com/audio/bwv1004_snippet.mp3',
          visibility: 'public',
          version: '1.2.0',
          isFeatured: true,
          orderIndex: 1,
          publishedAt: '2026-08-20T18:00:00.000Z',
          createdAt: '2026-08-15T00:00:00.000Z',
          updatedAt: '2026-08-20T18:00:00.000Z',
        },
        {
          id: 'port-2',
          userId: 'usr_founder_1',
          title: 'Edição Crítica de Partitura: Fuga a Quatro Vozes em Dó Menor',
          category: 'partitura',
          context: 'Edição de urtext para estudo analítico e dedilhado pedagógico com marcações contrapontísticas.',
          objective: 'Criar uma partitura anotada em cores separadas por voz (soprano, contralto, tenor, baixo).',
          userRoleInProject: 'Editora Notacional & Musicóloga Curadora',
          skills: ['Notação MusicXML', 'Análise Morfológica', 'Dedilhado Histórico'],
          instruments: ['Cravo', 'Piano'],
          workReferences: 'J.S. Bach - O Cravo Bem Temperado BWV 847',
          processNotes: 'Elaborado integralmente no Score Editor da Academia com conferência de autógrafos originais de Berlim.',
          resultSummary: 'Partitura homologada e adotada oficialmente nas turmas de contraponto.',
          evidenceIds: ['evi-score-bwv847'],
          scorePreviewSnippet: 'Score: 4 Vozes | Compasso 4/4 | 31 compassos | 0 paralelismos proibidos',
          visibility: 'public',
          version: '2.0.1',
          isFeatured: true,
          orderIndex: 2,
          publishedAt: '2026-07-10T14:30:00.000Z',
          createdAt: '2026-07-01T00:00:00.000Z',
          updatedAt: '2026-07-10T14:30:00.000Z',
        },
        {
          id: 'port-3',
          userId: 'usr_founder_1',
          title: 'Composição Original: Prelúdio e Passacaglia Modal em Ré Menor',
          category: 'composicao',
          context: 'Obra composta para cravo de dois manuais e cordas graves baseada em baixo ostinato de 8 compassos.',
          objective: 'Desenvolver 16 variações estritas sobre o tema com densidade contrapontística progressiva.',
          userRoleInProject: 'Compositora e Intérprete',
          skills: ['Composição Tonal', 'Baixo Ostinato', 'Contraponto Invertível'],
          instruments: ['Cravo Histórico', 'Violoncelo Barroco'],
          processNotes: 'Escrita manual preliminar convertida em projeto multitrack no Studio DAW da plataforma.',
          resultSummary: 'Apresentada no Recital de Gala da Primavera com acolhimento unânime da crítica acadêmica.',
          evidenceIds: ['evi-passacaglia-original'],
          visibility: 'public',
          version: '1.0.0',
          isFeatured: true,
          orderIndex: 3,
          publishedAt: '2026-06-05T20:00:00.000Z',
          createdAt: '2026-05-15T00:00:00.000Z',
          updatedAt: '2026-06-05T20:00:00.000Z',
        },
        {
          id: 'port-4',
          userId: 'usr_founder_1',
          title: 'Projeto Multitrack DAW: Trio Sonata em Sol Maior (BWV 1039)',
          category: 'projeto',
          context: 'Reconstrução espacial em alta fidelidade com 4 stems independentes: Flauta I, Flauta II, Viola da Gamba e Baixo Contínuo.',
          objective: 'Permitir que alunos mutem qualquer voz para estudo individual e prática acompanhada.',
          userRoleInProject: 'Produtora de Áudio e Executante do Baixo Contínuo ao Cravo',
          skills: ['Mixagem Espacial', 'Gravação Multitrack', 'Realização de Baixo Cifrado'],
          instruments: ['Cravo', 'Flauta Doce', 'Viola da Gamba'],
          evidenceIds: ['evi-daw-triosonata'],
          visibility: 'public',
          version: '1.1.0',
          isFeatured: false,
          orderIndex: 4,
          publishedAt: '2026-05-01T10:00:00.000Z',
          createdAt: '2026-04-20T00:00:00.000Z',
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
      ],

      // Evidences Linked to Artifacts
      evidences: [
        {
          id: 'evi-chaconne-solo',
          userId: 'usr_founder_1',
          source: 'studio',
          sourceEntityId: 'proj-chaconne-rec',
          title: 'Tomada Auditada: Chaconne BWV 1004 na Íntegra (14min)',
          description: 'Gravação sem cortes aprovada pelo Conselho de Interpretação Histórica.',
          artifactType: 'audio',
          artifactUrl: 'https://storage.academia.mus.br/evidences/chaconne_bwv1004.flac',
          sha256Hash: 'sha256:7f83b16520b221087b7a123fbc019a8910e54d89a202bc94a',
          evaluator: {
            id: 'usr_eval_gabriel',
            name: 'Prof. Gabriel Carvalho',
            title: 'Doutor em Práticas Interpretativas',
            decision: 'aprovado_com_louvor',
            feedbackNotes: 'Articulação pristina e domínio estrito do contraponto implícito.',
          },
          skills: ['Interpretação Barroca', 'Afinação Pura', 'Polifonia ao Violino'],
          instruments: ['Violino Barroco'],
          metadata: { sampleRate: 96000, bitDepth: 24, channels: 2 },
          visibility: 'public',
          createdAt: '2026-08-16T12:00:00.000Z',
        },
        {
          id: 'evi-score-bwv847',
          userId: 'usr_founder_1',
          source: 'studio',
          sourceEntityId: 'score-bwv847-ed',
          title: 'Edição Notacional: Fuga em Dó Menor BWV 847 com Análise de Sujeito e Resposta',
          description: 'Documento MusicXML auditado sem sobreposições indevidas de vozes.',
          artifactType: 'score',
          artifactUrl: 'https://storage.academia.mus.br/evidences/bwv847_analitica.musicxml',
          sha256Hash: 'sha256:3a18e201948ba2014bca891024bc01948bc5cd9102934b5c',
          evaluator: {
            id: 'usr_eval_clara',
            name: 'Profa. Clara Schumann',
            title: 'Cátedra de Teoria e Contraponto',
            decision: 'aprovado_com_louvor',
            feedbackNotes: 'Marcações de entradas temáticas de clareza didática impecável.',
          },
          skills: ['Notação Notacional', 'Dedilhado Histórico'],
          instruments: ['Cravo', 'Piano'],
          metadata: { totalMeasures: 31, parts: 4 },
          visibility: 'public',
          createdAt: '2026-07-08T15:00:00.000Z',
        },
        {
          id: 'evi-passacaglia-original',
          userId: 'usr_founder_1',
          source: 'studio',
          sourceEntityId: 'comp-passacaglia',
          title: 'Manuscrito Digital & Partitura Orquestrada: Passacaglia em Ré Menor',
          description: 'Composição original registrada com hash criptográfico de anterioridade autoral.',
          artifactType: 'document',
          artifactUrl: 'https://storage.academia.mus.br/evidences/passacaglia_d_minor_full.pdf',
          sha256Hash: 'sha256:91c28f11002934ba81024ecb90124ba1029348bc10294e20',
          evaluator: {
            id: 'usr_founder_council',
            name: 'Conselho de Registro de Propriedade Intelectual Musical',
            title: 'Certificação de Proveniência Autoral',
            decision: 'aprovado',
            feedbackNotes: 'Hash imutável registrado no livro de anterioridade acadêmica.',
          },
          skills: ['Composição Tonal', 'Baixo Ostinato'],
          instruments: ['Cravo', 'Violoncelo'],
          metadata: { pages: 18, movements: 1 },
          visibility: 'public',
          createdAt: '2026-06-01T10:00:00.000Z',
        },
        {
          id: 'evi-daw-triosonata',
          userId: 'usr_founder_1',
          source: 'studio',
          sourceEntityId: 'proj-triosonata',
          title: 'Pacote de Stems de Estudo: BWV 1039 (4 canais isolados)',
          description: 'Exportação multitrack com mix estéreo e stems individuais para o player de acompanhamento.',
          artifactType: 'project',
          artifactUrl: 'https://storage.academia.mus.br/evidences/bwv1039_stems.zip',
          sha256Hash: 'sha256:5c019a891024bc019284ba01924b102948bc19204bc91240',
          skills: ['Mixagem de Stems', 'Gravação Histórica'],
          instruments: ['Cravo', 'Flautas'],
          metadata: { stemCount: 4, durationSeconds: 780 },
          visibility: 'public',
          createdAt: '2026-04-28T17:00:00.000Z',
        },
      ],

      // Worlds & Credentials Lens
      worlds: {
        passports: [
          {
            id: 'pass-barroco',
            worldName: 'Mundo Barroco & Polifonia Sacra',
            era: '1600 – 1750',
            stampsCount: 12,
            masteryPercentage: 100,
            unlockedAt: '2026-01-15T00:00:00.000Z',
          },
          {
            id: 'pass-classico',
            worldName: 'Mundo Clássico & Escola de Viena',
            era: '1750 – 1820',
            stampsCount: 9,
            masteryPercentage: 88,
            unlockedAt: '2026-04-10T00:00:00.000Z',
          },
          {
            id: 'pass-romantico',
            worldName: 'Mundo Romântico & Virtuosismo',
            era: '1820 – 1900',
            stampsCount: 6,
            masteryPercentage: 65,
            unlockedAt: '2026-07-01T00:00:00.000Z',
          },
        ],
        badges: [
          {
            id: 'bdg-bach-complete',
            name: 'Insígnia Bachiana Dourada',
            category: 'Repertório Fundamental',
            icon: 'Crown',
            unlockedAt: '2026-03-01T00:00:00.000Z',
          },
          {
            id: 'bdg-counterpoint-audit',
            name: 'Selo de Mestre em Contraponto',
            category: 'Prerrogativa Docente',
            icon: 'Award',
            unlockedAt: '2026-05-12T00:00:00.000Z',
          },
          {
            id: 'bdg-century-streak',
            name: 'Constância Inabalável',
            category: 'Prática Auditada',
            icon: 'Sparkles',
            unlockedAt: '2026-08-30T00:00:00.000Z',
          },
        ],
        microcredentials: [
          {
            id: 'micro-notacao-urtext',
            title: 'Microcredencial: Notação Urtext & Transcrição Manuscrita',
            issuer: 'Conselho Pedagógico da Academia',
            verificationHash: 'sha256:8891024bc019284ba10294ecb90124ba1029348bc102',
            issuedAt: '2026-06-15T00:00:00.000Z',
            badgeLevel: 'platinum',
          },
          {
            id: 'micro-temperamentos',
            title: 'Microcredencial: Afinação em Temperamentos Desiguais',
            issuer: 'Laboratório de Acústica Musical',
            verificationHash: 'sha256:119024bc01924b102948bc19204bc912401029348bc9',
            issuedAt: '2026-08-01T00:00:00.000Z',
            badgeLevel: 'gold',
          },
        ],
        institutionalRankContext: {
          academicTier: 'Docente Titular & Cátedra Sênior',
          peerGroupPercentile: 99.8,
        },
      },

      // Community Lens
      community: {
        // Tem que bater com connectionsList. O valor anterior (342) contradizia
        // uma lista de 4 itens e agora contradiria uma lista vazia — o cabecalho
        // exibiria "Conectado (342)" sem nenhuma conexao.
        connectionsCount: 0,
        posts: [
          {
            id: 'post-1',
            title: 'Por que o temperamento igual empobrece o colorido retórico das fugas de Bach?',
            summary: 'Um ensaio sobre os afetos tonais e a dissonância consonante nos temperamentos de Werckmeister III e Kirnberger.',
            publishedAt: '2026-09-02T16:00:00.000Z',
            upvotes: 148,
            commentsCount: 36,
          },
          {
            id: 'post-2',
            title: 'Guia de Estudo: Como praticar o Prelúdio e Fuga em Dó Menor BWV 847 sem cansaço muscular',
            summary: 'Exercícios de relaxamento de punho, peso do braço e desarticulação lenta de dedos para tecladistas.',
            publishedAt: '2026-08-14T10:00:00.000Z',
            upvotes: 215,
            commentsCount: 52,
          },
        ],
        forumParticipations: [
          {
            topicId: 'top-quintas-paralelas',
            topicTitle: 'Quintas paralelas por movimento contrário: quando são aceitáveis?',
            category: 'Contraponto Rigoroso',
            repliesCount: 14,
            isAcceptedAnswer: true,
          },
          {
            topicId: 'top-cadencia-frigia',
            topicTitle: 'Resolução da Cadência Frígia em Johann Sebastian Bach',
            category: 'Harmonia Funcional',
            repliesCount: 8,
            isAcceptedAnswer: true,
          },
        ],
        eventsAttended: [
          {
            id: 'ev-colloquium-2026',
            title: 'Colóquio Internacional de Música Antiga da Academia',
            date: '2026-07-25T14:00:00.000Z',
            role: 'palestrante',
          },
          {
            id: 'ev-masterclass-chaconne',
            title: 'Masterclass Magna: A Arquitetura Oculta da Chaconne',
            date: '2026-08-18T19:00:00.000Z',
            role: 'performer',
          },
        ],
      },

      // Rooms Lens (Student participations + Teacher Room)
      rooms: {
        attendedRooms: [
          {
            roomId: 'room-musicologia-avancada',
            roomName: 'Seminário de Pesquisa Musicológica & Paleografia Musical',
            teacherName: 'Prof. Dr. Manfred Bukofzer',
            role: 'aluno',
            coursesCount: 2,
            lessonsCount: 16,
            assignmentsSubmitted: 8,
            nextEvent: {
              title: 'Apresentação de Trabalhos de Paleografia Musical',
              date: '2026-09-28T18:00:00.000Z',
            },
          },
        ],

        // Teacher's Own Room (Displayed prominently because primaryRole is PROFESSOR)
        teacherProfile: {
          ownRoomId: 'room-catedra-aline-silva',
          roomName: 'Cátedra de Polifonia & Contraponto Rigoroso',
          tagline: 'Formação aprofundada em escrita polifônica estrita, análise temática e execução estilística ao teclado e cordas.',
          heroImageUrl: 'https://images.unsplash.com/photo-1520523839898-507127053e14?q=80&w=1200&auto=format&fit=crop',
          description:
            'Espaço oficial de orientação da Profa. Aline Silva. Aqui os alunos enviam tarefas de contraponto a 2, 3 e 4 vozes, recebem correções compasso a compasso com anotações de voz e participam de bancas de audição pública quinzenais.',
          enrolledStudentsCount: 54,
          coursesOffered: [
            {
              id: 'crs-catedra-1',
              title: 'Contraponto a Duas Vozes e Cânones Estritos',
              level: 'Intermediário',
              enrolledCount: 32,
            },
            {
              id: 'crs-catedra-2',
              title: 'Laboratório Prático de Fuga a Quatro Vozes',
              level: 'Avançado',
              enrolledCount: 22,
            },
          ],
          upcomingClassesAndEvents: [
            {
              id: 'live-aula-1',
              title: 'Masterclass ao Vivo: Resolução de Respostas Tonais vs Reais em Fugas',
              date: '2026-09-18T19:00:00.000Z',
              type: 'aula_ao_vivo',
            },
            {
              id: 'live-audicao-2',
              title: 'Audição Pública e Banca de Avaliação dos Alunos da Cátedra',
              date: '2026-09-25T18:30:00.000Z',
              type: 'audicao',
            },
          ],
          guidedProjects: [
            {
              id: 'proj-guia-1',
              title: 'Sonata em Estilo Antigo para Flauta e Baixo Contínuo',
              studentName: 'Lucas Ferreira',
              status: 'em_andamento',
            },
            {
              id: 'proj-guia-2',
              title: 'Série de 6 Invenções Didáticas para Piano',
              studentName: 'Mariana Duarte',
              status: 'concluido',
            },
          ],
          teacherAnnouncements: [
            {
              id: 'ann-1',
              title: 'Prazo Final para Envio de Exercícios do Módulo de Fugas Cromáticas',
              date: '2026-09-14T09:00:00.000Z',
              content:
                'Prezados alunos da Cátedra: a entrega dos compassos de estreito (stretto) encerra-se nesta sexta-feira às 23h59. Lembrem-se de auditar antes no gerador de paralelismos.',
            },
          ],
          exposeStudentCount: true,
          exposeUpcomingLives: true,
          exposeGuidedProjects: true,
        },
      },

      updatedAt: new Date().toISOString(),
    };

    const map: Record<string, UnifiedProfileRecord> = {
      usr_founder_1: founderProfile,
      usr_founder_2: {
        ...founderProfile,
        userId: 'usr_founder_2',
        displayName: 'Office Aline Silva',
        title: 'Coordenação Institucional & Governança Acadêmica',
        headline: 'Direção Acadêmica • Homologação de Cátedras • Musicologia',
        biography:
          'Direção e governança acadêmica da Academia Musical Digital. Auditoria curricular, validação de proveniência musicológica e acompanhamento das cátedras institucionais.',
      },
    };

    await this.storage.setItem(this.profilesKey, map);
    return map;
  }

  private async getAllProfilesMap(): Promise<Record<string, UnifiedProfileRecord>> {
    const raw = await this.storage.getItem<Record<string, UnifiedProfileRecord>>(this.profilesKey);
    if (!raw || Object.keys(raw).length === 0) {
      return this.initializeSeedData();
    }
    return raw;
  }

  public async findByUserId(userId: string): Promise<UnifiedProfileRecord | null> {
    const map = await this.getAllProfilesMap();
    // Um id desconhecido devolve null. A versao anterior tratava qualquer id
    // que CONTIVESSE a palavra "founder" como fundador e, pior, caia em
    // `initialized.usr_founder_1` quando nao achava — de modo que
    // `usr_founder_qualquer-coisa` devolvia o registro completo da fundadora.
    // Inofensivo enquanto nao havia rota por usuario; vazamento acessivel por
    // URL a partir de /profile/:userId (CLAUDE_AUDIT.md P-01).
    return map[userId] ?? null;
  }

  /**
   * Diretorio de pessoas: so quem esta publicamente visivel.
   *
   * O filtro roda aqui, na fonte, e nao na tela — uma lista de pessoas
   * montada no cliente a partir do mapa completo entregaria perfis privados
   * ao bundle mesmo que a UI os escondesse.
   */
  public async listPublicDirectory(): Promise<UnifiedProfileRecord[]> {
    const map = await this.getAllProfilesMap();
    const visiveis = Object.values(map).filter((p) => p.overallVisibility !== 'private');
    const projetados = await Promise.all(
      visiveis.map((p) => this.getPublicProjection(p.userId))
    );
    return projetados
      .filter((p): p is UnifiedProfileRecord => p !== null)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }

  public async save(profile: UnifiedProfileRecord): Promise<UnifiedProfileRecord> {
    const map = await this.getAllProfilesMap();
    const updated: UnifiedProfileRecord = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    map[profile.userId] = updated;
    await this.storage.setItem(this.profilesKey, map);
    return updated;
  }

  public async addEvidence(evidence: Evidence): Promise<Evidence> {
    const allEvidences = (await this.storage.getItem<Evidence[]>(this.evidencesKey)) || [];
    allEvidences.push(evidence);
    await this.storage.setItem(this.evidencesKey, allEvidences);

    // Also link into the user's unified profile record
    const profile = await this.findByUserId(evidence.userId);
    if (profile) {
      profile.evidences = [evidence, ...profile.evidences.filter((e) => e.id !== evidence.id)];
      await this.save(profile);
    }

    return evidence;
  }

  public async getEvidencesByUserId(userId: string): Promise<Evidence[]> {
    const profile = await this.findByUserId(userId);
    if (profile) {
      return profile.evidences;
    }
    const all = (await this.storage.getItem<Evidence[]>(this.evidencesKey)) || [];
    return all.filter((e) => e.userId === userId);
  }

  public async savePortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    const profile = await this.findByUserId(item.userId);
    if (!profile) {
      throw new Error(`Perfil do usuário ${item.userId} não encontrado para adicionar item ao portfólio.`);
    }

    const existingIdx = profile.portfolio.findIndex((p) => p.id === item.id);
    if (existingIdx >= 0) {
      profile.portfolio[existingIdx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      profile.portfolio.push(item);
    }

    // Sort by orderIndex
    profile.portfolio.sort((a, b) => a.orderIndex - b.orderIndex);
    await this.save(profile);
    return item;
  }

  public async deletePortfolioItem(userId: string, itemId: string): Promise<boolean> {
    const profile = await this.findByUserId(userId);
    if (!profile) return false;

    const initialLen = profile.portfolio.length;
    profile.portfolio = profile.portfolio.filter((p) => p.id !== itemId);
    if (profile.portfolio.length !== initialLen) {
      await this.save(profile);
      return true;
    }
    return false;
  }

  /**
   * Server-approved public projection.
   * In strict compliance with Docs 30 & 54:
   * "Server builds a visibility-filtered projection. Never send private fields to frontend and rely on CSS to hide them."
   */
  public async getPublicProjection(userId: string): Promise<UnifiedProfileRecord | null> {
    const full = await this.findByUserId(userId);
    if (!full) return null;

    if (full.overallVisibility === 'private') {
      return null; // Entire profile is private
    }

    // Filter sections based on visibility
    const visibleSections = full.sectionsConfig.filter(
      (s) => s.enabled && s.visibility === 'public'
    );

    // Filter portfolio items (only public items)
    const publicPortfolio = full.portfolio.filter((p) => p.visibility === 'public');

    // Filter evidences (only public evidences)
    const publicEvidences = full.evidences.filter((e) => e.visibility === 'public');

    // Filter official links (only public links)
    const publicLinks = full.officialLinks.filter((l) => l.isPublic);

    // Build the projected record
    const projected: UnifiedProfileRecord = {
      ...full,
      sectionsConfig: visibleSections,
      portfolio: publicPortfolio,
      evidences: publicEvidences,
      officialLinks: publicLinks,
      // If a section is hidden/private, empty its data in the public projection
      academic: visibleSections.some((s) => s.key === 'academic')
        ? full.academic
        : {
            totalStudyHours: 0,
            enrolledCourses: [],
            learningPaths: [],
            certificates: [],
            competencies: [],
          },
      practice: visibleSections.some((s) => s.key === 'practice')
        ? full.practice
        : {
            totalPracticeSessions: 0,
            currentStreakDays: 0,
            longestStreakDays: 0,
            skills: [],
            repertoire: [],
            achievements: [],
            recentExercises: [],
          },
      worlds: visibleSections.some((s) => s.key === 'worlds')
        ? full.worlds
        : {
            passports: [],
            badges: [],
            microcredentials: [],
          },
      community: visibleSections.some((s) => s.key === 'community')
        ? full.community
        : {
            connectionsCount: full.community.connectionsCount,
            posts: [],
            forumParticipations: [],
            eventsAttended: [],
          },
      rooms: visibleSections.some((s) => s.key === 'rooms' || s.key === 'teacher')
        ? {
            attendedRooms: visibleSections.some((s) => s.key === 'rooms') ? full.rooms.attendedRooms : [],
            teacherProfile: visibleSections.some((s) => s.key === 'teacher') ? full.rooms.teacherProfile : undefined,
          }
        : {
            attendedRooms: [],
          },
      experiences: visibleSections.some((s) => s.key === 'experience') ? full.experiences : [],
      educationList: visibleSections.some((s) => s.key === 'education') ? full.educationList : [],
      achievementsList: visibleSections.some((s) => s.key === 'achievements') ? full.achievementsList : [],
      recordingsList: visibleSections.some((s) => s.key === 'recordings')
        ? full.recordingsList?.filter((r) => r.visibility === 'public')
        : [],
      scoresList: visibleSections.some((s) => s.key === 'scores')
        ? full.scoresList?.filter((s) => s.visibility === 'public')
        : [],
      projectsList: visibleSections.some((s) => s.key === 'projects') ? full.projectsList : [],
      connectionsList: visibleSections.some((s) => s.key === 'community') ? full.connectionsList : [],
    };

    return projected;
  }
}

export const unifiedProfileRepository = new PersistentUnifiedProfileRepository();
