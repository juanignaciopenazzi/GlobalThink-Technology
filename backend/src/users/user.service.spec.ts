import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Profile } from './schemas/profile.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// 1. Mockeamos bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  // Mock chainable para los métodos complejos encadenados de Mongoose (.find().populate().exec())
  const mockChainable = {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockUserModel = jest.fn().mockImplementation((dto: Partial<CreateUserDto>) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), ...dto }),
  }));

  Object.assign(mockUserModel, {
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  });

  const mockProfileModel = jest.fn().mockImplementation((dto: unknown) => ({
    ...(dto as object),
    save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), ...(dto as object) }),
  }));

  Object.assign(mockProfileModel, {
    findByIdAndUpdate: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Profile.name), useValue: mockProfileModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // -----------------------------------------------------------------
  // TEST: CREATE
  // -----------------------------------------------------------------
  describe('create', () => {
    it('debería lanzar BadRequestException si el email ya existe', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(true);

      const dto: CreateUserDto = { email: 'test@test.com', password: '123', role: 'user', firstName: 'Nacho', lastName: 'Test', secondName: '', phone: '12345678' };
      
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('debería crear el perfil y el usuario', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');

      const dto: CreateUserDto = { email: 'new@test.com', password: '123', role: 'user', firstName: 'Nacho', lastName: 'Test', secondName: '', phone: '12345678' };
      
      const result = await service.create(dto);
      expect(result.password).toEqual('hashed123');
      expect(result.email).toEqual(dto.email);
    });
  });

  // -----------------------------------------------------------------
  // TEST: FIND ALL
  // -----------------------------------------------------------------
  describe('findAll', () => {
    it('debería retornar usuarios paginados y filtrados', async () => {
      // Conectamos el find() al mock chainable que armamos arriba
      mockUserModel.find.mockReturnValue(mockChainable);
      mockChainable.exec.mockResolvedValueOnce([{ email: 'test@test.com' }]);
      mockUserModel.countDocuments.mockResolvedValueOnce(1);

      const result = await service.findAll({ page: 1, limit: 10, search: 'test', sort: 'asc' });

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(mockUserModel.find).toHaveBeenCalled();
      expect(mockChainable.populate).toHaveBeenCalledWith('profile', '-__v');
    });
  });

  // -----------------------------------------------------------------
  // TEST: FIND ONE
  // -----------------------------------------------------------------
  describe('findOne', () => {
    it('debería lanzar BadRequestException si el ID es inválido', async () => {
      await expect(service.findOne('invalido')).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      const validId = new Types.ObjectId().toHexString();
      mockUserModel.findOne.mockReturnValue(mockChainable);
      mockChainable.exec.mockResolvedValueOnce(null); // Simulamos que Mongoose devuelve null

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });

    it('debería retornar el usuario si lo encuentra', async () => {
      const validId = new Types.ObjectId().toHexString();
      const mockUser = { _id: validId, email: 'test@test.com' };
      
      mockUserModel.findOne.mockReturnValue(mockChainable);
      mockChainable.exec.mockResolvedValueOnce(mockUser);

      const result = await service.findOne(validId);
      expect(result).toEqual(mockUser);
    });
  });

  // -----------------------------------------------------------------
  // TEST: UPDATE
  // -----------------------------------------------------------------
  describe('update', () => {
    it('debería actualizar el usuario y el perfil separando los datos', async () => {
      const validId = new Types.ObjectId().toHexString();
      const mockUser = { _id: validId, profile: 'profileId' };
      
      // Magia pura: Espiamos el método findOne para no repetir lógica ni mocks
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as any);

      const updateDto: UpdateUserDto = { email: 'nuevo@test.com', firstName: 'Nacho Nuevo' };
      
      await service.update(validId, updateDto);

      // Verificamos que haya llamado a actualizar el Perfil con el nombre
      expect(mockProfileModel.findByIdAndUpdate).toHaveBeenCalledWith('profileId', { firstName: 'Nacho Nuevo' }, { new: true });
      // Verificamos que haya llamado a actualizar el Usuario con el email
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(validId, { email: 'nuevo@test.com' });
    });
  });

  // -----------------------------------------------------------------
  // TEST: DELETE (SOFT DELETE)
  // -----------------------------------------------------------------
  describe('delete', () => {
    it('debería hacer un soft delete asignando la fecha actual', async () => {
      const validId = new Types.ObjectId().toHexString();
      const mockUser = {
        _id: validId,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockUser as any);

      const result = await service.delete(validId);

      // Verificamos que la fecha ya no sea null
      expect(mockUser.deletedAt).not.toBeNull();
      // Verificamos que se haya guardado el cambio
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toEqual(`Usuario con ID ${validId} eliminado correctamente`);
    });
  });

  // -----------------------------------------------------------------
  // TEST: FIND BY EMAIL (Auth interno)
  // -----------------------------------------------------------------
  describe('findByEmail', () => {
    it('debería buscar un usuario activo por email', async () => {
      mockUserModel.findOne.mockReturnValue(mockChainable);
      mockChainable.exec.mockResolvedValueOnce({ email: 'test@test.com' });

      await service.findByEmail('test@test.com');
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com', deletedAt: null });
    });
  });
});