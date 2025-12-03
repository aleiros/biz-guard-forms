-- Add new status values to enum
ALTER TYPE operation_status ADD VALUE IF NOT EXISTS 'aberto';
ALTER TYPE operation_status ADD VALUE IF NOT EXISTS 'liquidado';
ALTER TYPE operation_status ADD VALUE IF NOT EXISTS 'prejuizo_quitado';
ALTER TYPE operation_status ADD VALUE IF NOT EXISTS 'transferencia_prejuizo';
ALTER TYPE operation_status ADD VALUE IF NOT EXISTS 'repactuado';

-- Add new fields for tracking pending items
ALTER TABLE public.ccb_operations ADD COLUMN IF NOT EXISTS pendente_malote BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.ccb_operations ADD COLUMN IF NOT EXISTS pendencia_regularizacao BOOLEAN NOT NULL DEFAULT false;