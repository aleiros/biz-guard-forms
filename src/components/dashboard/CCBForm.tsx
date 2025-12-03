import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, FileText, Save } from 'lucide-react';
import ExcelPasteDialog from './ExcelPasteDialog';
import { z } from 'zod';

const ccbSchema = z.object({
  pa: z.string().min(1, 'PA é obrigatório'),
  produto: z.string().min(1, 'Produto é obrigatório'),
  limite: z.string().min(1, 'Limite é obrigatório'),
  conta_corrente: z.string().min(1, 'Conta corrente é obrigatória'),
  nome: z.string().min(2, 'Nome é obrigatório'),
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  numero_ccb: z.string().min(1, 'Número CCB é obrigatório'),
  modalidade: z.enum(['capital_giro', 'financiamento', 'emprestimo', 'credito_pessoal', 'consignado']),
  status: z.enum(['pendente', 'em_analise', 'aprovado', 'rejeitado', 'cancelado']),
  pendencia: z.boolean(),
});

type CCBFormData = z.infer<typeof ccbSchema>;

interface CCBFormProps {
  onSuccess?: () => void;
  defaultPa?: string | null;
}

const CCBForm = ({ onSuccess, defaultPa }: CCBFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CCBFormData>({
    pa: defaultPa || '',
    produto: '',
    limite: '',
    conta_corrente: '',
    nome: '',
    cpf_cnpj: '',
    numero_ccb: '',
    modalidade: 'capital_giro',
    status: 'pendente',
    pendencia: false,
  });

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleChange = (field: keyof CCBFormData, value: string | boolean) => {
    if (field === 'limite' && typeof value === 'string') {
      setFormData(prev => ({ ...prev, [field]: formatCurrency(value) }));
    } else if (field === 'cpf_cnpj' && typeof value === 'string') {
      setFormData(prev => ({ ...prev, [field]: formatCpfCnpj(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleExcelData = (data: Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      pa: data.pa || prev.pa,
      produto: data.produto || prev.produto,
      limite: data.limite ? formatCurrency(data.limite.replace(/\D/g, '')) : prev.limite,
      conta_corrente: data.conta_corrente || prev.conta_corrente,
      nome: data.nome || prev.nome,
      cpf_cnpj: data.cpf_cnpj ? formatCpfCnpj(data.cpf_cnpj) : prev.cpf_cnpj,
      numero_ccb: data.numero_ccb || prev.numero_ccb,
      pendencia: data.pendencia?.toLowerCase() === 'sim' || data.pendencia === '1' || data.pendencia?.toLowerCase() === 'true' || prev.pendencia,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar uma operação.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const validated = ccbSchema.parse(formData);
      
      // Parse limite to number
      const limiteNumber = parseFloat(validated.limite.replace(/\./g, '').replace(',', '.'));

      const { error } = await supabase.from('ccb_operations').insert({
        user_id: user.id,
        pa: validated.pa,
        produto: validated.produto,
        limite: limiteNumber,
        conta_corrente: validated.conta_corrente,
        nome: validated.nome,
        cpf_cnpj: validated.cpf_cnpj.replace(/\D/g, ''),
        numero_ccb: validated.numero_ccb,
        modalidade: validated.modalidade,
        status: validated.status,
        pendencia: validated.pendencia,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Operação CCB cadastrada com sucesso.',
      });

      // Reset form
      setFormData({
        pa: '',
        produto: '',
        limite: '',
        conta_corrente: '',
        nome: '',
        cpf_cnpj: '',
        numero_ccb: '',
        modalidade: 'capital_giro',
        status: 'pendente',
        pendencia: false,
      });

      onSuccess?.();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: err.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao cadastrar operação. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Nova Operação CCB</CardTitle>
              <CardDescription>Preencha os dados da operação de crédito</CardDescription>
            </div>
          </div>
          <ExcelPasteDialog onDataParsed={handleExcelData} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PA */}
            <div className="space-y-2">
              <Label htmlFor="pa">PA</Label>
              <Input
                id="pa"
                placeholder="Código PA"
                value={formData.pa}
                onChange={(e) => handleChange('pa', e.target.value)}
                required
              />
            </div>

            {/* Produto */}
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                placeholder="Nome do produto"
                value={formData.produto}
                onChange={(e) => handleChange('produto', e.target.value)}
                required
              />
            </div>

            {/* Limite */}
            <div className="space-y-2">
              <Label htmlFor="limite">Limite (R$)</Label>
              <Input
                id="limite"
                placeholder="0,00"
                value={formData.limite}
                onChange={(e) => handleChange('limite', e.target.value)}
                required
              />
            </div>

            {/* Conta Corrente */}
            <div className="space-y-2">
              <Label htmlFor="conta_corrente">Conta Corrente</Label>
              <Input
                id="conta_corrente"
                placeholder="Número da conta"
                value={formData.conta_corrente}
                onChange={(e) => handleChange('conta_corrente', e.target.value)}
                required
              />
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
              />
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                placeholder="000.000.000-00"
                value={formData.cpf_cnpj}
                onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
                maxLength={18}
                required
              />
            </div>

            {/* Número CCB */}
            <div className="space-y-2">
              <Label htmlFor="numero_ccb">Número CCB</Label>
              <Input
                id="numero_ccb"
                placeholder="Número da CCB"
                value={formData.numero_ccb}
                onChange={(e) => handleChange('numero_ccb', e.target.value)}
                required
              />
            </div>

            {/* Modalidade */}
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(value) => handleChange('modalidade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capital_giro">Capital de Giro</SelectItem>
                  <SelectItem value="financiamento">Financiamento</SelectItem>
                  <SelectItem value="emprestimo">Empréstimo</SelectItem>
                  <SelectItem value="credito_pessoal">Crédito Pessoal</SelectItem>
                  <SelectItem value="consignado">Consignado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pendência */}
          <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
            <Checkbox
              id="pendencia"
              checked={formData.pendencia}
              onCheckedChange={(checked) => handleChange('pendencia', checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="pendencia" className="cursor-pointer font-medium">
                Pendência
              </Label>
              <p className="text-sm text-muted-foreground">
                Marque se há alguma pendência na operação
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="gradient" 
            size="lg" 
            className="w-full md:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Operação
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CCBForm;
