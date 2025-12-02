-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create status enum
CREATE TYPE public.operation_status AS ENUM ('pendente', 'em_analise', 'aprovado', 'rejeitado', 'cancelado');

-- Create modalidade enum
CREATE TYPE public.modalidade_type AS ENUM ('capital_giro', 'financiamento', 'emprestimo', 'credito_pessoal', 'consignado');

-- Create CCB operations table
CREATE TABLE public.ccb_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pa TEXT NOT NULL,
  produto TEXT NOT NULL,
  limite DECIMAL(15,2) NOT NULL,
  conta_corrente TEXT NOT NULL,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  numero_ccb TEXT NOT NULL,
  modalidade modalidade_type NOT NULL,
  status operation_status NOT NULL DEFAULT 'pendente',
  pendencia BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ccb_operations
ALTER TABLE public.ccb_operations ENABLE ROW LEVEL SECURITY;

-- CCB operations policies
CREATE POLICY "Users can view their own operations" 
ON public.ccb_operations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own operations" 
ON public.ccb_operations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own operations" 
ON public.ccb_operations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own operations" 
ON public.ccb_operations FOR DELETE 
USING (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ccb_operations_updated_at
  BEFORE UPDATE ON public.ccb_operations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();