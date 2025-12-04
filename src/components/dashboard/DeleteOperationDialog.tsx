import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteOperationDialogProps {
  operationId: string | null;
  operationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteOperationDialog = ({ 
  operationId, 
  operationName,
  open, 
  onOpenChange, 
  onSuccess 
}: DeleteOperationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!operationId) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('ccb_operations')
        .delete()
        .eq('id', operationId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Operação CCB excluída com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir operação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Operação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a operação de <strong>{operationName}</strong>? 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOperationDialog;
