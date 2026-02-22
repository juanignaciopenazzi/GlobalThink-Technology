import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RequestUser } from 'src/auth/interfaces/request-user.interface';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // POST
  @ApiOperation({ summary: 'Crear un nuevo usuario.' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET
  @ApiOperation({ summary: 'Obtener todos los usuarios.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (Por defecto: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros por página (Por defecto: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filtro por texto (busca coincidencias en el email)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Ordenamiento por fecha de creación (asc o desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida correctamente.',
  })
  @Get()
  findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      sort?: string;
      search?: string;
    },
  ) {
    return this.usersService.findAll(query);
  }

  // GET /users/:id
  @ApiOperation({ summary: 'Obtener un usuario por ID.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', type: String, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 400, description: 'Formato de ID inválido.' })
  @ApiResponse({ status: 403, description: 'Requiere permisos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) {
      throw new ForbiddenException(
        'No tienes permisos para ver el perfil de otro usuario',
      );
    }
    return this.usersService.findOne(id);
  }

  // PATCH /users/:id
  @ApiOperation({ summary: 'Actualizar un usuario.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', type: String, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Requiere permisos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: RequestUser },
  ) {
    if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) {
      throw new ForbiddenException(
        'No tienes permisos para modificar a otro usuario',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id
  @ApiOperation({ summary: 'Eliminar un usuario.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del usuario a eliminar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado lógicamente (deletedAt actualizado).',
  })
  @ApiResponse({ status: 403, description: 'Requiere permisos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar a otro usuario',
      );
    }
    return this.usersService.delete(id);
  }
}
