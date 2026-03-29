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

export function AdminNotificationsTab() {
  const { franchises } = useCouponStore()
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Weekend Sale!',
      message: 'Check out the new offers.',
      target: 'all',
      status: 'sent',
      date: '2025-10-10T10:00',
    },
    {
      id: '2',
      title: 'New Stores in NY',
      message: 'Discover Brooklyn Coffee.',
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
      return toast.error('Title and message are required')
    if (notifications.some((n) => n.id === formData.id)) {
      setNotifications(
        notifications.map((n) => (n.id === formData.id ? formData : n)),
      )
      toast.success('Notification updated')
    } else {
      setNotifications([...notifications, formData])
      toast.success('Notification created')
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
    toast.success('Notification deleted')
  }

  const handleSend = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, status: 'sent' } : n)),
    )
    toast.success('Notification triggered successfully!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Push Notifications
          </h2>
          <p className="text-muted-foreground">
            Manage and schedule push notifications for users.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Create Notification
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Notifications</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Target Group</TableHead>
                  <TableHead>Schedule Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>
                      {n.target === 'all'
                        ? 'All Users'
                        : franchises.find((f) => f.id === n.target)?.name ||
                          n.target}
                    </TableCell>
                    <TableCell>{new Date(n.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${n.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {n.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {n.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSend(n.id)}
                          >
                            <Send className="w-4 h-4 mr-2" /> Send Now
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
                      No notifications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData?.id && notifications.some((n) => n.id === formData.id)
                ? 'Edit Notification'
                : 'New Notification'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notification Title</Label>
              <Input
                value={formData?.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Weekend Special!"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Input
                value={formData?.message || ''}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Write your message here..."
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={formData?.target || 'all'}
                onValueChange={(v) => setFormData({ ...formData, target: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Schedule Time</Label>
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
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
