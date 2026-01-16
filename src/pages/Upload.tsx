import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { UploadCloud, Camera, CheckCircle2 } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { CATEGORIES } from '@/lib/data'
import { toast } from 'sonner'

export default function Upload() {
  const navigate = useNavigate()
  const { addCoupon } = useCouponStore()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const onSubmit = (data: any) => {
    // Mock upload process
    const newCoupon = {
      id: Math.random().toString(36).substr(2, 9),
      storeName: data.storeName,
      title: data.description.substring(0, 30) + '...', // Generate title from desc
      description: data.description,
      discount: data.discountValue,
      category: data.category,
      distance: 50, // Mock proximity
      expiryDate: data.expiryDate,
      image: file
        ? URL.createObjectURL(file)
        : 'https://img.usecurling.com/p/600/400?q=coupon',
      code: 'COMMUNITY-' + Math.floor(Math.random() * 1000),
      coordinates: { lat: 0, lng: 0 },
    }

    // @ts-expect-error
    addCoupon(newCoupon)
    setStep(2)
    toast.success('Doc enviado com sucesso!')
  }

  if (step === 2) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Obrigado por contribuir!</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Seu cupom foi enviado para análise e logo estará disponível para toda
          a comunidade. Você ganhou <strong>+50 pontos</strong> no ranking!
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
          <Button onClick={() => setStep(1)}>Enviar outro Doc</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Subir um Doc</CardTitle>
          <CardDescription>
            Encontrou uma oferta física? Tire uma foto e compartilhe com a
            comunidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30 hover:bg-muted/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium opacity-0 hover:opacity-100 transition-opacity">
                    Clique para alterar
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1">
                    Clique para fotografar ou arraste aqui
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Suporta JPG, PNG
                  </p>
                </>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input
                  id="storeName"
                  placeholder="Ex: Americanas"
                  {...register('storeName', { required: true })}
                />
                {errors.storeName && (
                  <span className="text-xs text-red-500">Obrigatório</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Valor do Desconto</Label>
                <Input
                  id="discountValue"
                  placeholder="Ex: 50% OFF ou R$ 20,00"
                  {...register('discountValue', { required: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Regras</Label>
              <Textarea
                id="description"
                placeholder="Descreva o produto e as condições da oferta..."
                className="resize-none"
                {...register('description', { required: true })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  type="date"
                  id="expiryDate"
                  {...register('expiryDate', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select onValueChange={(val) => setValue('category', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={!file}>
              {file ? 'Enviar Oferta' : 'Adicione uma foto para continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
