import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { User } from './schemas/user.schema';
import { Profile } from './schemas/profile.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  // CREAR USUARIO
  async create(createUserDto: CreateUserDto) {
    const { email, password, role, firstName, secondName, lastName, phone } =
      createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('El mail ya está en uso');
    }

    // bcrypt para hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newProfile = new this.profileModel({
      firstName,
      secondName,
      lastName,
      phone,
    });
    const savedProfile = await newProfile.save();

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      role,
      profile: savedProfile._id,
    });

    return await newUser.save();
  }

  // OBTENER TODOS => PAGINADO | ORDENAMIENTO Y FILTRO POR TEXTO(QUERY)
  async findAll(query: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, sort = 'desc', search } = query;

    const filter: QueryFilter<User> = { deletedAt: null };

    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await this.userModel
      .find(filter)
      .populate('profile', '-__v')
      .select('-password -__v')
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .exec();

    const total = await this.userModel.countDocuments(filter);

    return {
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  // OBTENER POR ID
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Formato de ID inválido');
    }

    const user = await this.userModel
      .findOne({ _id: id, deletedAt: null })
      .populate('profile', '-__v')
      .select('-password -__v')
      .exec();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  // ACTUALIZAR (PATCH)
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const { email, password, role, ...profileData } = updateUserDto;

    if (Object.keys(profileData).length > 0) {
      await this.profileModel.findByIdAndUpdate(user.profile, profileData, {
        new: true, // Devuelve el documento actualizado
      });
    }

    const userUpdates: UpdateQuery<User> = {};
    if (email) userUpdates.email = email;
    if (password) userUpdates.password = password; // TODO: hashear
    if (role) userUpdates.role = role;

    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(id, userUpdates);
    }

    return this.findOne(id);
  }

  // ELIMINAR (Baja lógica)
  async delete(id: string) {
    const user = await this.findOne(id); // Validamos que exista

    // Hacemos el soft delete marcando la fecha actual
    user.deletedAt = new Date();
    await user.save();

    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }

  // MÉTODO INTERNO PARA EL AUTH SERVICE
  async findByEmail(email: string) {
    return this.userModel.findOne({ email, deletedAt: null }).exec();
  }
}
