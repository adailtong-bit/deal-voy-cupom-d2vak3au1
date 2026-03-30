import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { RefreshCw, Play, Bug } from 'lucide-react'

export function TestingSandboxTab() {
  const { triggerScan } = useCouponStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleTriggerCrawler = () => {
    setIsLoading(true)
    toast.info('Iniciando varredura de teste...')
    triggerScan('test-sandbox-source', 5)

    setTimeout(() => {
      setIsLoading(false)
      toast.success('Varredura de teste concluída')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sandbox de Testes</h3>
        <p className="text-sm text-muted-foreground">
          Ferramentas para simular eventos do sistema e testar integrações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="h-4 w-4" />
              Crawler Simulation
            </CardTitle>
            <CardDescription>
              Simulate the crawler finding new promotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTriggerCrawler}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rodando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Rodar Teste (5 Itens)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
