import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit2, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminNotificationsTab() {
  const { franchises } = useCouponStore()
  const { t } = useLanguage()

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: t('admin.notifications.mock.title1', 'Weekend Sale!'),
      message: t('admin.notifications.mock.msg1', 'Check out the new offers.'),
      target: 'all',
      status: 'sent',
      date: '2025-10-10T10:00',
    },
    {
      id: '2',
      title: t('admin.notifications.mock.title2', 'New Stores in NY'),
      message: t('admin.notifications.mock.msg2', 'Discover Brooklyn Coffee.'),
      target: 'f_ny',
      status: 'scheduled',
      date: '2025-11-01T09:00',
    },
  ])
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  const filtered = notifications.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()),
  )

  const handleOpen = (notif?: any) => {
    if (notif) setFormData(notif)
    else
      setFormData({
        id: Math.random().toString(),
        title: '',
        message: '',
        target: 'all',
        status: 'scheduled',
        date: new Date().toISOString().slice(0, 16),
      })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.message)
      return toast.error(
        t(
          'admin.notifications.toast.required',
          'Title and message are required',
        ),
      )

    if (notifications.some((n) => n.id === formData.id)) {
      setNotifications(
        notifications.map((n) => (n.id === formData.id ? formData : n)),
      )
      toast.success(
        t('admin.notifications.toast.updated', 'Notification updated'),
      )
    } else {
      setNotifications([...notifications, formData])
      toast.success(
        t('admin.notifications.toast.created', 'Notification created'),
      )
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
    toast.success(
      t('admin.notifications.toast.deleted', 'Notification deleted'),
    )
  }

  const handleSend = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, status: 'sent' } : n)),
    )
    toast.success(
      t(
        'admin.notifications.toast.sent',
        'Notification triggered successfully!',
      ),
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('admin.notifications.title', 'Push Notifications')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'admin.notifications.desc',
              'Manage and schedule push notifications for users.',
            )}
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" />{' '}
          {t('admin.notifications.create', 'Create Notification')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>
              {t('admin.notifications.all', 'All Notifications')}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(
                  'admin.notifications.search_placeholder',
                  'Search notifications...',
                )}
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    {t('admin.notifications.table.title', 'Title')}
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    {t('admin.notifications.table.target', 'Target Group')}
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    {t('admin.notifications.table.date', 'Schedule Date')}
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    {t('admin.notifications.table.status', 'Status')}
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    {t('admin.notifications.table.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>
                      {n.target === 'all'
                        ? t('admin.notifications.all_users', 'All Users')
                        : franchises.find((f) => f.id === n.target)?.name ||
                          n.target}
                    </TableCell>
                    <TableCell>{new Date(n.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${n.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {n.status === 'sent'
                          ? t('admin.notifications.status_sent', 'SENT')
                          : t(
                              'admin.notifications.status_scheduled',
                              'SCHEDULED',
                            )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {n.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSend(n.id)}
                            className="whitespace-nowrap"
                          >
                            <Send className="w-4 h-4 mr-2" />{' '}
                            {t('admin.notifications.send_now', 'Send Now')}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(n)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(n.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      {t(
                        'admin.notifications.no_results',
                        'No notifications found.',
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formData?.id && notifications.some((n) => n.id === formData.id)
                ? t('admin.notifications.edit', 'Edit Notification')
                : t('admin.notifications.new', 'New Notification')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {t('admin.notifications.form.title', 'Notification Title')}
              </Label>
              <Input
                value={formData?.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder={t(
                  'admin.notifications.form.title_ph',
                  'e.g., Weekend Special!',
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.notifications.form.message', 'Message')}</Label>
              <Input
                value={formData?.message || ''}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder={t(
                  'admin.notifications.form.message_ph',
                  'Write your message here...',
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.notifications.form.target', 'Target Audience')}
              </Label>
              <Select
                value={formData?.target || 'all'}
                onValueChange={(v) => setFormData({ ...formData, target: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('admin.notifications.form.all_users', 'All Users')}
                  </SelectItem>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.notifications.form.date', 'Schedule Time')}
              </Label>
              <Input
                type="datetime-local"
                value={formData?.date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.notifications.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave}>
              {t('admin.notifications.save', 'Save Notification')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
