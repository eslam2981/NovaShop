import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userService, User } from '@/services/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Edit2, Trash2, X, Shield, User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '@/lib/animations';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

type ModalMode = 'create' | 'edit';

const buildSchema = (mode: ModalMode) =>
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    role: z.enum(['USER', 'ADMIN', 'OWNER']),
    password:
      mode === 'create'
        ? z.string().min(6, 'Password must be at least 6 characters')
        : z.union([z.string().min(6, 'Min 6 characters'), z.literal('')]),
  });

type UserFormValues = z.infer<ReturnType<typeof buildSchema>>;

function UserModalForm({
  mode,
  initialUser,
  onClose,
  onDone,
}: {
  mode: ModalMode;
  initialUser: User | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const schema = useMemo(() => buildSchema(mode), [mode]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'create'
        ? { name: '', email: '', role: 'USER', password: '' }
        : {
            name: initialUser?.name ?? '',
            email: initialUser?.email ?? '',
            role: initialUser?.role === 'ADMIN' ? 'ADMIN' : initialUser?.role === 'OWNER' ? 'OWNER' : 'USER',
            password: '',
          },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (mode === 'create') {
        await userService.create({
          name: data.name,
          email: data.email,
          password: data.password as string,
          role: data.role,
        });
        toast.success('User created successfully');
      } else if (initialUser) {
        const payload: {
          name: string;
          email: string;
          role: 'USER' | 'ADMIN' | 'OWNER';
          password?: string;
        } = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if (data.password && String(data.password).length > 0) {
          payload.password = data.password as string;
        }
        await userService.update(initialUser.id, payload);
        toast.success('User updated — role and details saved');
      }
      onDone();
    } catch (err: unknown) {
      let msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      if (typeof msg === 'string') {
        msg = msg.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').trim();
      }
      toast.error(msg || 'Request failed');
    }
  };

  return (
    <>
      <div className="border-b border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">{mode === 'create' ? 'Create user' : 'Edit user'}</h2>
            <p className="text-xs text-neutral-500 font-medium">
              {mode === 'create'
                ? 'New account with password and role.'
                : 'Update profile, switch admin ↔ user, or set a new password.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full shadow-sm bg-white dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            Name
          </label>
          <Input {...register('name')} className="h-11 rounded-xl border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            Email
          </label>
          <Input
            type="email"
            {...register('email')}
            className="h-11 rounded-xl border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-2 flex justify-between items-center text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            <span>Role</span>
            {useAuthStore.getState().user?.role !== 'OWNER' && (
              <span className="text-xs text-amber-500 flex items-center gap-1"><Shield className="w-3 h-3"/> Owner access required to edit</span>
            )}
          </label>
          <select
            {...register('role')}
            disabled={useAuthStore.getState().user?.role !== 'OWNER'}
            className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
          {errors.role && <p className="mt-1 text-xs text-red-500 font-bold">{errors.role.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            {mode === 'create' ? 'Password' : 'New password (optional)'}
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            {...register('password')}
            placeholder={mode === 'edit' ? 'Leave empty to keep current' : ''}
            className="h-11 rounded-xl border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password.message}</p>}
        </div>
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting} className="h-12 flex-1 rounded-full font-bold text-md">
            {mode === 'create' ? 'Create Account' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-full px-8 font-bold border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-900" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}

const AdminUsers = () => {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (currentUser?.role !== 'OWNER') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setModalMode('edit');
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async (id: string) => {
    if (currentUser?.id === id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!confirm('Delete this user permanently?')) return;
    try {
      await userService.delete(id);
      toast.success('User removed');
      fetchUsers();
    } catch (err: unknown) {
      let msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      if (typeof msg === 'string') {
        msg = msg.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').trim();
      }
      toast.error(msg || 'Delete failed');
    }
  };

  const modalKey = modalMode === 'create' ? 'create' : `edit-${editingUser?.id ?? ''}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-sans">Users</h1>
          <p className="mt-1 text-neutral-500 font-medium">
            Create accounts, assign admin or user role, and manage access.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 shadow-lg shadow-primary/25 rounded-full px-6 h-12"
        >
          <UserPlus className="h-5 w-5" />
          Add User
        </Button>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              aria-label="Close"
              onClick={closeModal}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl"
            >
              <UserModalForm
                key={modalKey}
                mode={modalMode}
                initialUser={editingUser}
                onClose={closeModal}
                onDone={() => {
                  closeModal();
                  fetchUsers();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/50 dark:bg-zinc-900/30 border-b border-neutral-200 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5 font-bold tracking-wider">User</th>
                <th className="px-6 py-5 font-bold tracking-wider">Email</th>
                <th className="px-6 py-5 font-bold tracking-wider">Role</th>
                <th className="px-6 py-5 font-bold tracking-wider">Orders</th>
                <th className="px-6 py-5 font-bold tracking-wider">Joined</th>
                <th className="px-8 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 font-medium">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 font-medium">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-zinc-900/50 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary border border-primary/10">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-base text-black dark:text-white truncate max-w-[200px]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-medium truncate max-w-[200px]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          user.role === 'OWNER'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {user.role === 'OWNER' ? (
                          <Shield className="h-3.5 w-3.5 fill-amber-500/20" />
                        ) : user.role === 'ADMIN' ? (
                          <Shield className="h-3.5 w-3.5" />
                        ) : (
                          <UserIcon className="h-3.5 w-3.5" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-medium">{user.orderCount ?? 0}</td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-neutral-200 dark:hover:bg-zinc-800 text-neutral-500"
                          onClick={() => openEdit(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                          onClick={() => handleDelete(user.id)}
                          disabled={currentUser?.id === user.id || (user.role === 'OWNER' && currentUser?.role !== 'OWNER')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
