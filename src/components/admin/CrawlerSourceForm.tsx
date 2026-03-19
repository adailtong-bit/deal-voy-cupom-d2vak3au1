import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { REGIONS } from '@/lib/data'
import { CrawlerSource } from '@/lib/types'

interface CrawlerSourceFormProps {
  initialData?: CrawlerSource | null
  onSave: (data: Omit<CrawlerSource, 'id' | 'status' | 'lastScan'>) => void
  userRegion: string
  isFranchisee: boolean
}

export function CrawlerSourceForm({
  initialData,
  onSave,
  userRegion,
  isFranchisee,
}: CrawlerSourceFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'web',
    region: userRegion || 'Global',
    scanRadius: 50,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        url: initialData.url,
        type: initialData.type,
        region: initialData.region,
        scanRadius: initialData.scanRadius,
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      url: formData.url,
      type: formData.type as 'web' | 'api' | 'app',
      region: formData.region,
      scanRadius: formData.scanRadius,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Source Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g. Local City Deals"
        />
      </div>
      <div className="space-y-2">
        <Label>URL / Endpoint</Label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
          placeholder="https://"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Website Scraper</SelectItem>
              <SelectItem value="api">JSON API</SelectItem>
              <SelectItem value="app">Mobile App Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Region</Label>
          <Select
            disabled={isFranchisee}
            value={formData.region}
            onValueChange={(v) => setFormData({ ...formData, region: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Scan Radius (km)</Label>
        <Input
          type="number"
          value={formData.scanRadius}
          onChange={(e) =>
            setFormData({
              ...formData,
              scanRadius: Number(e.target.value),
            })
          }
          min={1}
        />
      </div>
      <DialogFooter>
        <Button type="submit">Save Configuration</Button>
      </DialogFooter>
    </form>
  )
}
