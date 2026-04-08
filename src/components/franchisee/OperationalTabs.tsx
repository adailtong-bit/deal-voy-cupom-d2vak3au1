import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Calendar,
  Tag,
  Shield,
  LayoutGrid,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function SeasonalTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ofertas Sazonais
          </h2>
          <p className="text-muted-foreground">
            Gerencie campanhas de datas comemorativas.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha
        </Button>
      </div>
      <div className="grid gap-4">
        {[
          {
            name: 'Black Friday 2024',
            status: 'Ativo',
            start: '01/11/2024',
            end: '30/11/2024',
            merchants: 45,
          },
          {
            name: 'Natal Antecipado',
            status: 'Agendado',
            start: '01/12/2024',
            end: '25/12/2024',
            merchants: 12,
          },
          {
            name: 'Dia das Mães',
            status: 'Concluído',
            start: '01/05/2024',
            end: '12/05/2024',
            merchants: 38,
          },
        ].map((campaign, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Período: {campaign.start} a {campaign.end}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center hidden sm:block">
                  <p className="text-xl font-bold text-slate-800">
                    {campaign.merchants}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Adesões
                  </p>
                </div>
                <Badge
                  variant={
                    campaign.status === 'Ativo' ? 'default' : 'secondary'
                  }
                  className="px-3"
                >
                  {campaign.status}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function CategoriesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <p className="text-muted-foreground">
            Personalize as categorias em destaque na sua região.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          'Gastronomia',
          'Beleza & Estética',
          'Moda',
          'Serviços',
          'Saúde',
          'Educação',
          'Entretenimento',
          'Pet Shop',
        ].map((cat, i) => (
          <Card
            key={i}
            className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <LayoutGrid className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="font-medium text-slate-700 group-hover:text-primary">
                {cat}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function InterestsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tags de Interesses
          </h2>
          <p className="text-muted-foreground">
            Mapeamento de preferências dos consumidores locais.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nova Tag
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {[
              'Comida Vegana',
              'Música Ao Vivo',
              'Pet Friendly',
              'Artesanal',
              'Ao Ar Livre',
              'Desconto Estudante',
              'Gourmet',
              'Fitness',
              'Happy Hour',
            ].map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
              >
                <Tag className="w-3 h-3 mr-2 inline opacity-70" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function PoliciesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Políticas de Parceiros
        </h2>
        <p className="text-muted-foreground">
          Documentação, termos e regras regionais.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" /> Termos de Uso Lojista
            </CardTitle>
            <CardDescription>Última atualização: 10/08/2023</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-6">
              Regras de conduta, penalidades e obrigações para lojistas
              associados na sua região de cobertura.
            </p>
            <Button variant="outline" className="w-full">
              Editar Documento
            </Button>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-slate-400" /> Política de
              Qualidade
            </CardTitle>
            <CardDescription>Última atualização: 15/09/2023</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-6">
              Critérios mínimos de atendimento e resolução de disputas com
              clientes finais dentro do aplicativo.
            </p>
            <Button variant="outline" className="w-full">
              Editar Documento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
