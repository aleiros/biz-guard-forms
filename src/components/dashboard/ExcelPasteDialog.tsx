import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ClipboardPaste, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExcelPasteDialogProps {
  onDataParsed: (data: Record<string, string>) => void;
}

const ExcelPasteDialog = ({ onDataParsed }: ExcelPasteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');

  const parseExcelData = (data: string) => {
    // Excel data comes as tab-separated values
    const lines = data.trim().split('\n');
    const result: Record<string, string> = {};

    // Try to parse as key-value pairs (two columns)
    for (const line of lines) {
      const cells = line.split('\t');
      if (cells.length >= 2) {
        const key = cells[0].trim().toLowerCase();
        const value = cells[1].trim();
        
        // Map common field names
        if (key.includes('pa')) result.pa = value;
        else if (key.includes('produto')) result.produto = value;
        else if (key.includes('limite')) result.limite = value;
        else if (key.includes('conta') || key.includes('corrente')) result.conta_corrente = value;
        else if (key.includes('nome')) result.nome = value;
        else if (key.includes('cpf') || key.includes('cnpj')) result.cpf_cnpj = value;
        else if (key.includes('ccb') || key.includes('número')) result.numero_ccb = value;
        else if (key.includes('modalidade')) result.modalidade = value;
        else if (key.includes('status')) result.status = value;
        else if (key.includes('pendência') || key.includes('pendencia')) result.pendencia = value;
      }
    }

    // If no key-value pairs found, try single row with all values
    if (Object.keys(result).length === 0 && lines.length === 1) {
      const cells = lines[0].split('\t');
      if (cells.length >= 7) {
        result.pa = cells[0]?.trim() || '';
        result.produto = cells[1]?.trim() || '';
        result.limite = cells[2]?.trim() || '';
        result.conta_corrente = cells[3]?.trim() || '';
        result.nome = cells[4]?.trim() || '';
        result.cpf_cnpj = cells[5]?.trim() || '';
        result.numero_ccb = cells[6]?.trim() || '';
      }
    }

    return result;
  };

  const handlePaste = () => {
    if (!pastedData.trim()) {
      toast({
        title: 'Dados vazios',
        description: 'Cole os dados do Excel na caixa de texto.',
        variant: 'destructive',
      });
      return;
    }

    const parsed = parseExcelData(pastedData);
    
    if (Object.keys(parsed).length === 0) {
      toast({
        title: 'Formato não reconhecido',
        description: 'Não foi possível identificar os campos. Verifique o formato dos dados.',
        variant: 'destructive',
      });
      return;
    }

    onDataParsed(parsed);
    setPastedData('');
    setOpen(false);
    
    toast({
      title: 'Dados importados!',
      description: `${Object.keys(parsed).length} campos preenchidos automaticamente.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Colar do Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-primary" />
            Importar dados do Excel
          </DialogTitle>
          <DialogDescription>
            Copie os dados da planilha (Ctrl+C) e cole aqui (Ctrl+V)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Formatos aceitos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Duas colunas: Campo | Valor</li>
              <li>Uma linha: PA, Produto, Limite, Conta, Nome, CPF, CCB</li>
            </ul>
          </div>

          <Textarea
            placeholder="Cole os dados do Excel aqui..."
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handlePaste} type="button">
              <ClipboardPaste className="h-4 w-4" />
              Importar Dados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelPasteDialog;
