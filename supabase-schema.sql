-- ==============================================================================
-- Google Docs Lite - Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Front End Engineering-II Project Evaluation
-- ==============================================================================

-- 1. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Trigger to auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. DOCUMENTS TABLE
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled document',
  content text default '<p>Start writing...</p>',
  is_starred boolean default false not null,
  is_trashed boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.documents enable row level security;

-- Index for performant querying
create index if not exists idx_documents_owner on public.documents(owner_id);
create index if not exists idx_documents_updated on public.documents(updated_at desc);

-- 3. DOCUMENT SHARES TABLE (Collaborator Permissions)
create table if not exists public.document_shares (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  shared_with_email text not null,
  role text check (role in ('viewer', 'editor')) default 'viewer' not null,
  created_at timestamptz default now() not null,
  unique (document_id, shared_with_email)
);

alter table public.document_shares enable row level security;

create index if not exists idx_shares_doc on public.document_shares(document_id);
create index if not exists idx_shares_email on public.document_shares(shared_with_email);

-- 4. DOCUMENT VERSIONS (Version History / Snapshots)
create table if not exists public.document_versions (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  title text not null,
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null
);

alter table public.document_versions enable row level security;

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES FOR DOCUMENTS
-- ==============================================================================

-- SELECT Policy: Owners and invited users can read documents
create policy "Owners and shared users can view documents"
  on public.documents for select
  to authenticated
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.document_shares
      where document_shares.document_id = documents.id
      and lower(document_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
    )
  );

-- INSERT Policy: Authenticated users can insert documents owned by themselves
create policy "Users can create their own documents"
  on public.documents for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- UPDATE Policy: Owner or editors can update document
create policy "Owners and editor collaborators can update documents"
  on public.documents for update
  to authenticated
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.document_shares
      where document_shares.document_id = documents.id
      and lower(document_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
      and document_shares.role = 'editor'
    )
  );

-- DELETE Policy: Only document owners can delete
create policy "Only owners can delete documents"
  on public.documents for delete
  to authenticated
  using (owner_id = auth.uid());

-- POLICIES FOR SHARES
create policy "Document owners can manage shares"
  on public.document_shares for all
  to authenticated
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_shares.document_id
      and documents.owner_id = auth.uid()
    )
  );

create policy "Invited collaborators can view shares for shared docs"
  on public.document_shares for select
  to authenticated
  using (
    lower(shared_with_email) = lower(auth.jwt() ->> 'email')
  );

-- POLICIES FOR VERSIONS
create policy "Users with read access can view version history"
  on public.document_versions for select
  to authenticated
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_versions.document_id
      and (
        documents.owner_id = auth.uid() or
        exists (
          select 1 from public.document_shares
          where document_shares.document_id = documents.id
          and lower(document_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
        )
      )
    )
  );

create policy "Users with edit access can create versions"
  on public.document_versions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.documents
      where documents.id = document_versions.document_id
      and (
        documents.owner_id = auth.uid() or
        exists (
          select 1 from public.document_shares
          where document_shares.document_id = documents.id
          and lower(document_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
          and document_shares.role = 'editor'
        )
      )
    )
  );
