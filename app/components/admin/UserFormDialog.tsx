// app/components/admin/UserFormDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserFormDialog = ({ isOpen, onClose, user = null, nodes = [] }) => {
  const isEditing = !!user;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implementar lógica de guardado
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del usuario existente.' 
              : 'Completa los datos para crear un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              defaultValue={user?.full_name}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.user_id}
              required
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select defaultValue={user?.role}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="professional">Profesional</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="laboratory">Laboratorio</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node">Centro/Nodo</Label>
            <Select defaultValue={user?.node_id}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un centro" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {nodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.display_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_level">Nivel de acceso</Label>
            <Select defaultValue={user?.access_level}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona nivel de acceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="readonly">Solo lectura</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;