import { Course, CourseModule, Lesson, CourseLevel, UserCourseProgress } from '../domain/types';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';

export interface CourseRepository {
  listPublishedCourses(): Promise<Course[]>;
  findCourseById(id: string): Promise<Course | null>;
  findModulesByCourseId(courseId: string): Promise<CourseModule[]>;
  findLessonsByModuleId(moduleId: string): Promise<Lesson[]>;
  findLessonById(lessonId: string): Promise<Lesson | null>;
  getUserProgress(userId: string, courseId: string): Promise<UserCourseProgress | null>;
  saveUserProgress(progress: UserCourseProgress): Promise<UserCourseProgress>;
}

export class PersistentCourseRepository implements CourseRepository {
  private storage: StorageAdapter;
  private progressKey = 'user_course_progress';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  // Conteudo autoral da Academia. Nenhuma obra de referencia externa e
  // citada no produto — o material e escrito e revisado internamente.
  private readonly seedCourses: Course[] = [
    {
      id: 'crs_fomt_01',
      slug: 'fundamentos-teoria-musical-1',
      title: 'Fundamentos de Teoria Musical I: Notas, Escalas e Tríades',
      subtitle: 'Estruturação acústica das notas, oitavas, escalas maiores e tríades primárias.',
      description:
        'Curso formal dedicado à gramática fundamental da música ocidental. Aborda a física das alturas, oitavas, fórmula intervalar diatônica maior, modos e a hierarquia funcional das tríades tônicas, subdominantes e dominantes.',
      level: CourseLevel.FUNDAMENTAL,
      workloadHours: 12,
      authorId: 'usr_founder_1',
      authorName: 'Conservatório Muscicapa (Curadoria Pedagógica)',
      modulesCount: 2,
      lessonsCount: 4,
      isPublished: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'crs_fomt_02',
      slug: 'fundamentos-teoria-musical-2',
      title: 'Fundamentos de Teoria Musical II: Ritmo, Métrica e Forma',
      subtitle: 'Durações rítmicas, quiálteras, métrica, compassos e cadências harmônicas.',
      description:
        'Aprofundamento na dimensão temporal e na sintaxe harmônica: relações proporcionais de duração, ligaduras, compassos simples e compostos, anacruse e condução de cadências perfeitas e imperfeitas.',
      level: CourseLevel.FUNDAMENTAL,
      workloadHours: 14,
      authorId: 'usr_founder_1',
      authorName: 'Conservatório Muscicapa (Curadoria Pedagógica)',
      modulesCount: 2,
      lessonsCount: 4,
      isPublished: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  private readonly seedModules: CourseModule[] = [
    {
      id: 'mod_fomt_101',
      courseId: 'crs_fomt_01',
      order: 1,
      title: 'Módulo 1: A Natureza das Notas e o Conceito de Oitava',
      description: 'Definição de altura, notação literal e a duplicação periódica das frequências em oitavas.',
      lessonsCount: 2,
    },
    {
      id: 'mod_fomt_102',
      courseId: 'crs_fomt_01',
      order: 2,
      title: 'Módulo 2: Escalas Diatônicas e Tríades Primárias',
      description: 'Padrão intervalar Tom-Tom-Semitom e a formação dos graus I, IV e V.',
      lessonsCount: 2,
    },
  ];

  private readonly seedLessons: Lesson[] = [
    {
      id: 'les_fomt_101_1',
      moduleId: 'mod_fomt_101',
      courseId: 'crs_fomt_01',
      order: 1,
      title: 'Lição 1: Notas Musicais e Notação Alfabética',
      summary: 'Os sete nomes fundamentais das notas e a convenção internacional de alturas.',
      contentMarkdown: `# Notas Musicais e Alturas

A música ocidental organiza o espectro contínuo de frequências audíveis em pontos discretos chamados **alturas** (ou notas).

Historicamente e convencionalmente, utilizamos tanto a nomenclatura silábica (Dó, Ré, Mi, Fá, Sol, Lá, Si) quanto a notação alfabética internacional:
- C = Dó
- D = Ré
- E = Mi
- F = Fá
- G = Sol
- A = Lá (padrão de afinação A4 = 440 Hz)
- B = Si

Entre certas notas adjacentes existe uma distância de **tom inteiro**, enquanto entre Mi-Fá e Si-Dó a distância natural é de **meio-tom** (semitom).`,
      durationMinutes: 15,
    },
    {
      id: 'les_fomt_101_2',
      moduleId: 'mod_fomt_101',
      courseId: 'crs_fomt_01',
      order: 2,
      title: 'Lição 2: Oitavas e Equivalência Acústica',
      summary: 'A relação de proporção 2:1 e a identidade perceptiva da oitava.',
      contentMarkdown: `# Oitavas e Proporção 2:1

Quando uma corda vibrante é encurtada exatamente pela metade, a frequência de sua vibração duplica. 

Essa duplicação exata de frequência produz o intervalo de **Oitava**. O ouvido humano percebe notas separadas por uma oitava como tendo a mesma qualidade de altura essencial, motivo pelo qual recebem o mesmo nome de nota em registros diferentes (ex: C3, C4, C5).`,
      durationMinutes: 20,
    },
    {
      id: 'les_fomt_102_1',
      moduleId: 'mod_fomt_102',
      courseId: 'crs_fomt_01',
      order: 1,
      title: 'Lição 3: A Estrutura da Escala Maior Diatônica',
      summary: 'A fórmula matemática T - T - st - T - T - T - st que define a tonalidade maior.',
      contentMarkdown: `# A Escala Maior Diatônica

A escala maior é a fundação da harmonia funcional clássica e contemporânea. Ela é construída sobre uma sequência invariante de intervalos:
- Tom
- Tom
- Semitom
- Tom
- Tom
- Tom
- Semitom

A partir de C (Dó), nenhuma alteração acidental é necessária: C - D - E - F - G - A - B - C. Para iniciar a escala sobre qualquer outra nota tônica (como G ou F), sustenidos ou bemóis devem ser introduzidos para preservar essa mesma proporção.`,
      durationMinutes: 25,
    },
    {
      id: 'les_fomt_102_2',
      moduleId: 'mod_fomt_102',
      courseId: 'crs_fomt_01',
      order: 2,
      title: 'Lição 4: Tríades Primárias (Tônica, Subdominante e Dominante)',
      summary: 'Os pilares harmônicos fundamentais da tonalidade: I, IV e V.',
      contentMarkdown: `# As Tríades Primárias

Empilhando terças sobre os graus da escala diatônica maior, obtemos acordes de três notas (tríades).

Três dessas tríades formam a espinha dorsal da música tonal e contêm, juntas, todas as notas da escala:
- **Grau I (Tônica):** Centro de estabilidade e repouso.
- **Grau IV (Subdominante):** Movimento de expansão e tensão intermediária.
- **Grau V (Dominante):** Tensão máxima que exige resolução de volta à Tônica.`,
      durationMinutes: 30,
    },
  ];

  public async listPublishedCourses(): Promise<Course[]> {
    return this.seedCourses.filter((c) => c.isPublished);
  }

  public async findCourseById(id: string): Promise<Course | null> {
    return this.seedCourses.find((c) => c.id === id) || null;
  }

  public async findModulesByCourseId(courseId: string): Promise<CourseModule[]> {
    return this.seedModules
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  public async findLessonsByModuleId(moduleId: string): Promise<Lesson[]> {
    return this.seedLessons
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  public async findLessonById(lessonId: string): Promise<Lesson | null> {
    return this.seedLessons.find((l) => l.id === lessonId) || null;
  }

  public async getUserProgress(userId: string, courseId: string): Promise<UserCourseProgress | null> {
    const raw = await this.storage.getItem<Record<string, UserCourseProgress>>(this.progressKey);
    if (!raw) return null;
    return raw[`${userId}_${courseId}`] || null;
  }

  public async saveUserProgress(progress: UserCourseProgress): Promise<UserCourseProgress> {
    const raw = (await this.storage.getItem<Record<string, UserCourseProgress>>(this.progressKey)) || {};
    const key = `${progress.userId}_${progress.courseId}`;
    raw[key] = progress;
    await this.storage.setItem(this.progressKey, raw);
    return progress;
  }
}

export const courseRepository = new PersistentCourseRepository();
