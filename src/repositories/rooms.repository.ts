import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { TeacherRoomDetail, ModalidadeDeSala } from '../domain/teacher';

/**
 * Salas de aula.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * O recurso de salas era fachada inteira. `CreateRoomScreen` recebia o
 * formulário, esperava 400 milissegundos com `setTimeout`, escrevia
 * "Registrando sala…" e navegava de volta — sem gravar nada em lugar nenhum.
 * `RoomsDirectoryScreen`, do outro lado, listava três salas escritas no
 * código, com professores inventados e contagem de alunos inventada.
 *
 * O professor que criasse uma sala voltava para um diretório onde ela não
 * estava, entre turmas que não existem. Nada disso é defeito de dado: é o
 * recurso não existir e a tela dizer que existe.
 *
 * Aqui ele existe. Nasce vazio, porque o Conservatório ainda não tem turma —
 * e vazio é o que o diretório mostra até a primeira sala ser criada.
 */
export interface RoomsRepository {
  listar(): Promise<TeacherRoomDetail[]>;
  doProfessor(teacherId: string): Promise<TeacherRoomDetail[]>;
  porId(id: string): Promise<TeacherRoomDetail | null>;
  salvar(sala: TeacherRoomDetail): Promise<TeacherRoomDetail>;
  remover(id: string): Promise<void>;
}

export class PersistentRoomsRepository implements RoomsRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVE = 'amd_rooms_v1';

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private todas(): TeacherRoomDetail[] {
    return this.storage.get<TeacherRoomDetail[]>(this.CHAVE) ?? [];
  }

  public async listar(): Promise<TeacherRoomDetail[]> {
    return this.todas().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * As salas de um professor.
   *
   * "Minhas turmas" no diretório precisa desta consulta; sem ela o filtro
   * teria de acontecer na tela, e filtro em tela é filtro que a próxima tela
   * esquece de fazer.
   */
  public async doProfessor(teacherId: string): Promise<TeacherRoomDetail[]> {
    return (await this.listar()).filter((s) => s.teacherId === teacherId);
  }

  public async porId(id: string): Promise<TeacherRoomDetail | null> {
    return this.todas().find((s) => s.id === id || s.slug === id) ?? null;
  }

  public async salvar(sala: TeacherRoomDetail): Promise<TeacherRoomDetail> {
    const atuais = this.todas();
    const i = atuais.findIndex((s) => s.id === sala.id);
    if (i >= 0) atuais[i] = sala;
    else atuais.push(sala);
    this.storage.set(this.CHAVE, atuais);
    return sala;
  }

  public async remover(id: string): Promise<void> {
    this.storage.set(
      this.CHAVE,
      this.todas().filter((s) => s.id !== id)
    );
  }
}

/**
 * Identificador legível derivado do nome.
 *
 * A sala aparece na barra de endereços, e `/rooms/catedra-bach-fuga` diz ao
 * aluno onde ele está de um jeito que `/rooms/a7f3b1` não diz. O sufixo curto
 * evita que duas salas de mesmo nome colidam.
 */
export function slugDaSala(nome: string): string {
  const base = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const sufixo = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${sufixo}` : `sala-${sufixo}`;
}

export interface DadosDaNovaSala {
  nome: string;
  modalidade: ModalidadeDeSala;
  capacidade: number;
  ementa: string;
  teacherId: string;
  teacherName: string;
}

/**
 * Monta uma sala válida a partir do que o formulário coleta.
 *
 * Os contadores nascem em zero e não são inventados: a sala recém-criada tem
 * zero alunos e zero tarefas, porque é isso que ela tem.
 */
export function criarSala(dados: DadosDaNovaSala): TeacherRoomDetail {
  const agora = new Date().toISOString();
  const slug = slugDaSala(dados.nome);
  return {
    id: `room_${slug}`,
    teacherId: dados.teacherId,
    teacherName: dados.teacherName,
    name: dados.nome.trim(),
    slug,
    modalidade: dados.modalidade,
    capacidade: dados.capacidade,
    description: dados.ementa.trim(),
    welcomeMessage: '',
    announcements: [],
    activeAssignmentCount: 0,
    studentCount: 0,
    createdAt: agora,
    updatedAt: agora,
  };
}

export const roomsRepository: RoomsRepository = new PersistentRoomsRepository();
