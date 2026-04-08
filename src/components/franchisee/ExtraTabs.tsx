import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, BarChart3, Settings, Box } from 'lucide-react'

export function CrawlerTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Crawler de Ofertas (Regional)
          </h2>
          <p className="text-muted-foreground">
            Acompanhe a captura automática de promoções locais.
          </p>
        </div>
        <Button>
          <Globe className="w-4 h-4 mr-2" /> Iniciar Varredura
        </Button>
      </div>
      <Card>
        <CardContent className="p-16 text-center text-slate-500 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Globe className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Monitoramento Ativo
          </h3>
          <p className="max-w-md">
            Seu crawler regional está ativo e monitorando 15 fontes de
            e-commerce e portais locais em busca de oportunidades.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function InsightsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Insights</h2>
          <p className="text-muted-foreground">
            Análises de comportamento e performance.
          </p>
        </div>
        <Button>
          <BarChart3 className="w-4 h-4 mr-2" /> Exportar Relatório
        </Button>
      </div>
      <Card>
        <CardContent className="p-16 text-center text-slate-500 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <BarChart3 className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Relatórios Gerados
          </h3>
          <p className="max-w-md">
            Os dashboards de inteligência avançada estão sendo processados com
            os dados do mês atual. Você receberá uma notificação quando
            finalizado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function SandboxTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Testing Sandbox</h2>
          <p className="text-muted-foreground">
            Ambiente seguro para testes de integração.
          </p>
        </div>
        <Button variant="outline">
          <Box className="w-4 h-4 mr-2" /> Resetar Ambiente
        </Button>
      </div>
      <Card>
        <CardContent className="p-16 text-center text-slate-500 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
            <Box className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Modo Desenvolvedor
          </h3>
          <p className="max-w-md">
            Ambiente de testes ativo. Nenhuma transação real ou disparo de push
            notification será processado a partir desta interface de testes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Configurações da Franquia
          </h2>
          <p className="text-muted-foreground">
            Ajustes gerais do seu painel regional.
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </div>
      <Card>
        <CardContent className="p-16 text-center text-slate-500 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <Settings className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Preferências Regionais
          </h3>
          <p className="max-w-md">
            Opções de personalização, integrações com sistemas externos de nota
            fiscal e gerenciamento de perfis avançados da unidade.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
