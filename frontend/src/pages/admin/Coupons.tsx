import { useEffect, useState } from 'react';
import { couponService, Coupon } from '@/services/coupon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Power, Tag, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
  });

  const fetchCoupons = async () => {
    try {
      const data = await couponService.getAll();
      setCoupons(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponService.create({
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: true,
      } as any);
      
      toast.success('Coupon created successfully');
      setIsCreating(false);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
      });
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await couponService.delete(id);
      toast.success('Coupon deleted');
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await couponService.toggleStatus(id);
      setCoupons(coupons.map(c => c.id === id ? updated : c));
      toast.success('Coupon status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-sans">Coupons & Offers</h1>
          <p className="mt-1 text-neutral-500 font-medium">Create promotional discounts for customers.</p>
        </div>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2 shadow-lg shadow-primary/25 rounded-full px-6 h-12"
        >
          <Plus className={`h-5 w-5 transition-transform duration-300 ${isCreating ? 'rotate-45' : ''}`} />
          {isCreating ? 'Close' : 'Create Coupon'}
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[2rem] shadow-sm border border-neutral-200 dark:border-zinc-800/50 animate-in slide-in-from-top-4">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Coupon Code</label>
              <Input
                required
                placeholder="e.g. SUMMER2025"
                className="h-12 rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border font-bold text-center tracking-widest uppercase"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Discount Type</label>
              <Select
                value={formData.discountType}
                onValueChange={val => setFormData({ ...formData, discountType: val })}
              >
                <SelectTrigger className="h-12 rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl">
                  <SelectItem value="PERCENTAGE" className="font-semibold">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED" className="font-semibold">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Discount Value</label>
              <Input
                required
                type="number"
                placeholder="e.g. 20"
                className="h-12 rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border"
                value={formData.discountValue}
                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Min Order Value</label>
              <Input
                type="number"
                placeholder="Optional"
                className="h-12 rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border"
                value={formData.minOrderValue}
                onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Start Date</label>
              <Input
                required
                type="datetime-local"
                className="h-12 rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">End Date</label>
              <Input
                required
                type="datetime-local"
                className="h-12 rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="col-span-full pt-4">
              <Button type="submit" className="w-full h-12 rounded-full font-bold text-md">Publish Coupon</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/50 dark:bg-zinc-900/30 border-b border-neutral-200 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5 font-bold tracking-wider">Code</th>
                <th className="px-6 py-5 font-bold tracking-wider">Discount</th>
                <th className="px-6 py-5 font-bold tracking-wider">Status</th>
                <th className="px-6 py-5 font-bold tracking-wider">Usage</th>
                <th className="px-6 py-5 font-bold tracking-wider">Expiry</th>
                <th className="px-8 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 font-medium">Loading...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 font-medium">
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-black text-primary tracking-widest">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base text-black dark:text-white">
                          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                        </span>
                        {coupon.minOrderValue && <span className="text-xs text-neutral-500 font-medium">Min: ${coupon.minOrderValue}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        coupon.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-500/10 text-neutral-500'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-neutral-600 dark:text-neutral-400">
                      {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ' / ∞'}
                    </td>
                    <td className="px-6 py-5 font-medium text-neutral-600 dark:text-neutral-400">
                      {format(new Date(coupon.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`rounded-xl ${coupon.isActive ? 'text-neutral-400 hover:text-orange-500 hover:bg-orange-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                          onClick={() => handleToggleStatus(coupon.id)}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-xl text-red-500 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDelete(coupon.id)}
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

export default AdminCoupons;
