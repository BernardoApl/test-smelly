const { UserService } = require('../src/userService');

const usuarioValido = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Suite de Testes Limpos', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('cria um usuario valido com status ativo', () => {
    const usuarioCriado = userService.createUser(
      usuarioValido.nome,
      usuarioValido.email,
      usuarioValido.idade
    );

    expect(usuarioCriado).toMatchObject({
      nome: usuarioValido.nome,
      email: usuarioValido.email,
      idade: usuarioValido.idade,
      isAdmin: false,
      status: 'ativo',
    });
    expect(usuarioCriado.id).toEqual(expect.any(String));
    expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
  });

  test('busca um usuario existente pelo id', () => {
    const usuarioCriado = userService.createUser(
      usuarioValido.nome,
      usuarioValido.email,
      usuarioValido.idade
    );

    const usuarioBuscado = userService.getUserById(usuarioCriado.id);

    expect(usuarioBuscado).toEqual(usuarioCriado);
  });

  test('retorna null ao buscar usuario inexistente', () => {
    const usuarioBuscado = userService.getUserById('id-inexistente');

    expect(usuarioBuscado).toBeNull();
  });

  test('desativa um usuario comum', () => {
    const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

    const resultado = userService.deactivateUser(usuarioComum.id);
    const usuarioAtualizado = userService.getUserById(usuarioComum.id);

    expect(resultado).toBe(true);
    expect(usuarioAtualizado.status).toBe('inativo');
  });

  test('nao desativa um usuario administrador', () => {
    const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    const resultado = userService.deactivateUser(usuarioAdmin.id);
    const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);

    expect(resultado).toBe(false);
    expect(usuarioAtualizado.status).toBe('ativo');
  });

  test('retorna false ao tentar desativar usuario inexistente', () => {
    const resultado = userService.deactivateUser('id-inexistente');

    expect(resultado).toBe(false);
  });

  test('lanca erro ao criar usuario menor de idade', () => {
    expect(() => {
      userService.createUser('Menor', 'menor@email.com', 17);
    }).toThrow('maior de idade');
  });

  test('lanca erro quando dados obrigatorios nao sao informados', () => {
    expect(() => {
      userService.createUser('', usuarioValido.email, usuarioValido.idade);
    }).toThrow('Nome, email e idade');
  });

  test('gera relatorio informando ausencia de usuarios', () => {
    const relatorio = userService.generateUserReport();

    expect(relatorio).toContain('---');
    expect(relatorio).toContain('Nenhum');
    expect(relatorio).toContain('cadastrado');
  });

  test('gera relatorio contendo usuarios cadastrados', () => {
    userService.createUser('Alice', 'alice@email.com', 28);
    userService.createUser('Bob', 'bob@email.com', 32);

    const relatorio = userService.generateUserReport();

    expect(relatorio).toContain('Nome: Alice');
    expect(relatorio).toContain('Nome: Bob');
    expect(relatorio).toContain('Status: ativo');
  });
});
