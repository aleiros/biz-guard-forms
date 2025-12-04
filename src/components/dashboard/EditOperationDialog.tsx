import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
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
  status: z.enum(['pendente', 'em_analise', 'aprovado', 'rejeitado', 'cancelado', 'aberto', 'liquidado', 'prejuizo_quitado', 'transferencia_prejuizo', 'repactuado']),
  pendencia: z.boolean(),
  pendente_malote: z.boolean(),
  pendencia_regularizacao: z.boolean(),
});

type CCBFormData = z.infer<typeof ccbSchema>;

interface Operation {
  id: string;
  pa: string;
  produto: string;
  limite: number;
  conta_corrente: string;
  nome: string;
  cpf_cnpj: string;
  numero_ccb: string;
  modalidade: string;
  status: string;
  pendencia: boolean;
  pendente_malote: boolean;
  pendencia_regularizacao: boolean;
}

interface EditOperationDialogProps {
  operation: Operation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditOperationDialog = ({ operation, open, onOpenChange, onSuccess }: EditOperationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CCBFormData>({
    pa: '',
    produto: '',
    limite: '',
    conta_corrente: '',
    nome: '',
    cpf_cnpj: '',
    numero_ccb: '',
    modalidade: 'capital_giro',
    status: 'aberto',
    pendencia: false,
    pendente_malote: false,
    pendencia_regularizacao: false,
  });

  useEffect(() => {
    if (operation) {
      setFormData({
        pa: operation.pa,
        produto: operation.produto,
        limite: formatCurrency(String(operation.limite * 100)),
        conta_corrente: operation.conta_corrente,
        nome: operation.nome,
        cpf_cnpj: formatCpfCnpj(operation.cpf_cnpj),
        numero_ccb: operation.numero_ccb,
        modalidade: operation.modalidade as CCBFormData['modalidade'],
        status: operation.status as CCBFormData['status'],
        pendencia: operation.pendencia,
        pendente_malote: operation.pendente_malote,
        pendencia_regularizacao: operation.pendencia_regularizacao,
      });
    }
  }, [operation]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operation) return;

    setIsLoading(true);

    try {
      const validated = ccbSchema.parse(formData);
      const limiteNumber = parseFloat(validated.limite.replace(/\./g, '').replace(',', '.'));

      const { error } = await supabase
        .from('ccb_operations')
        .update({
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
          pendente_malote: validated.pendente_malote,
          pendencia_regularizacao: validated.pendencia_regularizacao,
        })
        .eq('id', operation.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Operação CCB atualizada com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
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
          description: 'Erro ao atualizar operação. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Operação CCB</DialogTitle>
          <DialogDescription>Atualize os dados da operação de crédito</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-pa">PA</Label>
              <Input
                id="edit-pa"
                value={formData.pa}
                onChange={(e) => handleChange('pa', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-produto">Produto</Label>
              <Input
                id="edit-produto"
                value={formData.produto}
                onChange={(e) => handleChange('produto', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-limite">Limite (R$)</Label>
              <Input
                id="edit-limite"
                value={formData.limite}
                onChange={(e) => handleChange('limite', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-conta_corrente">Conta Corrente</Label>
              <Input
                id="edit-conta_corrente"
                value={formData.conta_corrente}
                onChange={(e) => handleChange('conta_corrente', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="edit-cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
                maxLength={18}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-numero_ccb">Número CCB</Label>
              <Input
                id="edit-numero_ccb"
                value={formData.numero_ccb}
                onChange={(e) => handleChange('numero_ccb', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-modalidade">Modalidade</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(value) => handleChange('modalidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="liquidado">Liquidado</SelectItem>
                  <SelectItem value="prejuizo_quitado">Prejuízo Quitado</SelectItem>
                  <SelectItem value="transferencia_prejuizo">Transf. Prejuízo</SelectItem>
                  <SelectItem value="repactuado">Repactuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <Checkbox
                id="edit-pendencia"
                checked={formData.pendencia}
                onCheckedChange={(checked) => handleChange('pendencia', checked as boolean)}
              />
              <Label htmlFor="edit-pendencia" className="cursor-pointer font-medium">
                Pendência
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
              <Checkbox
                id="edit-pendente_malote"
                checked={formData.pendente_malote}
                onCheckedChange={(checked) => handleChange('pendente_malote', checked as boolean)}
              />
              <Label htmlFor="edit-pendente_malote" className="cursor-pointer font-medium">
                Pendente Malote
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <Checkbox
                id="edit-pendencia_regularizacao"
                checked={formData.pendencia_regularizacao}
                onCheckedChange={(checked) => handleChange('pendencia_regularizacao', checked as boolean)}
              />
              <Label htmlFor="edit-pendencia_regularizacao" className="cursor-pointer font-medium">
                Pend. Regularização
              </Label>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOperationDialog;
