import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TestingSandboxTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Testing Sandbox</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This sandbox environment is currently disabled or under
            construction. Check back later for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
